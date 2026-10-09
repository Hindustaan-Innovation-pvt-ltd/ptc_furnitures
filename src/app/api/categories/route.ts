import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  readCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/categories";

export async function GET() {
  try {
    const categories = await readCategories();
    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if reordering request
    if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
      await reorderCategories(body.orderedIds);
      revalidatePath("/");
      revalidatePath("/collections");
      revalidatePath("/admin/settings");
      return NextResponse.json({ success: true });
    }

    const { name, brands, productIds, description } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 },
      );
    }

    const category = await addCategory({
      name,
      brands: Array.isArray(brands) ? brands : [],
      productIds: Array.isArray(productIds) ? productIds : [],
      description,
    });

    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/admin/settings");

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to save category." },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, brands, productIds, description, position } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 },
      );
    }

    const category = await updateCategory(id, {
      name,
      brands,
      productIds,
      description,
      position,
    });

    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/admin/settings");

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to update category." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 },
      );
    }

    const success = await deleteCategory(id);
    if (!success) {
      return NextResponse.json(
        { error: "Category not found or already deleted." },
        { status: 404 },
      );
    }

    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/admin/settings");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to delete category." },
      { status: 400 },
    );
  }
}
