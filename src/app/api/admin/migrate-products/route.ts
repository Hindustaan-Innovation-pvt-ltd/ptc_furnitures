import "server-only";
import { NextResponse } from "next/server";
import { Product } from "@/lib/db-models";
import { connectToDatabase } from "@/lib/mongodb";

const colorsList = [
  "beige",
  "brown",
  "black",
  "white",
  "grey",
  "gray",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "gold",
  "silver",
  "walnut",
  "teak",
  "rosewood",
  "mahogany",
  "oak",
  "maple",
  "cherry",
];

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const products = await Product.find({});
    let migratedCount = 0;
    let colorDetectedCount = 0;

    for (const prod of products) {
      let needsUpdate = false;
      const setFields: any = {};

      // 1. Migrate image arrays if empty but frontImage/backImage exist
      const hasLegacyImages = !!(prod.frontImage || prod.backImage);
      const isGalleryEmpty = !prod.images || prod.images.length === 0;

      if (hasLegacyImages && isGalleryEmpty) {
        const newImages: string[] = [];
        if (prod.frontImage) newImages.push(prod.frontImage);
        if (prod.backImage) newImages.push(prod.backImage);

        const newOriginalImages: string[] = [];
        if (prod.originalFrontImage) {
          newOriginalImages.push(prod.originalFrontImage);
        } else if (prod.frontImage) {
          newOriginalImages.push(prod.frontImage);
        }

        if (prod.originalBackImage) {
          newOriginalImages.push(prod.originalBackImage);
        } else if (prod.backImage) {
          newOriginalImages.push(prod.backImage);
        }

        setFields.images = newImages;
        setFields.originalImages = newOriginalImages;
        needsUpdate = true;
        migratedCount++;
      }

      // 2. Auto-detect color from name if color is not set
      if (!prod.color && prod.name) {
        const nameLower = prod.name.toLowerCase();
        let detected: string | null = null;
        for (const c of colorsList) {
          if (nameLower.includes(c)) {
            detected = c.charAt(0).toUpperCase() + c.slice(1);
            break;
          }
        }
        if (detected) {
          setFields.color = detected;
          needsUpdate = true;
          colorDetectedCount++;
        }
      }

      // Perform update if changes detected
      if (needsUpdate) {
        await Product.updateOne({ id: prod.id }, { $set: setFields });
      }
    }

    return NextResponse.json({
      success: true,
      totalCount: products.length,
      migratedCount,
      colorDetectedCount,
    });
  } catch (error) {
    console.error("==> [Migration API Error]:", error);
    const message =
      error instanceof Error ? error.message : "Unable to migrate products.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
