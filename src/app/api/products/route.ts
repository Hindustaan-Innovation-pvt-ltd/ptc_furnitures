import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { Product } from "@/lib/db-models";
import {
  compositeBrandWatermark,
  removeWhiteBackground,
  rewatermarkImage,
  standardizeImage,
} from "@/lib/image-processor";
import { connectToDatabase } from "@/lib/mongodb";
import {
  addProduct,
  deleteProduct,
  isProductInput,
  purgeProductFiles,
  readProducts,
  updateProduct,
} from "@/lib/products";

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    throw new Error(`Missing ${key}.`);
  }

  return value;
}

function getOptionalStringField(
  formData: FormData,
  key: string,
): string | undefined {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

async function storeProductImage(
  file: File,
  brand: string,
): Promise<{ watermarked: string; unwatermarked: string }> {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "upload");
  await fs.mkdir(uploadDir, { recursive: true });

  const uniqueId = crypto.randomUUID();

  try {
    // 1. Process background removal (feathered)
    const bgRemoved = await removeWhiteBackground(fileBuffer);
    const standardizedBgRemoved = await standardizeImage(bgRemoved);

    // 2. Add brand watermark
    const watermarked = await compositeBrandWatermark(
      standardizedBgRemoved,
      brand,
    );

    // Save as WebP for smaller file size — loads much faster in browser
    const filename = `${uniqueId}.webp`;
    const origFilename = `${uniqueId}_original.webp`;
    const filePath = path.join(uploadDir, filename);
    const origFilePath = path.join(uploadDir, origFilename);

    const { default: sharp } = await import("sharp");
    await sharp(watermarked)
      .webp({ quality: 90, lossless: false })
      .toFile(filePath);

    await sharp(standardizedBgRemoved)
      .webp({ quality: 92, lossless: false })
      .toFile(origFilePath);

    return {
      watermarked: `/upload/${filename}`,
      unwatermarked: `/upload/${origFilename}`,
    };
  } catch (_err) {
    // Fallback: save raw file if sharp processing fails
    const filename = `${uniqueId}.webp`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, fileBuffer);

    return {
      watermarked: `/upload/${filename}`,
      unwatermarked: `/upload/${filename}`,
    };
  }
}

type ParsedProductRequest = {
  product: {
    brand: string;
    images: string[];
    originalImages?: string[];
    name?: string;
    price?: string;
    material?: string;
    craftedBy?: string;
    tag?: string;
    customFields?: Array<{ label: string; value: string }>;
    premium?: boolean;
    frontImage?: string;
    backImage?: string;
    originalFrontImage?: string;
    originalBackImage?: string;
    color?: string;
    premiumDescription?: string;
  };
  id?: string;
};

