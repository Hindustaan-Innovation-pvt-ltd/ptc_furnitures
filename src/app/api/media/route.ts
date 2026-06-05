import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { StoredFile } from "@/lib/db-models";
import {
  compositeBrandWatermark,
  removeWhiteBackground,
} from "@/lib/image-processor";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Legacy media proxy — kept for backward-compatibility with:
 *   - Old product records that reference external `https://` URLs (e.g. Cloudinary).
 *   - Old `/api/images?id=…` (GridFS/StoredFile) references that need re-processing.
 *
 * All new product images are stored as `/upload/uuid.webp` on disk and served
 * directly by Next.js static file serving — no proxy needed for them.
 *
 * Query params:
 *   ?src=<url-encoded-source>         — process and return image from any URL or local path
 *   ?removeBackground=0               — skip background removal (default: do remove)
 */
async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetch(url, { cache: "no-store" });

    if (response.ok && response.body) {
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    if (response.status !== 423 || attempt === 7) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return null;
}

async function loadSourceBuffer(source: string): Promise<Buffer | null> {
  try {
    // Directly decode Base64 data URIs
    if (source.startsWith("data:")) {
      const base64Data = source.split(",")[1];
      if (base64Data) {
        return Buffer.from(base64Data, "base64");
      }
      return null;
    }

    // Directly fetch from MongoDB if it's a local /api/images URL
    if (source.startsWith("/api/images")) {
      const urlObj = new URL(source, "http://localhost");
      const fileId = urlObj.searchParams.get("id");
      if (fileId) {
        await connectToDatabase();
        const storedFile = await StoredFile.findById(fileId);
        if (storedFile) {
          return Buffer.from(storedFile.data);
        }
      }
      return null;
    }

    if (source.startsWith("http://") || source.startsWith("https://")) {
      return await fetchImageBuffer(source);
    }

    if (source.startsWith("/")) {
      return await fs.readFile(
        path.join(process.cwd(), "public", source.replace(/^\//, "")),
      );
    }
  } catch (error) {
    console.error("Failed to load source buffer:", error);
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const legacySource = requestUrl.searchParams.get("src");
    const removeBackground =
      requestUrl.searchParams.get("removeBackground") !== "0";

    // The old ?id=<hash> lookup path is retired — callers should use ?src=<url> instead.
    // Return 410 Gone so callers know to update.
    if (requestUrl.searchParams.has("id") && !legacySource) {
      return NextResponse.json(
        {
          error:
            "The ?id= hash lookup is no longer supported. Images are now served directly from /upload/. Use ?src=<url-encoded-source> for legacy remote images.",
        },
        { status: 410 },
      );
    }

    if (!legacySource) {
      return NextResponse.json(
        { error: "Missing image source. Provide ?src=<url-encoded-source>." },
        { status: 400 },
      );
    }

    // Check disk cache first
    const { createHash } = await import("node:crypto");
    const effectiveId = createHash("sha256").update(legacySource).digest("hex");
    const cacheDir = path.join(process.cwd(), "public", "upload", "cache");
    const cacheFileName = `${effectiveId}_${removeBackground ? "bg" : "nobg"}.png`;
    const cacheFilePath = path.join(cacheDir, cacheFileName);

    try {
      const cachedData = await fs.readFile(cacheFilePath);
      const headers = new Headers();
      headers.set("content-type", "image/png");
      headers.set("cache-control", "public, max-age=31536000, immutable");
      headers.set("content-disposition", "inline");
      headers.set("x-robots-tag", "noindex, nofollow, noimageindex");
      headers.set("cross-origin-resource-policy", "same-site");
      return new NextResponse(new Uint8Array(cachedData), {
        status: 200,
        headers,
      });
    } catch {
      // Not cached — proceed to process
    }

    // Load original image buffer
    let upstreamBuffer = await loadSourceBuffer(legacySource);

    if (!upstreamBuffer) {
      return NextResponse.json(
        { error: "Unable to load image." },
        { status: 502 },
      );
    }

    // Remove white background if requested
    if (removeBackground) {
      upstreamBuffer = await removeWhiteBackground(upstreamBuffer);
    }

    // Composite default PTC watermark (no brand context for legacy calls)
    const finalBuffer = await compositeBrandWatermark(upstreamBuffer, "");

    // Save to disk cache
    try {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheFilePath, finalBuffer);
    } catch (cacheErr) {
      console.error("Failed to write image cache:", cacheErr);
    }

    const headers = new Headers();
    headers.set("content-type", "image/png");
    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("content-disposition", "inline");
    headers.set("x-robots-tag", "noindex, nofollow, noimageindex");
    headers.set("cross-origin-resource-policy", "same-site");

    return new NextResponse(new Uint8Array(finalBuffer), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process image." },
      { status: 500 },
    );
  }
}
