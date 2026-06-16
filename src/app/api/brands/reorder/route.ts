import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { reorderBrands } from "@/lib/products";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("brands" in body) ||
      !Array.isArray((body as any).brands) ||
      !(body as any).brands.every((item: any) => typeof item === "string")
    ) {
      return NextResponse.json(
        { error: "Invalid brands array payload." },
        { status: 400 },
      );
    }

    const orderedBrands = (body as any).brands as string[];
    await reorderBrands(orderedBrands);

    // Force revalidation of all public pages listing brands and products
    revalidatePath("/");
    revalidatePath("/collections");
    revalidatePath("/catalogs");

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reorder brands.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

