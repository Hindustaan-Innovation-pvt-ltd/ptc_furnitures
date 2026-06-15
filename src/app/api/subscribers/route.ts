import { NextResponse } from "next/server";
import { NewsletterSubscriberModel } from "@/lib/db-models";
import { sendSubscriberEmail } from "@/lib/mail";
import { connectToDatabase } from "@/lib/mongodb";

// GET — fetch all subscribers (admin use)
export async function GET() {
  try {
    await connectToDatabase();
    const subscribers = await NewsletterSubscriberModel.find()
      .sort({ subscribedAt: -1 })
      .lean();
    return NextResponse.json({ success: true, subscribers });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscribers" },
      { status: 500 },
    );
  }
}

// POST — new subscription from StayInTouchForm
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Check for duplicate
    const existing = await NewsletterSubscriberModel.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "This email is already subscribed." },
        { status: 409 },
      );
    }

    const subscriber = await NewsletterSubscriberModel.create({ email });

    // Fire email notification (non-blocking failure is fine)
    await sendSubscriberEmail({
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt,
    }).catch((err) => console.error("[Subscriber Email]", err));

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: "Failed to subscribe. Please try again." },
      { status: 500 },
    );
  }
}

// DELETE — remove a subscriber by email (query param)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Missing email parameter" },
        { status: 400 },
      );
    }
    await connectToDatabase();
    const deleted = await NewsletterSubscriberModel.findOneAndDelete({
      email: email.toLowerCase(),
    });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Subscriber not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete subscriber" },
      { status: 500 },
    );
  }
}
