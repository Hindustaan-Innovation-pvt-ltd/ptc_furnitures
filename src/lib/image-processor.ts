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

export async function compositeBrandWatermark(
  imageBuffer: Buffer,
  brand: string,
): Promise<Buffer> {
  let logo = await getBrandLogo(brand);

  // Fallback to PTC logo as default watermark
  if (!logo) {
    logo = await getBrandLogo("PTC");
  }

  if (!logo) {
    return imageBuffer;
  }

  try {
    let logoBuffer: Buffer;

    // Decode or load logo buffer
    if (logo.src.startsWith("data:")) {
      const base64Data = logo.src.split(",")[1];
      logoBuffer = Buffer.from(base64Data, "base64");
    } else if (logo.src.startsWith("/api/images")) {
      const urlObj = new URL(logo.src, "http://localhost");
      const fileId = urlObj.searchParams.get("id");
      if (!fileId) return imageBuffer;
      await connectToDatabase();
      const storedFile = await StoredFile.findById(fileId);
      if (!storedFile) return imageBuffer;
      logoBuffer = Buffer.from(storedFile.data);
    } else {
      // Legacy: read from public folder
      const logoPath = path.join(
        process.cwd(),
        "public",
        logo.src.replace(/^\//, ""),
      );
      logoBuffer = await fs.readFile(logoPath);
    }

    // Standardize/resize the input image buffer to a uniform 800x800 square transparent canvas first
    const targetSize = 800;
    const standardizedImageBuffer = await sharp(imageBuffer)
      .resize({
        width: targetSize,
        height: targetSize,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Every watermark must be of the exact same size (200px)
    const watermarkSize = 200;

    // Look up the configured opacity for this brand (0-100 scale, default 30)
    const watermarks = readBrandWatermarks();
    const normalizedBrand = brand.trim();
    const brandWatermark = watermarks[normalizedBrand];
    const opacityPct = brandWatermark?.opacity ?? 40;
    const opacityFactor = Math.max(0, Math.min(100, opacityPct)) / 100;

    // Use .trim() to strip transparent margins around the logo to make sizes optically identical
    const resizedOverlay = await sharp(logoBuffer)
      .trim()
      .resize({
        width: watermarkSize,
        height: watermarkSize,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .png()
      .toBuffer();

    // Apply configured opacity by scaling each pixel's alpha channel
    const { data: rawData, info: rawInfo } = await sharp(resizedOverlay)
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let i = 3; i < rawData.length; i += 4) {
      rawData[i] = Math.round(rawData[i] * opacityFactor);
    }
    const overlay = await sharp(rawData, {
      raw: { width: rawInfo.width, height: rawInfo.height, channels: 4 },
    })
      .png()
      .toBuffer();

    // Mathematically calculate exact center positioning on the 800x800 standardized canvas
    const logoLeft = Math.round((targetSize - watermarkSize) / 2); // 300px
    const logoTop = Math.round((targetSize - watermarkSize) / 2); // 300px

    return sharp(standardizedImageBuffer)
      .composite([
        {
          input: overlay,
          left: logoLeft,
          top: logoTop,
        },
      ])
      .png()
      .toBuffer();
  } catch {
    return imageBuffer;
  }
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
        // use existing buffer
      }
    }

    if (!imageBuffer) {
      return source;
    }

    // 1. Remove background
    const bgRemoved = await removeWhiteBackground(imageBuffer);

    // 2. Add brand watermark
    const watermarked = await compositeBrandWatermark(bgRemoved, brand);

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
      return `/upload/${filename}?v=${Date.now()}`;
    } else {
      const uniqueId = crypto.randomUUID();
      const filename = `${uniqueId}.webp`;
      const origFilename = `${uniqueId}_original.webp`;

      await sharp(watermarked)
        .webp({ quality: 90, lossless: false })
        .toFile(path.join(uploadDir, filename));
      await sharp(bgRemoved)
        .webp({ quality: 92, lossless: false })
        .toFile(path.join(uploadDir, origFilename));

      return `/upload/${filename}?v=${Date.now()}`;
    }
  } catch (err: any) {
    console.error("Failed to rewatermark image:", err.message);
    return source;
  }
}
