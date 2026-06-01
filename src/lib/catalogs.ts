import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export type Catalog = {
  id: string;
  title: string;
  description?: string;
  type: "pdf" | "custom";
  pdfUrl?: string; // Local public URL or Cloudinary URL
  productIds?: string[]; // Included products (if custom)
  createdAt: string;
  theme?: "minimal" | "gold" | "dark";
};

export type CatalogInput = {
  title: string;
  description?: string;
  type: "pdf" | "custom";
  pdfUrl?: string;
  productIds?: string[];
  theme?: "minimal" | "gold" | "dark";
};

const dataDirectory = path.join(process.cwd(), "data");
const catalogsFile = path.join(dataDirectory, "catalogs.json");

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(catalogsFile);
  } catch {
    await fs.writeFile(catalogsFile, JSON.stringify([], null, 2), "utf8");
  }
}

export async function readCatalogs(): Promise<Catalog[]> {
  await ensureStore();
  try {
    const fileContents = await fs.readFile(catalogsFile, "utf8");
    const parsed = JSON.parse(fileContents) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as Catalog[];
  } catch {
    return [];
  }
}

export async function writeCatalogs(catalogs: Catalog[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(catalogsFile, JSON.stringify(catalogs, null, 2), "utf8");
}

export async function addCatalog(input: CatalogInput): Promise<Catalog> {
  const catalogs = await readCatalogs();
  const newCatalog: Catalog = {
    id: randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    type: input.type,
    pdfUrl: input.pdfUrl?.trim() || undefined,
    productIds: input.productIds || [],
    createdAt: new Date().toISOString(),
    theme: input.theme || "minimal",
  };

  catalogs.unshift(newCatalog);
  await writeCatalogs(catalogs);
  return newCatalog;
}

export async function updateCatalog(
  id: string,
  input: Partial<CatalogInput>
): Promise<Catalog | null> {
  const catalogs = await readCatalogs();
  const index = catalogs.findIndex((c) => c.id === id);
  if (index === -1) {
    return null;
  }

  const updatedCatalog: Catalog = {
    ...catalogs[index],
    title: input.title !== undefined ? input.title.trim() : catalogs[index].title,
    description:
      input.description !== undefined
        ? input.description.trim() || undefined
        : catalogs[index].description,
    type: input.type !== undefined ? input.type : catalogs[index].type,
    pdfUrl:
      input.pdfUrl !== undefined ? input.pdfUrl.trim() || undefined : catalogs[index].pdfUrl,
    productIds: input.productIds !== undefined ? input.productIds : catalogs[index].productIds,
    theme: input.theme !== undefined ? input.theme : catalogs[index].theme,
  };

  catalogs[index] = updatedCatalog;
  await writeCatalogs(catalogs);
  return updatedCatalog;
}

export async function deleteCatalog(id: string): Promise<Catalog | null> {
  const catalogs = await readCatalogs();
  const index = catalogs.findIndex((c) => c.id === id);
  if (index === -1) {
    return null;
  }

  const [removedCatalog] = catalogs.splice(index, 1);
  await writeCatalogs(catalogs);

  // If it was a PDF and stored locally, try to delete the file
  if (removedCatalog.type === "pdf" && removedCatalog.pdfUrl?.startsWith("/uploads/catalogs/")) {
    const filePath = path.join(process.cwd(), "public", removedCatalog.pdfUrl);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore errors if file is already missing
    }
  }

  return removedCatalog;
}
