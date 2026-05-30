import { NextResponse } from "next/server";
import {
  addProduct,
  deleteProduct,
  isProductInput,
  readProducts,
  updateProduct,
} from "@/lib/products";
import { uploadProductImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

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

async function storeProductImage(file: File): Promise<string> {
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  return uploadProductImage(fileBuffer);
}

type ParsedProductRequest = {
  product: {
    brand: string;
    images: string[];
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
    const customFields = getOptionalStringField(formData, "customFields");
    const imageEntries = formData
      .getAll("images")
      .filter(
        (value): value is File => value instanceof File && value.size > 0,
      );
    const uploadedImages = await Promise.all(
      imageEntries.map((file) => storeProductImage(file)),
    );
    let fallbackImages: unknown = [];

    if (existingImages) {
      try {
        fallbackImages = JSON.parse(existingImages) as unknown;
      } catch {
        fallbackImages = [];
      }
    }
    const storedFallbackImages = Array.isArray(fallbackImages)
      ? fallbackImages.filter(
          (value): value is string => typeof value === "string",
        )
      : [];

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

    if (
      uploadedImages.length === 0 &&
      storedFallbackImages.length === 0 &&
      !allowMissingImage
    ) {
      throw new Error("An image file is required.");
    }

    return {
      id:
        typeof id === "string" && id.trim().length > 0 ? id.trim() : undefined,
      product: {
        brand: getStringField(formData, "brand"),
        images:
          uploadedImages.length > 0 ? uploadedImages : storedFallbackImages,
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

  return { product: body };
}

export async function GET() {
  const products = await readProducts();
  return NextResponse.json({ products });
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
