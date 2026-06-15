import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  type BrandWatermark,
  readBrandWatermarks,
  setBrandWatermark,
} from "@/lib/brand-watermarks";
import { Product } from "@/lib/db-models";
import { rewatermarkImage } from "@/lib/image-processor";

async function syncBrandProducts(brand: string) {
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const productsToUpdate = await Product.find({
    brand: { $regex: new RegExp(`^${escapedBrand}$`, "i") },
  });
  console.log(
    `==> [Brand Watermark Update] Re-applying new watermark configuration for brand "${brand}" onto ${productsToUpdate.length} products...`,
  );

  for (const prod of productsToUpdate) {
    const originalImages =
      prod.originalImages && prod.originalImages.length > 0
        ? prod.originalImages
        : prod.images;

    const newImages: string[] = [];
    for (const img of originalImages) {
      const rewatermarked = await rewatermarkImage(img, brand);
      newImages.push(rewatermarked);
    }

    await Product.updateOne(
      { id: prod.id },
      {
        $set: {
          images: newImages,
          originalImages: originalImages,
        },
      },
    );
  }
}

async function invalidateImageCacheForBrand(brand: string) {
  try {
    const cleanBrand = brand.replace(/[^a-zA-Z0-9_-]/g, "_");
    const cacheDir = path.join(process.cwd(), "public", "upload", "cache");
    const files = await fs.readdir(cacheDir);
    const suffix = `_${cleanBrand}.png`;
    for (const file of files) {
      if (file.endsWith(suffix)) {
        await fs.unlink(path.join(cacheDir, file));
      }
    }
  } catch (err) {
    // Ignore if cache directory does not exist or error occurs
  }
}

export async function GET() {
  const map = readBrandWatermarks();
  return NextResponse.json({ watermarks: map });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.startsWith("multipart/form-data")) {
      const form = await request.formData();
      const brand = String(form.get("brand") ?? "").trim();
      const file = form.get("file") as File | null;

      if (!brand) {
        return NextResponse.json(
          { error: "Brand is required" },
          { status: 400 },
        );
      }

      if (!file) {
        return NextResponse.json(
          { error: "File is required" },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadDir = path.join(process.cwd(), "public", "upload");
      await fs.mkdir(uploadDir, { recursive: true });

      const extension = file.name.split(".").pop() || "png";
      const uniqueId = crypto.randomUUID();
      const filename = `watermark_${uniqueId}.${extension}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, buffer);
      const uploadedUrl = `/upload/${filename}`;

      const size = String(form.get("size") ?? "medium");
      const opacity = Number(form.get("opacity") ?? 20);
      const position = String(form.get("position") ?? "center");
      const allowedPositions: NonNullable<BrandWatermark["position"]>[] = [
        "center",
        "north",
        "south",
        "east",
        "west",
        "north_east",
        "north_west",
        "south_east",
        "south_west",
      ];
      const safePosition = allowedPositions.includes(
        position as NonNullable<BrandWatermark["position"]>,
      )
        ? (position as NonNullable<BrandWatermark["position"]>)
        : "center";

      const wm: BrandWatermark = {
        url: uploadedUrl,
        size: (size as BrandWatermark["size"]) ?? "medium",
        opacity: Number.isFinite(opacity)
          ? Math.max(0, Math.min(100, opacity))
          : 20,
        position: safePosition,
      };

      await setBrandWatermark(brand, wm);
      await syncBrandProducts(brand);
      await invalidateImageCacheForBrand(brand);

      return NextResponse.json({ brand, watermark: wm });
    }

    const body = await request.json();
    const brand = String(body.brand ?? "").trim();
    const watermarkUrl = String(body.watermark ?? "").trim();
    const size = String(body.size ?? "medium");
    const opacity = Number(body.opacity ?? 80);
    const position = String(body.position ?? "center");
    const allowedPositions: NonNullable<BrandWatermark["position"]>[] = [
      "center",
      "north",
      "south",
      "east",
      "west",
      "north_east",
      "north_west",
      "south_east",
      "south_west",
    ];
    const safePosition = allowedPositions.includes(
      position as NonNullable<BrandWatermark["position"]>,
    )
      ? (position as NonNullable<BrandWatermark["position"]>)
      : "center";

    if (!brand || !watermarkUrl) {
      return NextResponse.json(
        { error: "brand and watermark are required" },
        { status: 400 },
      );
    }

    const wm: BrandWatermark = {
      url: watermarkUrl,
      size: (size as BrandWatermark["size"]) ?? "medium",
      opacity: Number.isFinite(opacity)
        ? Math.max(0, Math.min(100, opacity))
        : 80,
      position: safePosition,
    };

    await setBrandWatermark(brand, wm);
    await syncBrandProducts(brand);
    await invalidateImageCacheForBrand(brand);
    return NextResponse.json({ brand, watermark: wm });
  } catch (err: any) {
    console.error("==> [Watermarks POST Error]:", err);
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 },
    );
  }
}
