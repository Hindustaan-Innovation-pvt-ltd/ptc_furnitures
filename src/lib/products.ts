import { randomUUID } from "node:crypto";
import {
  BrandLogoModel,
  BrandModel,
  BrandWatermarkModel,
  Product as ProductModel,
  StoredFile,
} from "./db-models";
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
  premium?: boolean;
  position?: number;
  frontImage?: string;
  backImage?: string;
  originalFrontImage?: string;
  originalBackImage?: string;
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
  premium?: boolean;
  position?: number;
  frontImage?: string;
  backImage?: string;
  originalFrontImage?: string;
  originalBackImage?: string;
};

export type ProductUpdateInput = ProductInput;

export type Brand = string;

const seedBrands: Brand[] = [];

async function deleteStoredFileByURL(imagePath: string) {
  // Legacy GridFS path — delete binary data from MongoDB StoredFile collection
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
    return;
  }

  // Disk-based /upload/ files are intentionally NOT auto-deleted here.
  // Files persist on disk so they can be reassigned to other brands.
  // Use purgeUploadFile() for explicit admin-confirmed deletion.
}

/**
 * Permanently removes a single /upload/*.webp file from disk.
 * Should only be called after explicit admin confirmation in the UI.
 */
export async function purgeUploadFile(imagePath: string): Promise<void> {
  if (!imagePath.startsWith("/upload/")) return;
  try {
    const { default: fs } = await import("node:fs/promises");
    const { default: path } = await import("node:path");
    const filename = imagePath.replace(/^\/upload\//, "");
    const filePath = path.join(process.cwd(), "public", "upload", filename);
    await fs.unlink(filePath);
  } catch {
    // File may already be missing — not an error
  }
}

/**
 * Permanently removes all disk files (watermarked + original) for a product.
 * Should only be called after explicit admin confirmation in the UI.
 */
export async function purgeProductFiles(
  imagePaths: string[],
  originalImagePaths: string[],
): Promise<void> {
  const allPaths = [...new Set([...imagePaths, ...originalImagePaths])];
  await Promise.all(allPaths.map((p) => purgeUploadFile(p)));
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
    const docs = await ProductModel.find()
      .sort({ position: 1, createdAt: -1 })
      .lean();
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
      premium: !!doc.premium,
      position: doc.position ?? 0,
      frontImage: doc.frontImage || undefined,
      backImage: doc.backImage || undefined,
      originalFrontImage: doc.originalFrontImage || undefined,
      originalBackImage: doc.originalBackImage || undefined,
    }));
  } catch (error) {
    console.error("Failed to read products from database:", error);
    return [];
  }
}

export async function readBrands(): Promise<Brand[]> {
  try {
    await connectToDatabase();
    const count = await BrandModel.countDocuments();
    if (count === 0) {
      console.log("==> Seeding default brands into database...");
      await BrandModel.insertMany([
        { name: "PTC GOLD" },
        { name: "REX" },
        { name: "ALTECH" },
        { name: "ARIPLAST" },
        { name: "HALLMARK" },
        { name: "PANKAJ" },
      ]);
    }
    const docs = await BrandModel.find().lean();
    return docs.map((doc: any) => doc.name);
  } catch (error) {
    console.error("Failed to read brands from database:", error);
    return [];
  }
}

export async function addBrand(name: string): Promise<Brand> {
  const normalizedBrand = name.trim().replace(/\s+/g, " ");

  if (!normalizedBrand) {
    throw new Error("Brand name is required.");
  }

  await connectToDatabase();

  const escapedBrand = normalizedBrand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existingBrand = await BrandModel.findOne({
    name: { $regex: new RegExp(`^${escapedBrand}$`, "i") },
  });

  if (existingBrand) {
    throw new Error("Brand already exists.");
  }

  await BrandModel.create({ name: normalizedBrand });
  return normalizedBrand;
}

export async function updateBrand(
  oldName: string,
  newName: string,
): Promise<void> {
  const normalizedOld = oldName.trim().replace(/\s+/g, " ");
  const normalizedNew = newName.trim().replace(/\s+/g, " ");

  if (!normalizedNew) {
    throw new Error("Brand name is required.");
  }

  if (normalizedOld.toLowerCase() === normalizedNew.toLowerCase()) {
    if (normalizedOld === normalizedNew) return;
  }

  await connectToDatabase();

  const escapedNew = normalizedNew.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existingBrand = await BrandModel.findOne({
    name: { $regex: new RegExp(`^${escapedNew}$`, "i") },
  });

  if (
    existingBrand &&
    existingBrand.name.toLowerCase() !== normalizedOld.toLowerCase()
  ) {
    throw new Error("Brand already exists.");
  }

  const escapedOld = normalizedOld.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const oldRegex = new RegExp(`^${escapedOld}$`, "i");

  // Update brand name
  await BrandModel.updateOne({ name: oldRegex }, { name: normalizedNew });

  // Update products referencing this brand name
  await ProductModel.updateMany({ brand: oldRegex }, { brand: normalizedNew });

  // Update BrandLogo
  await BrandLogoModel.updateOne({ brand: oldRegex }, { brand: normalizedNew });

  // Update BrandWatermark
  await BrandWatermarkModel.updateOne(
    { brand: oldRegex },
    { brand: normalizedNew },
  );
}

