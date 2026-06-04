import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { Product } from "@/lib/db-models";
import {
  compositeBrandWatermark,
  removeWhiteBackground,
  rewatermarkImage,
} from "@/lib/image-processor";
import { connectToDatabase } from "@/lib/mongodb";
import {
  addProduct,
  deleteProduct,
  isProductInput,
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

    // 2. Add brand watermark
    const watermarked = await compositeBrandWatermark(bgRemoved, brand);

    // Save as WebP for ~60% smaller file size vs PNG — loads much faster in browser
    const filename = `${uniqueId}.webp`;
    const originalFilename = `${uniqueId}_original.webp`;

    const filePath = path.join(uploadDir, filename);
    const originalFilePath = path.join(uploadDir, originalFilename);

    // Write WebP at quality 90 — visually lossless but half the PNG size
    const { default: sharp } = await import("sharp");
    await sharp(watermarked)
      .webp({ quality: 90, lossless: false })
      .toFile(filePath);
    await sharp(bgRemoved)
      .webp({ quality: 92, lossless: false })
      .toFile(originalFilePath);

    return {
      watermarked: `/upload/${filename}`,
      unwatermarked: `/upload/${originalFilename}`,
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

    let uploadedImages: Array<{ watermarked: string; unwatermarked: string }> =
      [];
    if (imageEntries.length > 0) {
      uploadedImages = await Promise.all(
        imageEntries.map((file) => storeProductImage(file, brand)),
      );
    }

    let finalImages: string[] = [];
    let finalOriginalImages: string[] = [];

    if (uploadedImages.length > 0) {
      finalImages = uploadedImages.map((img) => img.watermarked);
      finalOriginalImages = uploadedImages.map((img) => img.unwatermarked);
    } else {
      let fallbackImages: unknown = [];
      if (existingImages) {
        try {
          fallbackImages = JSON.parse(existingImages) as unknown;
        } catch {
          fallbackImages = [];
        }
      }
      finalImages = Array.isArray(fallbackImages)
        ? fallbackImages.filter(
            (value): value is string => typeof value === "string",
          )
        : [];

      let fallbackOriginalImages: unknown = [];
      if (existingOriginalImages) {
        try {
          fallbackOriginalImages = JSON.parse(
            existingOriginalImages,
          ) as unknown;
        } catch {
          fallbackOriginalImages = [];
        }
      }
      finalOriginalImages = Array.isArray(fallbackOriginalImages)
        ? fallbackOriginalImages.filter(
            (value): value is string => typeof value === "string",
          )
        : [];
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
      if (existingProduct.brand !== product.brand) {
        console.log(
          `==> Product ${id} brand changed from "${existingProduct.brand}" to "${product.brand}". Re-applying watermarks...`,
        );

        const originalImagesToUse =
          existingProduct.originalImages &&
          existingProduct.originalImages.length > 0
            ? existingProduct.originalImages
            : existingProduct.images;

        const newImages: string[] = [];
        for (const img of originalImagesToUse) {
          const rewatermarked = await rewatermarkImage(img, product.brand);
          newImages.push(rewatermarked);
        }

        product.images = newImages;
        product.originalImages = originalImagesToUse;
      } else {
        // Keep existing original images pristine in DB
        product.originalImages =
          existingProduct.originalImages &&
          existingProduct.originalImages.length > 0
            ? existingProduct.originalImages
            : existingProduct.images;
      }
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

export async function DELETE(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const id = requestUrl.searchParams.get("id");

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

    return NextResponse.json({ product: deletedProduct });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete product.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
