import "server-only";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getBrandLogo, setBrandLogo } from "@/lib/brand-logos";
import { Product } from "@/lib/db-models";
import { rewatermarkImage } from "@/lib/image-processor";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const brand = String(form.get("brand") ?? "").trim();
    const file = form.get("file") as File | null;

    if (!brand) {
      return NextResponse.json({ error: "Brand is required." }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "Logo file is required." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the logo with sharp (convert to PNG, optimize)
    const pngBuffer = await sharp(buffer).png().toBuffer();
    const base64 = pngBuffer.toString("base64");
    const logoSrc = `data:image/png;base64,${base64}`;

    const logo = getBrandLogo(brand) ?? {
      brand,
      src: logoSrc,
      alt: `${brand} logo`,
      aliases: [brand.toLowerCase()],
    };

    // Always update the src to the new Base64 URL
    logo.src = logoSrc;

    // Persist in MongoDB database
    await connectToDatabase();
    await setBrandLogo(brand, logo);

    // Re-watermark all products belonging to this brand instantly using their pristine originalImages!
    const productsToUpdate = await Product.find({ brand });
    console.log(`==> [Brand Logo Update] Re-applying new watermark for brand "${brand}" onto ${productsToUpdate.length} products...`);
    
    for (const prod of productsToUpdate) {
      const originalImages = prod.originalImages && prod.originalImages.length > 0
        ? prod.originalImages
        : prod.images;

      const newImages: string[] = [];
      for (const img of originalImages) {
        const rewatermarked = await rewatermarkImage(img, brand);
        newImages.push(rewatermarked);
      }

      prod.images = newImages;
      prod.originalImages = originalImages;
      await prod.save();
    }

    return NextResponse.json({ brand, src: logo.src });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save brand logo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
