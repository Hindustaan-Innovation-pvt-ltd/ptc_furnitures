import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getBrandLogo } from "@/lib/brand-logos";
import { readProducts } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  if (source.startsWith("http://") || source.startsWith("https://")) {
    return fetchImageBuffer(source);
  }

  if (source.startsWith("/")) {
    try {
      return fs.readFile(path.join(process.cwd(), "public", source.replace(/^\//, "")));
    } catch {
      return null;
    }
  }

  return null;
}

function buildBackgroundRemovedCloudinaryUrl(source: string): string | null {
  try {
    const url = new URL(source);
    const segments = url.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.indexOf("upload");

    if (uploadIndex < 0) {
      return null;
    }

    const transformedSegments = [
      ...segments.slice(0, uploadIndex + 1),
      "e_background_removal,f_png",
      ...segments.slice(uploadIndex + 1).map((segment, index, list) => {
        if (index !== list.length - 1) {
          return segment;
        }

        return segment.replace(/\.[^.]+$/, ".png");
      }),
    ];

    url.pathname = `/${transformedSegments.join("/")}`;
    return url.toString();
  } catch {
    return null;
  }
}

async function compositeBrandWatermark(imageBuffer: Buffer, brand: string): Promise<Buffer> {
  const logo = getBrandLogo(brand);

  if (!logo) {
    return imageBuffer;
  }

  const logoPath = path.join(process.cwd(), "public", logo.src.replace(/^\//, ""));

  try {
    const [sourceMeta, logoBuffer] = await Promise.all([
      sharp(imageBuffer).metadata(),
      fs.readFile(logoPath),
    ]);

    const sourceWidth = sourceMeta.width ?? 0;
    const watermarkWidth = sourceWidth > 0 ? Math.max(120, Math.min(420, Math.round(sourceWidth * 0.22))) : 220;

    const overlay = await sharp(logoBuffer)
      .resize({ width: watermarkWidth, fit: "contain" })
      .png()
      .toBuffer();

    return sharp(imageBuffer)
      .composite([
        {
          input: overlay,
          gravity: "centre",
        },
      ])
      .png()
      .toBuffer();
  } catch {
    return imageBuffer;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const legacySource = requestUrl.searchParams.get("src");
  const mediaId = requestUrl.searchParams.get("id");
  const removeBackground = requestUrl.searchParams.get("removeBackground") !== "0";

  const resolved = legacySource ? { source: legacySource, brand: "" } : mediaId ? await resolveSourceById(mediaId) : null;

  if (!resolved) {
    return NextResponse.json({ error: "Missing image source." }, { status: 400 });
  }

  const { source, brand } = resolved;

  const cloudinaryUrls = removeBackground
    ? [buildBackgroundRemovedCloudinaryUrl(source)]
    : [source];

  const upstreamBuffer = await (async () => {
    for (const candidateUrl of cloudinaryUrls) {
      if (!candidateUrl) {
        continue;
      }

      const buffer = await fetchImageBuffer(candidateUrl);

      if (buffer) {
        return buffer;
      }
    }

    if (!isCloudinarySource(source)) {
      return loadSourceBuffer(source);
    }

    return null;
  })();

  if (!upstreamBuffer) {
    return NextResponse.json(
      { error: "Unable to load image." },
      { status: 502 },
    );
  }

  const finalBuffer = await compositeBrandWatermark(upstreamBuffer, brand);

  const headers = new Headers();
  headers.set("content-type", "image/png");
  headers.set("cache-control", "private, no-store, max-age=0");
  headers.set("content-disposition", "inline");
  headers.set("x-robots-tag", "noindex, nofollow, noimageindex");
  headers.set("cross-origin-resource-policy", "same-site");

  return new NextResponse(new Uint8Array(finalBuffer), {
    status: 200,
    headers,
  });
}

function isCloudinarySource(source: string): boolean {
  return source.startsWith("http://") || source.startsWith("https://");
}