import { NextResponse } from "next/server";
import {
  getGoogleConnection,
  readReviews,
  syncGoogleReviews,
} from "@/lib/reviews";

export async function POST() {
  try {
    const conn = await getGoogleConnection();
    if (!conn.isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot sync. Google account is not connected.",
        },
        { status: 400 },
      );
    }

    await syncGoogleReviews(conn.businessName || "Pankaj Trading Co.");
    const reviews = await readReviews();

    return NextResponse.json({
      success: true,
      lastSyncedAt: new Date().toLocaleString(),
      reviews: reviews.filter((r) => r.source === "google"),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to sync reviews" },
      { status: 500 },
    );
  }
}
