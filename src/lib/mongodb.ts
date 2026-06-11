import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/furnitures";

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

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(async (mongooseInstance) => {
        console.log("==> Connected to MongoDB successfully.");
        try {
          // Dynamic imports to break circular dependencies at startup
          const { loadLogosIntoCache } = await import("./brand-logos");
          const { loadWatermarksIntoCache } = await import("./brand-watermarks");
          
          await loadLogosIntoCache();
          await loadWatermarksIntoCache();
        } catch (err) {
          console.error("==> MongoDB Cache Warmup failed:", err);
        }
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
