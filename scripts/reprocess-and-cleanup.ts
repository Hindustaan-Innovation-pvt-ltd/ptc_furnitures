import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// 1. Manually load environment variables from .env BEFORE any imports that access process.env
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
        const val = trimmed
          .substring(index + 1)
          .trim()
          .replace(/^['"]|['"]$/g, "");
        process.env[key] = val;
      }
    }
    console.log("==> Loaded environment variables from .env");
  } catch (err: any) {
    console.log("==> No .env file found or failed to read: ", err.message);
  }
}

async function main() {
  await loadEnv();

  // Now dynamically import the database modules, so they read the loaded process.env
  const { connectToDatabase } = await import("../src/lib/mongodb");
  const { Product, BrandLogoModel } = await import("../src/lib/db-models");
  const { standardizeImage, compositeBrandWatermark } = await import(
    "../src/lib/image-processor"
  );
  const { default: mongoose } = await import("mongoose");

  await connectToDatabase();

  const uploadDir = path.join(process.cwd(), "public", "upload");
  await fs.mkdir(uploadDir, { recursive: true });

  console.log("Fetching all products...");
  const products = await Product.find({});
  console.log(`Found ${products.length} products.`);

  console.log("Fetching all brand logos...");
  const logos = await BrandLogoModel.find({});
  console.log(`Found ${logos.length} brand logos.`);

  // Sets to track referenced files (only basename)
  const referencedImages = new Set<string>();
  const referencedLogos = new Set<string>();

  // Collect logo filenames
  for (const logo of logos) {
    if (logo.src && logo.src.startsWith("/upload/")) {
      const filename = path.basename(logo.src.split("?")[0]);
      referencedLogos.add(filename);
    }
  }

  // Collect product image filenames
  for (const p of products) {
    const allImgs = [...(p.images || []), ...(p.originalImages || [])];
    for (const img of allImgs) {
      if (img && img.startsWith("/upload/")) {
        const filename = path.basename(img.split("?")[0]);
        referencedImages.add(filename);
        // Also add its counterpart if applicable (e.g. standard vs _original)
        if (filename.includes("_original")) {
          const stdName = filename.replace("_original", "");
          referencedImages.add(stdName);
        } else {
          const ext = filename.split(".").pop() || "webp";
          const lastDotIndex = filename.lastIndexOf(".");
          const baseName =
            lastDotIndex !== -1
              ? filename.substring(0, lastDotIndex)
              : filename;
          const origName = `${baseName}_original.${ext}`;
          referencedImages.add(origName);
        }
      }
    }
  }

  console.log(
    `Collected ${referencedImages.size} referenced product image files and ${referencedLogos.size} referenced brand logo files.`,
  );

  // Reprocess existing product images to trim, standardize and composite watermark
  let reprocessedCount = 0;
  for (const p of products) {
    console.log(
      `Reprocessing images for product: ${p.name || p.id} (${p.brand})`,
    );

    // Determine original images
    const origImages =
      p.originalImages && p.originalImages.length > 0
        ? p.originalImages
        : p.images;
    if (!origImages || origImages.length === 0) continue;

    for (let i = 0; i < origImages.length; i++) {
      const origImgUrl = origImages[i];
      if (!origImgUrl.startsWith("/upload/")) continue;

      const origFilename = path.basename(origImgUrl.split("?")[0]);
      const origFilePath = path.join(uploadDir, origFilename);

      try {
        // Check if original file exists on disk
        await fs.access(origFilePath);
        const originalBuffer = await fs.readFile(origFilePath);

        // Standardize the original image (trim transparency and fit to 800x800 square transparent canvas)
        console.log(`  Standardizing original image: ${origFilename}`);
        const standardizedOriginal = await standardizeImage(originalBuffer);

        // Write the standardized original back to disk
        await sharp(standardizedOriginal)
          .webp({ quality: 92, lossless: false })
          .toFile(origFilePath);

        // Determine matching watermarked filename
        let watermarkedFilename = origFilename;
        if (origFilename.includes("_original")) {
          watermarkedFilename = origFilename.replace("_original", "");
        }
        const watermarkedFilePath = path.join(uploadDir, watermarkedFilename);

        // Create the watermarked version
        console.log(
          `  Compositing brand watermark for: ${watermarkedFilename}`,
        );
        const watermarkedBuffer = await compositeBrandWatermark(
          standardizedOriginal,
          p.brand,
        );

        // Write the watermarked version back to disk
        await sharp(watermarkedBuffer)
          .webp({ quality: 90, lossless: false })
          .toFile(watermarkedFilePath);

        reprocessedCount++;
      } catch (err: any) {
        console.error(`  Failed to process ${origFilename}: ${err.message}`);
      }
    }
  }

  console.log(
    `Successfully standardized and re-watermarked ${reprocessedCount} product images on disk.`,
  );

  // Cleanup unused files in public/upload/
  console.log("Scanning upload directory for unused files...");
  const files = await fs.readdir(uploadDir, { withFileTypes: true });
  let deletedCount = 0;
  let keptCount = 0;

  for (const file of files) {
    if (file.isDirectory()) {
      console.log(`Skipping directory: ${file.name}`);
      continue;
    }

    const filename = file.name;
    const filePath = path.join(uploadDir, filename);

    // Filter to only image types
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!["webp", "png", "jpg", "jpeg", "gif"].includes(ext || "")) {
      console.log(`Skipping non-image file: ${filename}`);
      continue;
    }

    if (filename.startsWith("logo_")) {
      // Check if it is a referenced brand logo
      if (referencedLogos.has(filename)) {
        keptCount++;
      } else {
        console.log(`Deleting unused brand logo: ${filename}`);
        await fs.unlink(filePath);
        deletedCount++;
      }
    } else {
      // Check if it is a referenced product image
      if (referencedImages.has(filename)) {
        keptCount++;
      } else {
        console.log(`Deleting unused product image: ${filename}`);
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
  }

  console.log(
    `Cleanup complete: Deleted ${deletedCount} unused files. Kept ${keptCount} active files.`,
  );

  await mongoose.disconnect();
  console.log("Database disconnected. Done!");
}

main().catch((err) => {
  console.error("Fatal error in main script:", err);
  process.exit(1);
});
