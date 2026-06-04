import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { StoredFile } from "@/lib/db-models";
import {
  compositeBrandWatermark,
  removeWhiteBackground,
} from "@/lib/image-processor";
import { connectToDatabase } from "@/lib/mongodb";
import { readProducts } from "@/lib/products";

type ResolvedImage = {
  source: string;
  brand: string;
};

function hashSource(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

async function resolveSourceById(id: string): Promise<ResolvedImage | null> {
  const products = await readProducts();

  for (const product of products) {
    // Check original images first since they hold pristine unwatermarked URLs
    if (product.originalImages) {
      for (const image of product.originalImages) {
        if (hashSource(image) === id) {
          return { source: image, brand: product.brand };
        }
      }
    }
    // Fallback to currently watermarked base64 images
    for (const image of product.images) {
      if (hashSource(image) === id) {
        return { source: image, brand: product.brand };
      }
    }
  }

  return null;
}

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
    const mediaId = requestUrl.searchParams.get("id");
    const removeBackground =
      requestUrl.searchParams.get("removeBackground") !== "0";

    const resolved = legacySource
      ? { source: legacySource, brand: "" }
      : mediaId
        ? await resolveSourceById(mediaId)
        : null;

    if (!resolved) {
      return NextResponse.json(
        { error: "Missing image source." },
        { status: 400 },
      );
    }

    const { source, brand } = resolved;

    // Check disk cache first!
    const effectiveId = mediaId || hashSource(source);
    const cleanBrand = brand ? brand.replace(/[^a-zA-Z0-9_-]/g, "_") : "nobrand";
    const cacheFileName = `${effectiveId}_${removeBackground ? "bg" : "nobg"}_${cleanBrand}.png`;
    const cacheDir = path.join(process.cwd(), "public", "upload", "cache");
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
      // Proceed to load source and process it
    }

    // Load original image buffer
    let upstreamBuffer = await loadSourceBuffer(source);

    if (!upstreamBuffer) {
      return NextResponse.json(
        { error: "Unable to load image." },
        { status: 502 },
      );
    }

    // Locally remove white background using sharp if removeBackground is true
    if (removeBackground) {
      upstreamBuffer = await removeWhiteBackground(upstreamBuffer);
    }

    // Composite the brand watermark locally using sharp (placed from the top!)
    const finalBuffer = await compositeBrandWatermark(upstreamBuffer, brand);

    // Save to disk cache!
    try {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheFilePath, finalBuffer);
    } catch (cacheErr) {
      console.error("Failed to write image cache:", cacheErr);
    }

    const headers = new Headers();
    headers.set("content-type", "image/png");
    // Long-lived browser caching!
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
