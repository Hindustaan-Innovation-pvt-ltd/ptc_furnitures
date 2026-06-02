import { NextResponse } from "next/server";
import { addCatalog, readCatalogs } from "@/lib/catalogs";
import { connectToDatabase } from "@/lib/mongodb";
import { StoredFile } from "@/lib/db-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const catalogs = await readCatalogs();
    return NextResponse.json({ catalogs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to read catalogs." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const title = formData.get("title") as string;
      const description = (formData.get("description") as string) || "";
      const theme = (formData.get("theme") as string) || "minimal";
      const brand = (formData.get("brand") as string) || "";
      const pdfFile = formData.get("pdfFile") as File;

      if (!title || !title.trim()) {
        return NextResponse.json({ error: "Catalog title is required." }, { status: 400 });
      }

      if (!pdfFile || pdfFile.size === 0) {
        return NextResponse.json({ error: "PDF file is required for upload." }, { status: 400 });
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await connectToDatabase();
      const storedFile = await StoredFile.create({
        filename: pdfFile.name,
        contentType: pdfFile.type || "application/pdf",
        data: buffer,
      });

      const pdfUrl = `/api/images?id=${storedFile._id}`;

      const savedCatalog = await addCatalog({
        title,
        description,
        type: "pdf",
        pdfUrl,
        productIds: [],
        theme: theme as "minimal" | "gold" | "dark",
        brand: brand || undefined,
      });

      return NextResponse.json({ catalog: savedCatalog }, { status: 201 });
    }

    // JSON body (custom digital catalogs)
    const body = await request.json();
    const { title, description, productIds, theme, brand } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Catalog title is required." }, { status: 400 });
    }

    const savedCatalog = await addCatalog({
      title,
      description,
      type: "custom",
      productIds: productIds || [],
      theme: theme || "minimal",
      brand: brand || undefined,
    });

    return NextResponse.json({ catalog: savedCatalog }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create catalog." },
      { status: 500 }
    );
  }
}
