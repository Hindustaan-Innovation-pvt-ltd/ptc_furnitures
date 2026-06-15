import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getBrandLogo, setBrandLogo } from "@/lib/brand-logos";
import { Product } from "@/lib/db-models";
import { rewatermarkImage } from "@/lib/image-processor";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const brand = String(form.get("brand") ?? "").trim();
    const file = form.get("file") as File | null;

    if (!brand) {
      return NextResponse.json(
        { error: "Brand is required." },
        { status: 400 },
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "Logo file is required." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the logo with sharp (convert to WebP for faster loading)
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 90, lossless: false })
      .toBuffer();

    // Save the logo file directly to public/upload/ directory
    const uploadDir = path.join(process.cwd(), "public", "upload");
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueId = crypto.randomUUID();
    const filename = `logo_${uniqueId}.webp`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, webpBuffer);
    const logoSrc = `/upload/${filename}`;

    const logo = (await getBrandLogo(brand)) ?? {
      brand,
      src: logoSrc,
      alt: `${brand} logo`,
      aliases: [brand.toLowerCase()],
    };

    // Always update the src to the new file URL
    logo.src = logoSrc;

    // Persist in MongoDB database
    await connectToDatabase();
    await setBrandLogo(brand, logo);

    // Re-watermark all products belonging to this brand instantly using their pristine originalImages!
    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const productsToUpdate = await Product.find({
      brand: { $regex: new RegExp(`^${escapedBrand}$`, "i") },
    });
    console.log(
      `==> [Brand Logo Update] Re-applying new watermark for brand "${brand}" onto ${productsToUpdate.length} products...`,
    );

    for (const prod of productsToUpdate) {
      const originalImages =
        prod.originalImages && prod.originalImages.length > 0
          ? prod.originalImages
          : prod.images;

      if (!Array.isArray(originalImages)) {
        console.warn(
          `==> [Brand Logo Update] Skipping product ${prod.id || "unknown"} - originalImages is not an array`,
        );
        continue;
      }

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

    return NextResponse.json({ brand, src: logo.src });
  } catch (error) {
    console.error("==> [Brand Logo POST Error]:", error);
    const message =
      error instanceof Error ? error.message : "Unable to save brand logo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
