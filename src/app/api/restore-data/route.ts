import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import { Product, BrandModel, BgRemovedCacheModel } from "@/lib/db-models";
import productsData from "@/data/furnitures.products.json";
import brandsData from "@/data/furnitures.brands.json";
import bgCacheData from "@/data/furnitures.bgremovedcaches.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    let insertedProducts = 0;
    let existingProducts = 0;

    if (Array.isArray(productsData) && productsData.length > 0) {
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
      insertedProducts = result.upsertedCount;
      existingProducts = result.matchedCount;
    }

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

    const totalProducts = await Product.countDocuments();
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: `Restore complete! Added ${insertedProducts} backup products. Total products in database: ${totalProducts}.`,
      insertedProducts,
      existingProducts,
      totalProducts,
    });
  } catch (error: any) {
    console.error("Restore failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
