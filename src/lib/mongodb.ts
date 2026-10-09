import mongoose from "mongoose";


let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

let warmupStarted = false;

async function runWarmup() {
  if (warmupStarted) return;
  warmupStarted = true;
  try {
    const { loadLogosIntoCache } = await import("./brand-logos");
    const { loadWatermarksIntoCache } = await import("./brand-watermarks");

    await loadLogosIntoCache();
    await loadWatermarksIntoCache();

    const { autoRestoreIfEmpty } = await import("./restore-backup");
    await autoRestoreIfEmpty();
  } catch (err) {
    console.error("==> MongoDB Cache Warmup failed:", err);
  }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ptc_furnitures";

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("==> Connected to MongoDB successfully.");
        cached.conn = mongooseInstance;
        runWarmup().catch((err) =>
          console.error("==> Background warmup error:", err),
        );
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