async function parseProductRequest(
  request: Request,
  allowMissingImage: boolean,
): Promise<ParsedProductRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const id = formData.get("id");
    const existingImages = getOptionalStringField(formData, "existingImages");
    const existingOriginalImages = getOptionalStringField(
      formData,
      "existingOriginalImages",
    );
    const customFields = getOptionalStringField(formData, "customFields");
    const imageEntries = formData
      .getAll("images")
      .filter(
        (value): value is File => value instanceof File && value.size > 0,
      );
    const brand = getStringField(formData, "brand");

    // ── Gallery-based image handling ──────────────────────────────
    const galleryImageOrder = getOptionalStringField(formData, "galleryImageOrder");
    const existingGalleryImagesRaw = getOptionalStringField(formData, "existingGalleryImages");

    let finalImages: string[] = [];
    let finalOriginalImages: string[] = [];
    let frontImage: string | undefined;
    let originalFrontImage: string | undefined;
    let backImage: string | undefined;
    let originalBackImage: string | undefined;

    if (galleryImageOrder) {
      // New gallery-based upload flow
      let orderArray: string[] = [];
      try { orderArray = JSON.parse(galleryImageOrder) as string[]; } catch { orderArray = []; }

      let existingGallery: Array<{ url: string; originalUrl: string }> = [];
      if (existingGalleryImagesRaw) {
        try { existingGallery = JSON.parse(existingGalleryImagesRaw); } catch { existingGallery = []; }
      }

      const newGalleryFiles = formData.getAll("galleryImage").filter(
        (value): value is File => value instanceof File && value.size > 0,
      );

      // Process all new files
      const processedNewImages = await Promise.all(
        newGalleryFiles.map((file) => storeProductImage(file, brand)),
      );

      // Construct final arrays following order
      for (const entry of orderArray) {
        const [type, indexStr] = entry.split(":");
        const index = parseInt(indexStr);
        if (type === "existing" && existingGallery[index]) {
          finalImages.push(existingGallery[index].url);
          finalOriginalImages.push(existingGallery[index].originalUrl);
        } else if (type === "new" && processedNewImages[index]) {
          finalImages.push(processedNewImages[index].watermarked);
          finalOriginalImages.push(processedNewImages[index].unwatermarked);
        }
      }

      // Set front/back for backward compatibility
      frontImage = finalImages[0];
      originalFrontImage = finalOriginalImages[0];
      backImage = finalImages[1];
      originalBackImage = finalOriginalImages[1];
    } else {
      // Legacy front/back image flow
      const frontImageFile = formData.get("frontImage");
      const backImageFile = formData.get("backImage");

      frontImage = getOptionalStringField(formData, "existingFrontImage");
      originalFrontImage = getOptionalStringField(formData, "existingOriginalFrontImage");
      backImage = getOptionalStringField(formData, "existingBackImage");
      originalBackImage = getOptionalStringField(formData, "existingOriginalBackImage");

      if (frontImageFile instanceof File && frontImageFile.size > 0) {
        const stored = await storeProductImage(frontImageFile, brand);
        frontImage = stored.watermarked;
        originalFrontImage = stored.unwatermarked;
      }

      if (backImageFile instanceof File && backImageFile.size > 0) {
        const stored = await storeProductImage(backImageFile, brand);
        backImage = stored.watermarked;
        originalBackImage = stored.unwatermarked;
      }

      if (frontImage) finalImages.push(frontImage);
      if (backImage) finalImages.push(backImage);
      if (originalFrontImage) finalOriginalImages.push(originalFrontImage);
      if (originalBackImage) finalOriginalImages.push(originalBackImage);

      // Fallback to legacy multiple images list
      if (finalImages.length === 0) {
        const imageEntries = formData.getAll("images").filter(
          (value): value is File => value instanceof File && value.size > 0,
        );

        let uploadedImages: Array<{ watermarked: string; unwatermarked: string }> = [];
        if (imageEntries.length > 0) {
          uploadedImages = await Promise.all(
            imageEntries.map((file) => storeProductImage(file, brand)),
          );
        }

        if (uploadedImages.length > 0) {
          finalImages = uploadedImages.map((img) => img.watermarked);
          finalOriginalImages = uploadedImages.map((img) => img.unwatermarked);
        } else {
          const existingImages = getOptionalStringField(formData, "existingImages");
          const existingOriginalImages = getOptionalStringField(formData, "existingOriginalImages");

          let fallbackImages: unknown = [];
          if (existingImages) {
            try { fallbackImages = JSON.parse(existingImages) as unknown; } catch { fallbackImages = []; }
          }
          finalImages = Array.isArray(fallbackImages)
            ? fallbackImages.filter((value): value is string => typeof value === "string")
            : [];

          let fallbackOriginalImages: unknown = [];
          if (existingOriginalImages) {
            try { fallbackOriginalImages = JSON.parse(existingOriginalImages) as unknown; } catch { fallbackOriginalImages = []; }
          }
          finalOriginalImages = Array.isArray(fallbackOriginalImages)
            ? fallbackOriginalImages.filter((value): value is string => typeof value === "string")
            : [];
        }

        frontImage = finalImages[0];
        originalFrontImage = finalOriginalImages[0];
        backImage = finalImages[1];
        originalBackImage = finalOriginalImages[1];
      }
    }

    let parsedCustomFields: Array<{ label: string; value: string }> = [];

    if (customFields) {
      try {
        const parsed = JSON.parse(customFields) as unknown;

        if (Array.isArray(parsed)) {
          parsedCustomFields = parsed.filter(
            (field): field is { label: string; value: string } => {
              if (!field || typeof field !== "object") {
                return false;
              }

              const candidate = field as Record<string, unknown>;

              return (
                typeof candidate.label === "string" &&
                typeof candidate.value === "string"
              );
            },
          );
        }
      } catch {
        parsedCustomFields = [];
      }
    }

    if (finalImages.length === 0 && !allowMissingImage) {
      throw new Error("An image file is required.");
    }

    return {
      id:
        typeof id === "string" && id.trim().length > 0 ? id.trim() : undefined,
      product: {
        brand: getStringField(formData, "brand"),
        images: finalImages,
        originalImages: finalOriginalImages,
        name: getOptionalStringField(formData, "name"),
        price: getOptionalStringField(formData, "price"),
        material: getOptionalStringField(formData, "material"),
        craftedBy: getOptionalStringField(formData, "craftedBy"),
        tag: getOptionalStringField(formData, "tag"),
        customFields: parsedCustomFields,
        premium: formData.get("premium") === "true",
        frontImage: frontImage || undefined,
        backImage: backImage || undefined,
        originalFrontImage: originalFrontImage || undefined,
        originalBackImage: originalBackImage || undefined,
        color: getOptionalStringField(formData, "color"),
        premiumDescription: getOptionalStringField(formData, "premiumDescription"),
      },
    };
  }

  const body: unknown = await request.json();

  if (!isProductInput(body)) {
    throw new Error("Invalid product payload.");
  }

  const productInput = body as any;
  if (!productInput.originalImages) {
    productInput.originalImages = productInput.images;
  }

  return { product: productInput };
}

