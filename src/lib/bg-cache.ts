import { connectToDatabase } from "./mongodb";
import { BgRemovedCacheModel } from "./db-models";

export async function readBgCache(): Promise<Record<string, string>> {
  await connectToDatabase();
  const docs = await BgRemovedCacheModel.find().lean();
  const record: Record<string, string> = {};
  for (const doc of docs) {
    record[doc.originalImage] = doc.derivedImage;
  }
  return record;
}

export async function getCachedBgVariant(original: string): Promise<string | null> {
  await connectToDatabase();
  const doc = await BgRemovedCacheModel.findOne({ originalImage: original }).lean();
  return doc ? doc.derivedImage : null;
}

export async function getCachedBgVariantByKey(cacheKey: string): Promise<string | null> {
  await connectToDatabase();
  const doc = await BgRemovedCacheModel.findOne({ originalImage: cacheKey }).lean();
  return doc ? doc.derivedImage : null;
}

export async function setCachedBgVariant(original: string, derived: string): Promise<void> {
  await connectToDatabase();
  await BgRemovedCacheModel.findOneAndUpdate(
    { originalImage: original },
    { $set: { derivedImage: derived } },
    { upsert: true, new: true }
  );
}

export async function setCachedBgVariantByKey(cacheKey: string, derived: string): Promise<void> {
  await connectToDatabase();
  await BgRemovedCacheModel.findOneAndUpdate(
    { originalImage: cacheKey },
    { $set: { derivedImage: derived } },
    { upsert: true, new: true }
  );
}
