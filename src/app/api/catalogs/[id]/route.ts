import { NextResponse } from "next/server";
import { deleteCatalog, updateCatalog } from "@/lib/catalogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, productIds, theme, type, pdfUrl } = body;

    const savedCatalog = await updateCatalog(id, {
      title,
      description,
      productIds,
      theme,
      type,
      pdfUrl,
    });

    if (!savedCatalog) {
      return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
    }

    return NextResponse.json({ catalog: savedCatalog });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update catalog." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const removedCatalog = await deleteCatalog(id);

    if (!removedCatalog) {
      return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
    }

    return NextResponse.json({ catalog: removedCatalog });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete catalog." },
      { status: 500 }
    );
  }
}
