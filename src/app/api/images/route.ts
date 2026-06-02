import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { StoredFile } from "@/lib/db-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing image ID" }, { status: 400 });
    }

    await connectToDatabase();

    const file = await StoredFile.findById(id);

    if (!file) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", file.contentType || "image/png");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Content-Disposition", `inline; filename="${file.filename}"`);

    // Stream the binary buffer back
    return new NextResponse(new Uint8Array(file.data), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch image" },
      { status: 500 }
    );
  }
}
