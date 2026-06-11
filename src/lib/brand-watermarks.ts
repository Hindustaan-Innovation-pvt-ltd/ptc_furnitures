import { BrandWatermarkModel } from "./db-models";
import { connectToDatabase } from "./mongodb";

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

  const escapedBrand = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existing = await BrandWatermarkModel.findOne({
    brand: { $regex: new RegExp(`^${escapedBrand}$`, "i") },
  });

  if (existing) {
    await BrandWatermarkModel.updateOne(
      { _id: existing._id },
      {
        $set: {
          brand: normalized,
          url: watermark.url,
          size: watermark.size || "medium",
          opacity: watermark.opacity ?? 20,
          position: watermark.position || "center",
        },
      },
    );
  } else {
    await BrandWatermarkModel.create({
      brand: normalized,
      url: watermark.url,
      size: watermark.size || "medium",
      opacity: watermark.opacity ?? 20,
      position: watermark.position || "center",
    });
  }

  // Reload memory cache from database to ensure consistency
  await loadWatermarksIntoCache();
}

export async function removeBrandWatermark(brand: string): Promise<void> {
  const normalized = normalizeBrand(brand);
  await connectToDatabase();

  const escapedBrand = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await BrandWatermarkModel.findOneAndDelete({
    brand: { $regex: new RegExp(`^${escapedBrand}$`, "i") },
  });

  // Reload memory cache from database to ensure consistency
  await loadWatermarksIntoCache();
}
