import { NextResponse } from "next/server";
import { ProductReviewModel } from "@/lib/db-models";
import {
  getGoogleConnection,
  syncGoogleReviews,
  updateGoogleConnection,
} from "@/lib/reviews";

export async function GET() {
  try {
    const conn = await getGoogleConnection();
    return NextResponse.json({ success: true, connection: conn });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to get connection" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, accountEmail, businessName } = body;

    if (action === "connect") {
      const email = accountEmail || "pankajtrading.raipur@gmail.com";
      const name = businessName || "Pankaj Trading Co.";

      const conn = await updateGoogleConnection({
        isConnected: true,
        accountEmail: email,
        businessName: name,
        lastSyncedAt: new Date().toLocaleString(),
      });

      // Automatically trigger sync upon connection
      await syncGoogleReviews(name);

      return NextResponse.json({ success: true, connection: conn });
    } else if (action === "disconnect") {
      const conn = await updateGoogleConnection({
        isConnected: false,
        accountEmail: "",
        businessName: "",
        lastSyncedAt: "",
      });

      // Clear synced Google reviews upon disconnection
      await ProductReviewModel.deleteMany({ source: "google" });

      return NextResponse.json({ success: true, connection: conn });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Must be 'connect' or 'disconnect'.",
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update connection",
      },
      { status: 500 },
    );
  }
}
