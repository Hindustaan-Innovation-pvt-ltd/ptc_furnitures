import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import sharp from "sharp";
import { connectToDatabase } from "../src/lib/mongodb";
import { Product, StoredFile } from "../src/lib/db-models";
import { removeWhiteBackground, compositeBrandWatermark } from "../src/lib/image-processor";

// 1. Manually load environment variables from .env if needed
async function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const content = await fs.readFile(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        const val = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, "");
        process.env[key] = val;
      }
    }
    console.log("==> Loaded environment variables from .env");
  } catch (err: any) {
    console.log("==> No .env file found or failed to read: ", err.message);
  }
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
      if (response.status !== 423) {
        break;
      }
    } catch (err: any) {
      console.error(`Fetch attempt ${attempt + 1} failed: ${err.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return null;
}

async function loadSourceBuffer(source: string): Promise<Buffer | null> {
  try {
    if (source.startsWith("data:")) {
      const base64Data = source.split(",")[1];
      if (base64Data) {
        return Buffer.from(base64Data, "base64");
      }
      return null;
    }

    if (source.startsWith("/api/images")) {
      const urlObj = new URL(source, "http://localhost");
      const fileId = urlObj.searchParams.get("id");
      if (fileId) {
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
      const localPath = path.join(process.cwd(), "public", source.replace(/^\//, ""));
      return await fs.readFile(localPath);
    }
  } catch (error) {
    console.error(`Failed to load source buffer for "${source.substring(0, 100)}":`, error);
  }
  return null;
}

async function run() {
  await loadEnv();
  
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/furnitures";
  console.log(`==> Connecting to MongoDB: ${MONGODB_URI}`);
  await connectToDatabase();
  console.log("==> Connected successfully.");

  const uploadDir = path.join(process.cwd(), "public", "upload");
  await fs.mkdir(uploadDir, { recursive: true });

  const products = await Product.find({});
  console.log(`==> Found ${products.length} products to check/migrate.`);

  let migratedProductsCount = 0;
  let migratedImagesCount = 0;

  for (let pIdx = 0; pIdx < products.length; pIdx++) {
    const product = products[pIdx];
    const brand = product.brand || "";
    let modified = false;

    // We align images and originalImages arrays
    const originalList = product.originalImages && product.originalImages.length > 0
      ? [...product.originalImages]
      : [...product.images];

    const imagesList = [...product.images];

    // Ensure they have the same length
    while (originalList.length < imagesList.length) {
      originalList.push(imagesList[originalList.length]);
    }

    const newOriginalImages: string[] = [];
    const newImages: string[] = [];

    console.log(`[${pIdx + 1}/${products.length}] Checking product "${product.name || 'Unnamed'}" (${product.id}, brand: "${brand}")...`);

    for (let i = 0; i < originalList.length; i++) {
      const origSource = originalList[i];
      const currentWatermarked = imagesList[i];

      // Check if either is base64 or remote URL or StoredFile
      const needsMigration = (src: string) => {
        if (!src) return false;
        if (src.startsWith("data:")) return true;
        if (src.startsWith("http://") || src.startsWith("https://")) return true;
        if (src.startsWith("/api/images")) return true;
        return false;
      };

      if (needsMigration(origSource) || needsMigration(currentWatermarked)) {
        console.log(`  -> Image ${i + 1} needs migration. Source starts with: ${origSource.substring(0, 50)}...`);
        
        // Load original unwatermarked buffer if possible
        let sourceBuffer = await loadSourceBuffer(origSource);
        
        // If unwatermarked is not loadable or same as watermarked, try watermarked
        if (!sourceBuffer && currentWatermarked) {
          sourceBuffer = await loadSourceBuffer(currentWatermarked);
        }

        if (!sourceBuffer) {
          console.error(`  [ERROR] Could not load image buffer for index ${i} on product ${product.id}`);
          // Keep whatever was there
          newOriginalImages.push(origSource);
          newImages.push(currentWatermarked);
          continue;
        }

        try {
          // Process white background removal
          const bgRemoved = await removeWhiteBackground(sourceBuffer);

          // Add brand watermark
          const watermarked = await compositeBrandWatermark(bgRemoved, brand);

          const uniqueId = crypto.randomUUID();
          const filename = `${uniqueId}.webp`;
          const originalFilename = `${uniqueId}_original.webp`;

          const filePath = path.join(uploadDir, filename);
          const originalFilePath = path.join(uploadDir, originalFilename);

          // Save both as optimized webp
          await sharp(watermarked)
            .webp({ quality: 90, lossless: false })
            .toFile(filePath);

          await sharp(bgRemoved)
            .webp({ quality: 92, lossless: false })
            .toFile(originalFilePath);

          newOriginalImages.push(`/upload/${originalFilename}`);
          newImages.push(`/upload/${filename}`);
          
          migratedImagesCount++;
          modified = true;
          console.log(`  -> Migrated and saved to /upload/${filename}`);
        } catch (err: any) {
          console.error(`  [ERROR] Processing failed: ${err.message}`);
          newOriginalImages.push(origSource);
          newImages.push(currentWatermarked);
        }
      } else {
        // Already migrated or local
        newOriginalImages.push(origSource);
        newImages.push(currentWatermarked);
      }
    }

    if (modified) {
      product.images = newImages;
      product.originalImages = newOriginalImages;
      product.markModified("images");
      product.markModified("originalImages");
      await product.save();
      migratedProductsCount++;
      console.log(`  [SUCCESS] Product "${product.name || 'Unnamed'}" updated in DB.`);
    }
  }

  console.log("\n==========================================");
  console.log("Migration Complete!");
  console.log(`Total Products Migrated/Updated: ${migratedProductsCount}`);
  console.log(`Total Images Migrated: ${migratedImagesCount}`);
  console.log("==========================================");
  
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed with error:", err);
  process.exit(1);
});
