import { Product, BrandModel, BgRemovedCacheModel } from "./db-models";
import productsData from "../../data/furnitures.products.json";
import brandsData from "../../data/furnitures.brands.json";
import bgCacheData from "../../data/furnitures.bgremovedcaches.json";

let hasRestored = false;

export async function autoRestoreIfEmpty() {
  if (hasRestored) return;

  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0 && Array.isArray(productsData) && productsData.length > 0) {
      console.log(`==> [AUTO-RESTORE] Database is empty. Restoring ${productsData.length} products from backup...`);
      const cleanProducts = productsData.map((p: any) => {
        const doc = { ...p };
        if (doc._id && typeof doc._id === "object" && doc._id.$oid) {
          doc._id = doc._id.$oid;
        }
        return doc;
      });
      await Product.insertMany(cleanProducts, { ordered: false });
      console.log(`==> [AUTO-RESTORE] Successfully restored ${cleanProducts.length} products!`);
    }

    const brandCount = await BrandModel.countDocuments();
    if (brandCount === 0 && Array.isArray(brandsData) && brandsData.length > 0) {
      console.log(`==> [AUTO-RESTORE] Restoring ${brandsData.length} brands...`);
      const cleanBrands = brandsData.map((b: any, index: number) => ({
        name: b.name,
        position: b.position !== undefined ? b.position : index,
      }));
      await BrandModel.insertMany(cleanBrands, { ordered: false });
      console.log(`==> [AUTO-RESTORE] Successfully restored ${cleanBrands.length} brands!`);
    }

    if (BgRemovedCacheModel) {
      const cacheCount = await BgRemovedCacheModel.countDocuments();
      if (cacheCount === 0 && Array.isArray(bgCacheData) && bgCacheData.length > 0) {
        console.log(`==> [AUTO-RESTORE] Restoring ${bgCacheData.length} background caches...`);
        const cleanCaches = bgCacheData.map((c: any) => {
          const doc = { ...c };
          if (doc._id && typeof doc._id === "object" && doc._id.$oid) {
            delete doc._id;
          }
          return doc;
        });
        await BgRemovedCacheModel.insertMany(cleanCaches, { ordered: false }).catch(() => {});
        console.log(`==> [AUTO-RESTORE] Successfully restored background caches!`);
      }
    }

    hasRestored = true;
  } catch (err: any) {
    console.error("==> [AUTO-RESTORE] Error during auto-restore:", err.message || err);
  }
}