export async function GET() {
  const products = await readProducts();
  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

export async function POST(request: Request) {
  try {
    const { product } = await parseProductRequest(request, false);
    const savedProduct = await addProduct(product);

    return NextResponse.json({ product: savedProduct }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid product payload.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, product } = await parseProductRequest(request, true);

    if (!id) {
      return NextResponse.json(
        { error: "Missing product id." },
        { status: 400 },
      );
    }

    // Connect to database and re-watermark ONLY if brand is changing!
    await connectToDatabase();
    const existingProduct = await Product.findOne({ id });

    if (existingProduct) {
      // Keep existing original images and images aligned (both pointing to the clean images)
      const originalImagesToUse =
        existingProduct.originalImages &&
        existingProduct.originalImages.length > 0
          ? existingProduct.originalImages
          : existingProduct.images;

      product.originalImages = originalImagesToUse;
      product.images = originalImagesToUse;
    }

    const savedProduct = await updateProduct(id, product);

    if (!savedProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ product: savedProduct });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid product payload.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const bodyObj = body as Record<string, unknown>;

    // Handle batch reordering of products
    if ("reorder" in bodyObj && Array.isArray(bodyObj.reorder)) {
      const reorderIds = bodyObj.reorder as string[];
      await connectToDatabase();

      const bulkOps = reorderIds.map((id, index) => ({
        updateOne: {
          filter: { id },
          update: { $set: { position: index } },
        },
      }));

      await Product.bulkWrite(bulkOps);
      return NextResponse.json({
        success: true,
        message: "Positions reordered successfully.",
      });
    }

    const { id, premium, position, color, premiumDescription } = bodyObj;
    if (typeof id !== "string" || id.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing product id." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const updateFields: any = {};
    if (premium !== undefined) {
      if (typeof premium !== "boolean") {
        return NextResponse.json(
          { error: "Invalid 'premium' value." },
          { status: 400 },
        );
      }
      updateFields.premium = premium;
    }
    if (position !== undefined) {
      if (typeof position !== "number") {
        return NextResponse.json(
          { error: "Invalid 'position' value." },
          { status: 400 },
        );
      }
      updateFields.position = position;
    }
    if (color !== undefined) {
      if (typeof color !== "string") {
        return NextResponse.json(
          { error: "Invalid 'color' value." },
          { status: 400 },
        );
      }
      updateFields.color = color.trim() || undefined;
    }
    if (premiumDescription !== undefined) {
      if (typeof premiumDescription !== "string") {
        return NextResponse.json(
          { error: "Invalid 'premiumDescription' value." },
          { status: 400 },
        );
      }
      updateFields.premiumDescription = premiumDescription.trim() || undefined;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 },
      );
    }

    const result = await Product.updateOne(
      { id: id.trim() },
      { $set: updateFields },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ product: { id: id.trim(), ...updateFields } });
  } catch (error) {
    console.error("PATCH /api/products error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update product status.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const id = requestUrl.searchParams.get("id");
    const purgeFiles = requestUrl.searchParams.get("purgeFiles") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "Missing product id." },
        { status: 400 },
      );
    }

    const deletedProduct = await deleteProduct(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    // Only purge files from disk when explicitly requested by admin (with confirmation in UI).
    // By default, files stay on disk so they can be reassigned to other brands.
    if (purgeFiles) {
      await purgeProductFiles(
        deletedProduct.images,
        deletedProduct.originalImages ?? [],
      );
    }

    return NextResponse.json({
      product: deletedProduct,
      filesPurged: purgeFiles,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete product.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
