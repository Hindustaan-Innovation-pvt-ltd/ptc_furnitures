import { NextResponse } from "next/server";
import { DownloadLeadModel } from "@/lib/db-models";
import { connectToDatabase } from "@/lib/mongodb";
import { sendDownloadLeadEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mobile, action, productId, productName, catalogUrl } = body;

    if (!name?.trim() || !mobile?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name and mobile are required." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const lead = await DownloadLeadModel.create({
      name: name.trim(),
      mobile: mobile.trim(),
      action: action || "image_download",
      productId: productId || undefined,
      productName: productName || undefined,
      catalogUrl: catalogUrl || undefined,
    });

    // Send email alert asynchronously
    await sendDownloadLeadEmail({
      name: lead.name,
      mobile: lead.mobile,
      action: lead.action,
      productId: lead.productId,
      productName: lead.productName,
      catalogUrl: lead.catalogUrl,
      createdAt: lead.createdAt,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Download lead error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save lead." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const leads = await DownloadLeadModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, leads });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id." },
        { status: 400 },
      );
    }
    await connectToDatabase();
    await DownloadLeadModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete lead." },
      { status: 500 },
    );
  }
}
