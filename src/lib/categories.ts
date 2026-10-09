import { CategoryModel } from "./db-models";
import { connectToDatabase } from "./mongodb";

export type Category = {
  id: string;
  name: string;
  brands: string[];
  position: number;
  description?: string;
  createdAt?: string;
};

let isCategoriesSeeded = false;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function readCategories(): Promise<Category[]> {
  try {
    await connectToDatabase();

    if (!isCategoriesSeeded) {
      const count = await CategoryModel.countDocuments();
      if (count === 0) {
        console.log("==> Initializing default brand categories...");
        const defaultCats = [
          {
            id: "office-series",
            name: "Office Series",
            brands: ["PTC", "PTC GOLD"],
            position: 0,
            description: "Ergonomic chairs, desks, and corporate workspaces",
          },
          {
            id: "living-seating",
            name: "Living & Seating",
            brands: ["ALTECH", "REX"],
            position: 1,
            description: "Modern comfort and executive premium seating",
          },
        ];
        await CategoryModel.insertMany(defaultCats).catch(() => {});
      }
      isCategoriesSeeded = true;
    }

    const docs = await CategoryModel.find()
      .sort({ position: 1, createdAt: 1 })
      .lean();

    return docs.map((doc: any) => ({
      id: String(doc.id || doc._id),
      name: String(doc.name || ""),
      brands: Array.isArray(doc.brands) ? doc.brands.map(String) : [],
      position: typeof doc.position === "number" ? doc.position : 0,
      description: doc.description ? String(doc.description) : undefined,
      createdAt: doc.createdAt ? String(doc.createdAt) : undefined,
    }));
  } catch (error) {
    console.error("Failed to read categories from database:", error);
    return [];
  }
}

export async function addCategory(params: {
  name: string;
  brands: string[];
  description?: string;
}): Promise<Category> {
  const normalizedName = params.name.trim();
  if (!normalizedName) {
    throw new Error("Category name is required.");
  }

  await connectToDatabase();

  const id = slugify(normalizedName) || `cat-${Date.now()}`;
  const existing = await CategoryModel.findOne({
    $or: [
      { id },
      { name: { $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
    ],
  });

  if (existing) {
    throw new Error("A category with this name already exists.");
  }

  const lastCat = await CategoryModel.findOne().sort({ position: -1 }).lean();
  const nextPosition = lastCat && typeof lastCat.position === "number" ? lastCat.position + 1 : 0;

  const brands = Array.from(
    new Set((params.brands || []).map((b) => b.trim()).filter(Boolean)),
  );

  const newDoc = await CategoryModel.create({
    id,
    name: normalizedName,
    brands,
    position: nextPosition,
    description: params.description?.trim() || "",
    createdAt: new Date().toISOString(),
  });

  return {
    id: newDoc.id,
    name: newDoc.name,
    brands: newDoc.brands,
    position: newDoc.position,
    description: newDoc.description || undefined,
    createdAt: newDoc.createdAt,
  };
}

export async function updateCategory(
  id: string,
  updates: {
    name?: string;
    brands?: string[];
    position?: number;
    description?: string;
  },
): Promise<Category> {
  await connectToDatabase();

  const existing = await CategoryModel.findOne({ id });
  if (!existing) {
    throw new Error("Category not found.");
  }

  if (updates.name !== undefined) {
    const trimmed = updates.name.trim();
    if (!trimmed) throw new Error("Category name cannot be empty.");
    // check duplicate name
    const dup = await CategoryModel.findOne({
      id: { $ne: id },
      name: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (dup) throw new Error("Another category already has this name.");
    existing.name = trimmed;
  }

  if (updates.brands !== undefined) {
    existing.brands = Array.from(
      new Set((updates.brands || []).map((b) => b.trim()).filter(Boolean)),
    );
  }

  if (typeof updates.position === "number") {
    existing.position = updates.position;
  }

  if (updates.description !== undefined) {
    existing.description = updates.description.trim();
  }

  await existing.save();

  return {
    id: existing.id,
    name: existing.name,
    brands: existing.brands,
    position: existing.position,
    description: existing.description || undefined,
    createdAt: existing.createdAt,
  };
}

export async function deleteCategory(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await CategoryModel.deleteOne({ id });
  return res.deletedCount > 0;
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await connectToDatabase();
  const ops = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { id },
      update: { $set: { position: index } },
    },
  }));
  if (ops.length > 0) {
    await CategoryModel.bulkWrite(ops);
  }
}
