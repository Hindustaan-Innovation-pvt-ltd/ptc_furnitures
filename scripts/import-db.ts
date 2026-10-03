import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { Product, BrandModel, BgRemovedCacheModel } from "../src/lib/db-models";
import { connectToDatabase } from "../src/lib/mongodb";

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
  } catch (err: any) {
    // Ignore
  }
}

async function run() {
  await loadEnv();
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/furnitures";
  console.log(`==> Connecting to MongoDB: ${MONGODB_URI}`);
  await connectToDatabase();

  const dataDir = path.join(process.cwd(), "data");

  // 1. Products
  const productsFile = path.join(dataDir, "furnitures.products.json");
  try {
    const productsRaw = await fs.readFile(productsFile, "utf-8");
    const products = JSON.parse(productsRaw);
    if (Array.isArray(products) && products.length > 0) {
      console.log(`==> Restoring ${products.length} products...`);
      for (const p of products) {
        const query = p.id ? { id: p.id } : { _id: p._id };
        await Product.updateOne(query, { $set: p }, { upsert: true });
      }
      console.log(`==> Successfully restored products!`);
    }
  } catch (err: any) {
    console.warn("Products import error:", err.message);
  }

  // 2. Brands
  const brandsFile = path.join(dataDir, "furnitures.brands.json");
  try {
    const brandsRaw = await fs.readFile(brandsFile, "utf-8");
    const brands = JSON.parse(brandsRaw);
    if (Array.isArray(brands) && brands.length > 0) {
      console.log(`==> Restoring ${brands.length} brands...`);
      for (const b of brands) {
        await BrandModel.updateOne(
          { name: b.name },
          { $set: { name: b.name, position: b.position || 0 } },
          { upsert: true }
        );
      }
      console.log(`==> Successfully restored brands!`);
    }
  } catch (err: any) {
    console.warn("Brands import error:", err.message);
  }

  // 3. BG Removed Caches
  const bgFile = path.join(dataDir, "furnitures.bgremovedcaches.json");
  try {
    const bgRaw = await fs.readFile(bgFile, "utf-8");
    const bgCaches = JSON.parse(bgRaw);
    if (Array.isArray(bgCaches) && bgCaches.length > 0) {
      console.log(`==> Restoring ${bgCaches.length} background caches...`);
      for (const c of bgCaches) {
        if (c.originalUrl) {
          await BgRemovedCacheModel.updateOne(
            { originalUrl: c.originalUrl },
            { $set: c },
            { upsert: true }
          );
        }
      }
      console.log(`==> Successfully restored background caches!`);
    }
  } catch (err: any) {
    console.warn("BG Cache import error:", err.message);
  }

  console.log("==> All data restored successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
