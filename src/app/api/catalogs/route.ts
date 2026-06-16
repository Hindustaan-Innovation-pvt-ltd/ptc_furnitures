import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { addCatalog, readCatalogs } from "@/lib/catalogs";

export async function GET() {
  try {
    const catalogs = await readCatalogs();
    return NextResponse.json(
      { catalogs },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to read catalogs.",
      },
      { status: 500 },
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
      const isDefault = formData.get("isDefault") === "true";

      if (!title || !title.trim()) {
        return NextResponse.json(
          { error: "Catalog title is required." },
          { status: 400 },
        );
      }

      if (!pdfFile || pdfFile.size === 0) {
        return NextResponse.json(
          { error: "PDF file is required for upload." },
          { status: 400 },
        );
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadDir = path.join(process.cwd(), "public", "upload");
      await fs.mkdir(uploadDir, { recursive: true });

      const extension = pdfFile.name.split(".").pop() || "pdf";
      const uniqueId = crypto.randomUUID();
      const filename = `catalog_${uniqueId}.${extension}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, buffer);
      const pdfUrl = `/upload/${filename}`;

      const savedCatalog = await addCatalog({
        title,
        description,
        type: "pdf",
        pdfUrl,
        productIds: [],
        theme: theme as "minimal" | "gold" | "dark",
        brand: brand || undefined,
        isDefault,
      });

      return NextResponse.json({ catalog: savedCatalog }, { status: 201 });
    }

    // JSON body (custom digital catalogs)
    const body = await request.json();
    const { title, description, productIds, theme, brand, isDefault } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Catalog title is required." },
        { status: 400 },
      );
    }

    const savedCatalog = await addCatalog({
      title,
      description,
      type: "custom",
      productIds: productIds || [],
      theme: theme || "minimal",
      brand: brand || undefined,
      isDefault: !!isDefault,
    });

    return NextResponse.json({ catalog: savedCatalog }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create catalog.",
      },
      { status: 500 },
    );
  }
}
