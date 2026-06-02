import { connectToDatabase } from "./mongodb";
import { BrandWatermarkModel } from "./db-models";

export type BrandWatermark = {
  url: string;
  size?: "small" | "medium" | "large";
  opacity?: number; // 0-100
  position?:
  | "center"
  | "north"
  | "south"
  | "east"
  | "west"
  | "north_east"
  | "north_west"
  | "south_east"
  | "south_west";
};

let cachedWatermarks: Record<string, BrandWatermark> = {};

function normalizeBrand(brand: string): string {
  return brand.trim();
}

export async function loadWatermarksIntoCache() {
  try {
    const docs = await BrandWatermarkModel.find().lean();
    const newCache: Record<string, BrandWatermark> = {};
    for (const doc of docs) {
      newCache[normalizeBrand(doc.brand)] = {
        url: doc.url,
        size: doc.size as any,
        opacity: doc.opacity,
        position: doc.position as any,
      };
    }
    cachedWatermarks = newCache;
  } catch (err) {
    console.error("Failed to load brand watermarks into cache:", err);
  }
}

export function readBrandWatermarks(): Record<string, BrandWatermark> {
  return cachedWatermarks;
}

export async function setBrandWatermark(
  brand: string,
  watermark: BrandWatermark,
): Promise<void> {
  const normalized = normalizeBrand(brand);
  if (!normalized) throw new Error("Brand name required");

  await connectToDatabase();

  await BrandWatermarkModel.findOneAndUpdate(
    { brand: { $regex: new RegExp(`^${normalized}$`, "i") } },
    {
      $set: {
        brand: normalized,
        url: watermark.url,
        size: watermark.size || "medium",
        opacity: watermark.opacity ?? 20,
        position: watermark.position || "center",
      },
    },
    { upsert: true, new: true }
  );

  // Update memory cache
  cachedWatermarks[normalized] = watermark;
}

export async function removeBrandWatermark(brand: string): Promise<void> {
  const normalized = normalizeBrand(brand);
  await connectToDatabase();

  await BrandWatermarkModel.findOneAndDelete({
    brand: { $regex: new RegExp(`^${normalized}$`, "i") },
  });

  // Remove from memory cache
  delete cachedWatermarks[normalized];
}
