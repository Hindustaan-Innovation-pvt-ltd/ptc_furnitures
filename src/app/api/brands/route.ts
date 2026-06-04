import { NextResponse } from "next/server";
import { addBrand, isBrandInput, readBrands } from "@/lib/products";

export async function GET() {
  const brands = await readBrands();
  return NextResponse.json({ brands });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isBrandInput(body)) {
      return NextResponse.json(
        { error: "Invalid brand payload." },
        { status: 400 },
      );
    }

    const brand = await addBrand(body.name);
    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save brand.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
