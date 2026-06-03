import { randomUUID } from "node:crypto";
import { connectToDatabase } from "./mongodb";
import { CatalogModel, StoredFile } from "./db-models";

export type Catalog = {
  id: string;
  title: string;
  description?: string;
  type: "pdf" | "custom";
  pdfUrl?: string;
  productIds?: string[];
  createdAt: string;
  theme?: "minimal" | "gold" | "dark";
  brand?: string;
};

export type CatalogInput = {
  title: string;
  description?: string;
  type: "pdf" | "custom";
  pdfUrl?: string;
  productIds?: string[];
  theme?: "minimal" | "gold" | "dark";
  brand?: string;
};

export async function readCatalogs(): Promise<Catalog[]> {
  try {
    await connectToDatabase();
    const docs = await CatalogModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description || undefined,
      type: doc.type,
      pdfUrl: doc.pdfUrl || undefined,
      productIds: doc.productIds || [],
      createdAt: doc.createdAt,
      theme: doc.theme || "minimal",
      brand: doc.brand || undefined,
    }));
  } catch (error) {
    console.error("Failed to read catalogs from database:", error);
    return [];
  }
}

export async function writeCatalogs(catalogs: Catalog[]): Promise<void> {
  // Deprecated no-op
}

export async function addCatalog(input: CatalogInput): Promise<Catalog> {
  await connectToDatabase();

  const newCatalog: Catalog = {
    id: randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    type: input.type,
    pdfUrl: input.pdfUrl?.trim() || undefined,
    productIds: input.productIds || [],
    createdAt: new Date().toISOString(),
    theme: input.theme || "minimal",
    brand: input.brand?.trim() || undefined,
  };

  await CatalogModel.create(newCatalog);
  return newCatalog;
}

export async function updateCatalog(
  id: string,
  input: Partial<CatalogInput>
): Promise<Catalog | null> {
  await connectToDatabase();

  const existing = await CatalogModel.findOne({ id });
  if (!existing) {
    return null;
  }

  const updates: any = {};
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description.trim() || undefined;
  if (input.type !== undefined) updates.type = input.type;
  if (input.pdfUrl !== undefined) updates.pdfUrl = input.pdfUrl.trim() || undefined;
  if (input.productIds !== undefined) updates.productIds = input.productIds;
  if (input.theme !== undefined) updates.theme = input.theme;
  if (input.brand !== undefined) updates.brand = input.brand.trim() || undefined;

  const doc = await CatalogModel.findOneAndUpdate(
    { id },
    { $set: updates },
    { new: true }
  ).lean();

  if (!doc) {
    return null;
  }

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description || undefined,
    type: doc.type,
    pdfUrl: doc.pdfUrl || undefined,
    productIds: doc.productIds || [],
    createdAt: doc.createdAt,
    theme: doc.theme || "minimal",
    brand: doc.brand || undefined,
  };
}

export async function deleteCatalog(id: string): Promise<Catalog | null> {
  await connectToDatabase();

  const doc = await CatalogModel.findOneAndDelete({ id }).lean();
  if (!doc) {
    return null;
  }

  // Delete PDF stored in MongoDB if it exists
  if (doc.type === "pdf" && doc.pdfUrl?.startsWith("/api/images")) {
    try {
      const urlObj = new URL(doc.pdfUrl, "http://localhost");
      const fileId = urlObj.searchParams.get("id");
      if (fileId) {
        await StoredFile.findByIdAndDelete(fileId);
      }
    } catch {
      // Ignore
    }
  }

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description || undefined,
    type: doc.type,
    pdfUrl: doc.pdfUrl || undefined,
    productIds: doc.productIds || [],
    createdAt: doc.createdAt,
    theme: doc.theme || "minimal",
    brand: doc.brand || undefined,
  };
}
