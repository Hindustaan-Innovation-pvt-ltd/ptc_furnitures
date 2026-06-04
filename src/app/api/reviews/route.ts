import { NextResponse } from "next/server";
import {
  addReview,
  deleteReview,
  readReviews,
  updateReviewStatus,
} from "@/lib/reviews";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const reviews = await readReviews();

    if (productId) {
      // For storefront customer views: only return approved reviews for this product
      const filtered = reviews.filter(
        (r) => r.productId === productId && r.status === "approved",
      );
      return NextResponse.json({ success: true, reviews: filtered });
    }

    // For admin view: return all reviews
    return NextResponse.json({ success: true, reviews });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: "Failed to read reviews" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, rating, text } = body;

    if (!productId || !productName || !rating || !text) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Product ID, product name, rating, and review text are required.",
        },
        { status: 400 },
      );
    }

    const newReview = await addReview({
      productId,
      productName,
      rating: Number(rating),
      text,
    });

    return NextResponse.json(
      { success: true, review: newReview },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create review" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Review ID and status are required." },
        { status: 400 },
      );
    }

    const updated = await updateReviewStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update review status",
      },
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
        { success: false, error: "Review ID is required." },
        { status: 400 },
      );
    }

    const deleted = await deleteReview(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, review: deleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete review" },
      { status: 500 },
    );
  }
}
