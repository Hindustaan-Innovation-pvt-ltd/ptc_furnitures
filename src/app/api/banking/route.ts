import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { BankingDetailsModel } from "@/lib/db-models";



/** GET — return all banking entries (sorted by createdAt asc) */
export async function GET() {

  try {
    await connectToDatabase();

    // Auto-migrate: set default isActive to true for documents that don't have it
    await BankingDetailsModel.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    const entries = await BankingDetailsModel.find().sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, entries });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/** POST — create a new banking entry */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const doc = await BankingDetailsModel.create({
      label: body.label?.trim() || "Bank Account",
      isActive: body.isActive ?? true,
      accountHolderName: body.accountHolderName?.trim() ?? "",
      bankName: body.bankName?.trim() ?? "",
      accountNumber: body.accountNumber?.trim() ?? "",
      ifscCode: body.ifscCode?.trim().toUpperCase() ?? "",
      accountType: body.accountType?.trim() ?? "Current",
      branchName: body.branchName?.trim() || undefined,
      upiId: body.upiId?.trim() || undefined,
      upiName: body.upiName?.trim() || undefined,
      qrImage: body.qrImage || undefined,
      notes: body.notes?.trim() || undefined,
    });

    return NextResponse.json({ success: true, entry: doc });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/** PATCH — update a single banking entry by ?id= */
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    const body = await request.json();
    await connectToDatabase();

    const update: Record<string, any> = { updatedAt: new Date() };
    if (body.label !== undefined) update.label = body.label?.trim() || "Bank Account";
    if (body.isActive !== undefined) update.isActive = body.isActive;
    if (body.accountHolderName !== undefined) update.accountHolderName = body.accountHolderName?.trim() ?? "";
    if (body.bankName !== undefined) update.bankName = body.bankName?.trim() ?? "";
    if (body.accountNumber !== undefined) update.accountNumber = body.accountNumber?.trim() ?? "";
    if (body.ifscCode !== undefined) update.ifscCode = body.ifscCode?.trim().toUpperCase() ?? "";
    if (body.accountType !== undefined) update.accountType = body.accountType?.trim() ?? "Current";
    if (body.branchName !== undefined) update.branchName = body.branchName?.trim() || undefined;
    if (body.upiId !== undefined) update.upiId = body.upiId?.trim() || undefined;
    if (body.upiName !== undefined) update.upiName = body.upiName?.trim() || undefined;
    if (body.qrImage !== undefined) update.qrImage = body.qrImage || undefined;
    if (body.notes !== undefined) update.notes = body.notes?.trim() || undefined;

    const updated = await BankingDetailsModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, entry: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/** DELETE — remove a banking entry by ?id= */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    await connectToDatabase();
    await BankingDetailsModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
