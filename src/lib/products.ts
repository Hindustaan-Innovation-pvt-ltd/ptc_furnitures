import { randomUUID } from "node:crypto";
import { BrandModel, Product as ProductModel, StoredFile } from "./db-models";
import { connectToDatabase } from "./mongodb";

export type Product = {
  id: string;
  brand: string;
  images: string[];
  originalImages?: string[];
  createdAt: string;
  name?: string;
  price?: string;
  material?: string;
  craftedBy?: string;
  tag?: string;
  customFields?: ProductCustomField[];
  updatedAt?: string;
};

export type ProductCustomField = {
  label: string;
  value: string;
};

export type ProductInput = {
  brand: string;
  images: string[];
  originalImages?: string[];
  name?: string;
  price?: string;
  material?: string;
  craftedBy?: string;
  tag?: string;
  customFields?: ProductCustomField[];
};

export type ProductUpdateInput = ProductInput;

export type Brand = string;

const seedBrands: Brand[] = [
  "PTC GOLD",
  "REX",
  "ALTECH",
  "ARIPLAST",
  "HALLMARK",
  "PANKAJ",
];

async function deleteStoredFileByURL(imagePath: string) {
  if (imagePath.startsWith("/api/images")) {
    try {
      const urlObj = new URL(imagePath, "http://localhost");
      const id = urlObj.searchParams.get("id");
      if (id) {
        await StoredFile.findByIdAndDelete(id);
      }
    } catch {
      // Ignore
    }
  }
}

async function deleteStoredFiles(imagePaths: string[]) {
  await Promise.all(
    imagePaths.map((imagePath) => deleteStoredFileByURL(imagePath)),
  );
}

export function isProductInput(value: unknown): value is ProductInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.brand === "string" &&
    Array.isArray(candidate.images) &&
    candidate.images.every((image) => typeof image === "string") &&
    (candidate.customFields === undefined ||
      (Array.isArray(candidate.customFields) &&
        candidate.customFields.every((field) => {
          if (!field || typeof field !== "object") {
            return false;
          }

          const customField = field as Record<string, unknown>;

          return (
            typeof customField.label === "string" &&
            typeof customField.value === "string"
          );
        })))
  );
}

export function isBrandInput(value: unknown): value is { name: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.name === "string";
}

export async function readProducts(): Promise<Product[]> {
  try {
    await connectToDatabase();
    const docs = await ProductModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((doc: any) => ({
      id: doc.id,
      brand: doc.brand || "",
      images: doc.images || [],
      originalImages: doc.originalImages || [],
      createdAt: doc.createdAt,
      name: doc.name || undefined,
      price: doc.price || undefined,
      material: doc.material || undefined,
      craftedBy: doc.craftedBy || undefined,
      tag: doc.tag || undefined,
      customFields: doc.customFields || [],
    }));
  } catch (error) {
    console.error("Failed to read products from database:", error);
    return [];
  }
}

export async function readBrands(): Promise<Brand[]> {
  try {
    await connectToDatabase();
    const docs = await BrandModel.find().lean();
    if (docs.length === 0) {
      return seedBrands;
    }
    return docs.map((doc: any) => doc.name);
  } catch (error) {
    console.error("Failed to read brands from database:", error);
    return seedBrands;
  }
}

export async function addBrand(name: string): Promise<Brand> {
  const normalizedBrand = name.trim().replace(/\s+/g, " ");

  if (!normalizedBrand) {
    throw new Error("Brand name is required.");
  }

  await connectToDatabase();

  const existingBrand = await BrandModel.findOne({
    name: { $regex: new RegExp(`^${normalizedBrand}$`, "i") },
  });

  if (existingBrand) {
    throw new Error("Brand already exists.");
  }

  await BrandModel.create({ name: normalizedBrand });
  return normalizedBrand;
}

export async function addProduct(product: ProductInput): Promise<Product> {
  await connectToDatabase();

  const normalizedImages = product.images
    .map((image) => image.trim())
    .filter((image) => image.length > 0);

  const newId = randomUUID();

  const doc = await ProductModel.create({
    id: newId,
    brand: product.brand.trim().replace(/\s+/g, " "),
    images: normalizedImages,
    originalImages: product.originalImages || normalizedImages,
    createdAt: new Date().toISOString(),
    name: product.name?.trim() || undefined,
    price: product.price?.trim() || undefined,
    material: product.material?.trim() || undefined,
    craftedBy: product.craftedBy?.trim() || undefined,
    tag: product.tag?.trim() || undefined,
    customFields: product.customFields || [],
  });

  return {
    id: doc.id,
    brand: doc.brand || "",
    images: doc.images,
    originalImages: doc.originalImages,
    createdAt: doc.createdAt,
    name: doc.name || undefined,
    price: doc.price || undefined,
    material: doc.material || undefined,
    craftedBy: doc.craftedBy || undefined,
    tag: doc.tag || undefined,
    customFields: doc.customFields || [],
  };
}

export async function updateProduct(
  productId: string,
  product: ProductUpdateInput,
): Promise<Product | null> {
  await connectToDatabase();

  const existingDoc = await ProductModel.findOne({ id: productId });
  if (!existingDoc) {
    return null;
  }

  const normalizedImages = product.images
    .map((image) => image.trim())
    .filter((image) => image.length > 0);

  // If there are updated images, delete orphaned StoredFiles from MongoDB
  if (normalizedImages.length > 0) {
    const removedImages = (existingDoc.images || []).filter(
      (image: string) => !normalizedImages.includes(image),
    );
    await deleteStoredFiles(removedImages);
  }

  const updatedDoc = await ProductModel.findOneAndUpdate(
    { id: productId },
    {
      $set: {
        brand: product.brand.trim().replace(/\s+/g, " "),
        images:
          normalizedImages.length > 0 ? normalizedImages : existingDoc.images,
        originalImages:
          product.originalImages ||
          existingDoc.originalImages ||
          (normalizedImages.length > 0 ? normalizedImages : existingDoc.images),
        name: product.name?.trim() || undefined,
        price: product.price?.trim() || undefined,
        material: product.material?.trim() || undefined,
        craftedBy: product.craftedBy?.trim() || undefined,
        tag: product.tag?.trim() || undefined,
        customFields: product.customFields || [],
      },
    },
    { new: true },
  ).lean();

  if (!updatedDoc) {
    return null;
  }

  return {
    id: updatedDoc.id,
    brand: updatedDoc.brand || "",
    images: updatedDoc.images,
    originalImages: updatedDoc.originalImages,
    createdAt: updatedDoc.createdAt,
    name: updatedDoc.name || undefined,
    price: updatedDoc.price || undefined,
    material: updatedDoc.material || undefined,
    craftedBy: updatedDoc.craftedBy || undefined,
    tag: updatedDoc.tag || undefined,
    customFields: updatedDoc.customFields || [],
  };
}

export async function deleteProduct(
  productId: string,
): Promise<Product | null> {
  await connectToDatabase();

  const doc = await ProductModel.findOneAndDelete({ id: productId }).lean();
  if (!doc) {
    return null;
  }

  // Delete all associated dynamic images
  if (doc.images && doc.images.length > 0) {
    await deleteStoredFiles(doc.images);
  }

  return {
    id: doc.id,
    brand: doc.brand || "",
    images: doc.images || [],
    createdAt: doc.createdAt,
    name: doc.name || undefined,
    price: doc.price || undefined,
    material: doc.material || undefined,
    craftedBy: doc.craftedBy || undefined,
    tag: doc.tag || undefined,
    customFields: doc.customFields || [],
  };
}
