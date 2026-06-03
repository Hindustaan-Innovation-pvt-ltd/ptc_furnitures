import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DownloadLeadModel } from "@/lib/db-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mobile, action, productId, productName, catalogUrl } = body;

    if (!name?.trim() || !mobile?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name and mobile are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    await DownloadLeadModel.create({
      name: name.trim(),
      mobile: mobile.trim(),
      action: action || "image_download",
      productId: productId || undefined,
      productName: productName || undefined,
      catalogUrl: catalogUrl || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Download lead error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save lead." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const leads = await DownloadLeadModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id." }, { status: 400 });
    }
    await connectToDatabase();
    await DownloadLeadModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete lead." },
      { status: 500 }
    );
  }
}
