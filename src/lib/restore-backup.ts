import { Product, BrandModel, BgRemovedCacheModel } from "./db-models";
import productsData from "../../data/furnitures.products.json";
import brandsData from "../../data/furnitures.brands.json";
import bgCacheData from "../../data/furnitures.bgremovedcaches.json";

let hasRestored = false;

export async function autoRestoreIfEmpty() {
  if (hasRestored) return;

  try {
    // 1. Merge & Restore Products without overwriting existing ones
    if (Array.isArray(productsData) && productsData.length > 0) {
      console.log(`==> [RESTORE-SYNC] Syncing ${productsData.length} backup products with current database...`);
      const productOps = productsData.map((p: any) => {
        const doc = { ...p };
        if (doc._id && typeof doc._id === "object" && doc._id.$oid) {
          doc._id = doc._id.$oid;
        }
        return {
          updateOne: {
            filter: doc.id ? { id: doc.id } : { _id: doc._id },
            update: { $setOnInsert: doc },
            upsert: true,
          },
        };
      });
      const result = await Product.bulkWrite(productOps, { ordered: false });
      console.log(`==> [RESTORE-SYNC] Products synced! Inserted: ${result.upsertedCount}, Existing untouched: ${result.matchedCount}`);
    }

    // 2. Merge Brands
    if (Array.isArray(brandsData) && brandsData.length > 0) {
      const brandOps = brandsData.map((b: any, index: number) => ({
        updateOne: {
          filter: { name: b.name },
          update: { $setOnInsert: { name: b.name, position: b.position !== undefined ? b.position : index } },
          upsert: true,
        },
      }));
      await BrandModel.bulkWrite(brandOps, { ordered: false });
    }

    // 3. Merge Background Caches
    if (BgRemovedCacheModel && Array.isArray(bgCacheData) && bgCacheData.length > 0) {
      const cacheOps = bgCacheData
        .filter((c: any) => c.originalUrl)
        .map((c: any) => {
          const doc = { ...c };
          if (doc._id && typeof doc._id === "object" && doc._id.$oid) {
            delete doc._id;
          }
          return {
            updateOne: {
              filter: { originalUrl: doc.originalUrl },
              update: { $setOnInsert: doc },
              upsert: true,
            },
          };
        });
      if (cacheOps.length > 0) {
        await BgRemovedCacheModel.bulkWrite(cacheOps, { ordered: false }).catch(() => {});
      }
    }

    hasRestored = true;
  } catch (err: any) {
    console.error("==> [RESTORE-SYNC] Error during restore-sync:", err.message || err);
  }
}
