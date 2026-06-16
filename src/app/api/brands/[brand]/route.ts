import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteBrand, updateBrand } from "@/lib/products";

type RouteContext = {
  params: Promise<{
    brand: string;
  }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { brand } = await params;
    const decodedBrand = decodeURIComponent(brand);
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("name" in body) ||
      typeof (body as any).name !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid brand name payload." },
        { status: 400 },
      );
    }

    const newName = (body as any).name;
    await updateBrand(decodedBrand, newName);

    // Force revalidation of all public pages listing brands and products
    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/catalogs");

    return NextResponse.json({ success: true, brand: newName });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update brand.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { brand } = await params;
    const decodedBrand = decodeURIComponent(brand);
    await deleteBrand(decodedBrand);

    // Force revalidation of all public pages listing brands and products
    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/catalogs");

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete brand.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