export async function deleteBrand(name: string): Promise<void> {
  const normalized = name.trim().replace(/\s+/g, " ");
  await connectToDatabase();

  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${escaped}$`, "i");

  // Delete brand
  await BrandModel.deleteOne({ name: regex });

  // Update products referencing this brand to empty string
  await ProductModel.updateMany({ brand: regex }, { brand: "" });

  // Delete logo
  await BrandLogoModel.deleteOne({ brand: regex });

  // Delete watermark
  await BrandWatermarkModel.deleteOne({ brand: regex });
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
    premium: !!product.premium,
    position: product.position ?? 0,
    frontImage: product.frontImage || undefined,
    backImage: product.backImage || undefined,
    originalFrontImage: product.originalFrontImage || undefined,
    originalBackImage: product.originalBackImage || undefined,
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
    premium: !!doc.premium,
    position: doc.position ?? 0,
    frontImage: doc.frontImage || undefined,
    backImage: doc.backImage || undefined,
    originalFrontImage: doc.originalFrontImage || undefined,
    originalBackImage: doc.originalBackImage || undefined,
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

  // Clean up orphaned MongoDB StoredFile records for legacy /api/images?id=... URLs.
  // Disk files (/upload/*.webp) are intentionally preserved so they can be reassigned.
  if (normalizedImages.length > 0) {
    const removedImages = (existingDoc.images || []).filter(
      (image: string) => !normalizedImages.includes(image),
    );
    await deleteStoredFiles(removedImages);
  }

  // Use updateOne to avoid Mongoose 9's "No document found" error that
  // occurs when lean() is chained on findOneAndUpdate for non-_id filters.
  // The document's existence was already confirmed above via findOne.
  const finalImages =
    normalizedImages.length > 0
      ? normalizedImages
      : (existingDoc.images as string[]);
  const finalOriginalImages =
    product.originalImages ||
    (existingDoc.originalImages as string[] | undefined) ||
    finalImages;

  const setFields: any = {
    brand: product.brand.trim().replace(/\s+/g, " "),
    images: finalImages,
    originalImages: finalOriginalImages,
    name: product.name?.trim() || undefined,
    price: product.price?.trim() || undefined,
    material: product.material?.trim() || undefined,
    craftedBy: product.craftedBy?.trim() || undefined,
    tag: product.tag?.trim() || undefined,
    customFields: product.customFields || [],
    premium: !!product.premium,
    frontImage: product.frontImage || undefined,
    backImage: product.backImage || undefined,
    originalFrontImage: product.originalFrontImage || undefined,
    originalBackImage: product.originalBackImage || undefined,
  };

  if (product.position !== undefined) {
    setFields.position = product.position;
  }

  const result = await ProductModel.updateOne(
    { id: productId },
    { $set: setFields },
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return {
    id: productId,
    brand: product.brand.trim().replace(/\s+/g, " "),
    images: finalImages,
    originalImages: finalOriginalImages,
    createdAt: existingDoc.createdAt as string,
    name: product.name?.trim() || undefined,
    price: product.price?.trim() || undefined,
    material: product.material?.trim() || undefined,
    craftedBy: product.craftedBy?.trim() || undefined,
    tag: product.tag?.trim() || undefined,
    customFields: product.customFields || [],
    premium: !!product.premium,
    position:
      product.position !== undefined
        ? product.position
        : (existingDoc.position ?? 0),
    frontImage: product.frontImage || undefined,
    backImage: product.backImage || undefined,
    originalFrontImage: product.originalFrontImage || undefined,
    originalBackImage: product.originalBackImage || undefined,
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

  // Clean up legacy MongoDB StoredFile records (if any).
  // Disk files are preserved on purpose — use purgeProductFiles() for explicit deletion.
  const allImagePaths = [...(doc.images || []), ...(doc.originalImages || [])];
  if (allImagePaths.length > 0) {
    await deleteStoredFiles(allImagePaths);
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
    premium: !!doc.premium,
    position: doc.position ?? 0,
    frontImage: doc.frontImage || undefined,
    backImage: doc.backImage || undefined,
    originalFrontImage: doc.originalFrontImage || undefined,
    originalBackImage: doc.originalBackImage || undefined,
  };
}
