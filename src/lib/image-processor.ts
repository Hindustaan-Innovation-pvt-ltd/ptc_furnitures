import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getBrandLogo } from "./brand-logos";
import { readBrandWatermarks } from "./brand-watermarks";
import { StoredFile } from "./db-models";
import { connectToDatabase } from "./mongodb";

export async function removeWhiteBackground(
  imageBuffer: Buffer,
): Promise<Buffer> {
  try {
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Key out pixels that are very close to white/light gray with soft feathering
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const avg = (r + g + b) / 3;
      if (avg > 215) {
        if (avg > 235) {
          data[i + 3] = 0; // Fully transparent
        } else {
          // Linear alpha feathering to remove white borders smoothly
          const factor = (avg - 215) / (235 - 215);
          data[i + 3] = Math.round(data[i + 3] * (1 - factor));
        }
      }
    }

    return sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();
  } catch {
    return imageBuffer;
  }
}

export async function standardizeImage(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const targetSize = 800;
    return await sharp(imageBuffer)
      .trim()
      .resize({
        width: targetSize,
        height: targetSize,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  } catch {
    return imageBuffer;
  }
}

export async function compositeBrandWatermark(
  imageBuffer: Buffer,
  _brand?: string,
): Promise<Buffer> {
  // Watermark disabled by user request — return clean original image
  return imageBuffer;
}

export async function rewatermarkImage(
  source: string,
  brand: string,
): Promise<string> {
  try {
    let imageBuffer: Buffer | null = null;
    let isLocalUpload = false;
    let originalFilename = "";

    const uploadDir = path.join(process.cwd(), "public", "upload");
    await fs.mkdir(uploadDir, { recursive: true });

    const cleanSource = source.split("?")[0];

    if (cleanSource.startsWith("data:")) {
      const parts = cleanSource.split(",");
      imageBuffer = Buffer.from(parts[1], "base64");
    } else if (cleanSource.startsWith("/")) {
      try {
        const filePath = path.join(
          process.cwd(),
          "public",
          cleanSource.replace(/^\//, ""),
        );
        imageBuffer = await fs.readFile(filePath);
        isLocalUpload = true;
        originalFilename = path.basename(filePath);
      } catch (err: any) {
        console.error(
          "Failed to read local file for re-watermarking:",
          err.message,
        );
        if (cleanSource.startsWith("/upload/") || cleanSource.startsWith("/uploads/")) {
          try {
            console.log(`==> [rewatermarkImage] Local image not found: ${cleanSource}. Fetching remote fallback: https://ptcfurnitures.com${cleanSource}`);
            const res = await fetch(`https://ptcfurnitures.com${cleanSource}`);
            if (res.ok) {
              imageBuffer = Buffer.from(await res.arrayBuffer());
              isLocalUpload = true;
              originalFilename = path.basename(cleanSource);
            }
          } catch (fetchErr: any) {
            console.error(`==> [rewatermarkImage] Failed to fetch remote fallback image:`, fetchErr.message);
          }
        }
      }
    } else {
      // It is a remote URL or base64 data URI from MongoDB — fetch it
      const res = await fetch(cleanSource);
      if (res.ok) {
        imageBuffer = Buffer.from(await res.arrayBuffer());
      }
    }

    if (isLocalUpload && originalFilename) {
      const ext = originalFilename.split(".").pop() || "png";
      const lastDotIndex = originalFilename.lastIndexOf(".");
      const baseName =
        lastDotIndex !== -1
          ? originalFilename.substring(0, lastDotIndex)
          : originalFilename;

      let checkOrigFilename = "";
      if (baseName.endsWith("_original")) {
        checkOrigFilename = originalFilename;
      } else {
        checkOrigFilename = `${baseName}_original.${ext}`;
      }

      const origFilePath = path.join(uploadDir, checkOrigFilename);
      try {
        const origBuffer = await fs.readFile(origFilePath);
        imageBuffer = origBuffer;
        originalFilename = checkOrigFilename;
      } catch {
        if (cleanSource.startsWith("/upload/") || cleanSource.startsWith("/uploads/")) {
          try {
            const remoteOrigUrl = `https://ptcfurnitures.com/upload/${checkOrigFilename}`;
            console.log(`==> [rewatermarkImage] Local original image not found. Fetching remote original: ${remoteOrigUrl}`);
            const res = await fetch(remoteOrigUrl);
            if (res.ok) {
              imageBuffer = Buffer.from(await res.arrayBuffer());
              originalFilename = checkOrigFilename;
            }
          } catch (fetchErr: any) {
            console.error(`==> [rewatermarkImage] Failed to fetch remote original image:`, fetchErr.message);
          }
        }
      }
    }

    if (!imageBuffer) {
      return source;
    }

    // 1. Remove background
    const bgRemoved = await removeWhiteBackground(imageBuffer);
    const standardizedBgRemoved = await standardizeImage(bgRemoved);

    // 2. Add brand watermark
    const watermarked = await compositeBrandWatermark(
      standardizedBgRemoved,
      brand,
    );

    if (
      isLocalUpload &&
      originalFilename &&
      originalFilename.includes("_original")
    ) {
      const filename = originalFilename
        .replace("_original", "")
        .replace(/\.[^.]+$/, ".webp");
      const filePath = path.join(uploadDir, filename);
      // Re-save as WebP for optimized file size
      await sharp(watermarked)
        .webp({ quality: 90, lossless: false })
        .toFile(filePath);

      // Also save the trimmed, standardized background-removed image
      const origFilePath = path.join(uploadDir, originalFilename);
      await sharp(standardizedBgRemoved)
        .webp({ quality: 92, lossless: false })
        .toFile(origFilePath);

      return `/upload/${filename}?v=${Date.now()}`;
    } else {
      const uniqueId = crypto.randomUUID();
      const filename = `${uniqueId}.webp`;
      const origFilename = `${uniqueId}_original.webp`;

      await sharp(watermarked)
        .webp({ quality: 90, lossless: false })
        .toFile(path.join(uploadDir, filename));
      await sharp(standardizedBgRemoved)
        .webp({ quality: 92, lossless: false })
        .toFile(path.join(uploadDir, origFilename));

      return `/upload/${filename}?v=${Date.now()}`;
    }
  } catch (err: any) {
    console.error("Failed to rewatermark image:", err.message);
    return source;
  }
}
