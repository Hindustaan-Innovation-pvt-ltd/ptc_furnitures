import mongoose from "mongoose";
import { loadLogosIntoCache } from "./brand-logos";
import { loadWatermarksIntoCache } from "./brand-watermarks";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/furnitures";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      console.log("==> Connected to MongoDB successfully.");
      try {
        // Populate memory caches synchronously for zero-overhead storefront & admin rendering
        await loadLogosIntoCache();
        await loadWatermarksIntoCache();

        // Database-driven background watermark synchronization (v5.0 for fixed 200px watermarks)
        const db = mongooseInstance.connection.db;
        if (db) {
          const metadataCol = db.collection("metadata");
          // Run the synchronization in the background so it doesn't block server startup
          void (async () => {
            try {
              const versionDoc = await metadataCol.findOne({ key: "watermark-version" });
              if (!versionDoc || versionDoc.version !== "5.0") {
                console.log("==> [Sync] Detected outdated watermark sizes in MongoDB. Synchronizing all products to fixed 200px watermarks...");
                
                const { Product } = await import("./db-models");
                const { rewatermarkImage } = await import("./image-processor");
                
                const products = await Product.find({});
                console.log(`==> [Sync] Found ${products.length} products to synchronize...`);
                
                let count = 0;
                for (const prod of products) {
                  const originalImages = prod.originalImages && prod.originalImages.length > 0
                    ? prod.originalImages
                    : prod.images;
                    
                  const newImages: string[] = [];
                  for (const img of originalImages) {
                    const rewatermarked = await rewatermarkImage(img, prod.brand);
                    newImages.push(rewatermarked);
                  }
                  
                  prod.images = newImages;
                  prod.originalImages = originalImages;
                  await prod.save();
                  count++;
                  if (count % 20 === 0 || count === products.length) {
                    console.log(`==> [Sync] Synchronized ${count}/${products.length} products...`);
                  }
                }
                
                await metadataCol.updateOne(
                  { key: "watermark-version" },
                  { $set: { version: "5.0" } },
                  { upsert: true }
                );
                console.log("==> [Sync] Successfully synchronized all watermarks in MongoDB to fixed 200px size!");
              } else {
                console.log("==> [Sync] Watermarks in MongoDB are already in sync (v5.0).");
              }
            } catch (err: any) {
              console.error("==> [Sync] Failed to synchronize watermarks in background:", err.message);
            }
          })();
        }
      } catch (err) {
        console.error("==> MongoDB Cache Warmup failed:", err);
      }
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
