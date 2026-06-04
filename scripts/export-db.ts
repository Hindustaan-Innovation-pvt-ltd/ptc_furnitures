import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/mongodb";
import { Product } from "../src/lib/db-models";

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
  } catch (err: any) {
    // Ignore
  }
}

async function run() {
  await loadEnv();
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/furnitures";
  console.log(`==> Connecting to MongoDB to export: ${MONGODB_URI}`);
  await connectToDatabase();

  const products = await Product.find({}).lean();
  console.log(`==> Found ${products.length} products to export.`);

  const exportPath = path.join(process.cwd(), "data", "furnitures.products.json");
  
  // Format to JSON array to match original style
  await fs.writeFile(exportPath, JSON.stringify(products, null, 2), "utf-8");
  console.log(`==> Exported products successfully to ${exportPath}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
