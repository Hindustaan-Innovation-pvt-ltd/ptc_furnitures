import { randomUUID } from "node:crypto";
import { ProductReviewModel, GoogleConnectionModel } from "./db-models";
import { connectToDatabase } from "./mongodb";

export type ProductReview = {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  text: string;
  date: string;
  status: "approved" | "pending" | "rejected";
  reviewerName?: string;
  reviewerLocation?: string;
  source?: "storefront" | "google";
};

export type ProductReviewInput = {
  productId: string;
  productName: string;
  rating: number;
  text: string;
  reviewerName?: string;
  reviewerLocation?: string;
  source?: "storefront" | "google";
  date?: string;
};


export async function readReviews(): Promise<ProductReview[]> {
  try {
    await connectToDatabase();
    const docs = await ProductReviewModel.find().sort({ date: -1 }).lean();
    return docs.map((doc: any) => ({
      id: doc.id,
      productId: doc.productId,
      productName: doc.productName,
      rating: doc.rating,
      text: doc.text,
      date: doc.date,
      status: doc.status || "approved",
      reviewerName: doc.reviewerName || "Anonymous",
      reviewerLocation: doc.reviewerLocation || "",
      source: doc.source || "storefront",
    }));
  } catch (error) {
    console.error("Failed to read reviews from database:", error);
    return [];
  }
}

export async function writeReviews(_reviews: ProductReview[]): Promise<void> {
  // Deprecated no-op
}

export async function addReview(
  input: ProductReviewInput,
): Promise<ProductReview> {
  await connectToDatabase();

  const newReview: ProductReview = {
    id: `RV-${randomUUID().substring(0, 8).toUpperCase()}`,
    productId: input.productId,
    productName: input.productName.trim(),
    rating: Math.max(1, Math.min(5, input.rating)), // clamp 1-5
    text: input.text.trim(),
    date: input.date || new Date().toISOString().split("T")[0], // YYYY-MM-DD
    status: "approved", // auto-approve for developer comfort, moderate in admin panel
    reviewerName: input.reviewerName || "Anonymous",
    reviewerLocation: input.reviewerLocation || "",
    source: input.source || "storefront",
  };

  await ProductReviewModel.create(newReview);
  return newReview;
}

export async function updateReviewStatus(
  id: string,
  status: ProductReview["status"],
): Promise<ProductReview | null> {
  await connectToDatabase();

  const doc = await ProductReviewModel.findOneAndUpdate(
    { id },
    { $set: { status } },
    { new: true },
  ).lean();

  if (!doc) {
    return null;
  }

  return {
    id: doc.id,
    productId: doc.productId,
    productName: doc.productName,
    rating: doc.rating,
    text: doc.text,
    date: doc.date,
    status: doc.status || "approved",
    reviewerName: doc.reviewerName || "Anonymous",
    reviewerLocation: doc.reviewerLocation || "",
    source: doc.source || "storefront",
  };
}

export async function deleteReview(id: string): Promise<ProductReview | null> {
  await connectToDatabase();

  const doc = await ProductReviewModel.findOneAndDelete({ id }).lean();
  if (!doc) {
    return null;
  }

  return {
    id: doc.id,
    productId: doc.productId,
    productName: doc.productName,
    rating: doc.rating,
    text: doc.text,
    date: doc.date,
    status: doc.status || "approved",
    reviewerName: doc.reviewerName || "Anonymous",
    reviewerLocation: doc.reviewerLocation || "",
    source: doc.source || "storefront",
  };
}

// Google Business Profile reviews connection helpers
export async function getGoogleConnection(): Promise<{
  isConnected: boolean;
  accountEmail?: string;
  businessName?: string;
  lastSyncedAt?: string;
}> {
  await connectToDatabase();
  const conn = await GoogleConnectionModel.findOne({}).lean();
  if (!conn) {
    return { isConnected: false };
  }
  return {
    isConnected: conn.isConnected,
    accountEmail: conn.accountEmail,
    businessName: conn.businessName,
    lastSyncedAt: conn.lastSyncedAt,
  };
}

export async function updateGoogleConnection(data: {
  isConnected: boolean;
  accountEmail?: string;
  businessName?: string;
  lastSyncedAt?: string;
}): Promise<any> {
  await connectToDatabase();
  const conn = await GoogleConnectionModel.findOneAndUpdate(
    {},
    { $set: data },
    { new: true, upsert: true }
  ).lean();
  return conn;
}

export async function syncGoogleReviews(businessName: string = "Pankaj Trading Co."): Promise<void> {
  await connectToDatabase();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Sync Failed: GOOGLE_PLACES_API_KEY is not defined in your .env file. Please add your Google Places API Key to fetch real reviews.");
  }

  let reviewsToInsert = [];

  try {
    console.log(`==> [Sync] Fetching real Google reviews for: ${businessName}`);
    // 1. Find place by text query
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(businessName + " Raipur")}&inputtype=textquery&fields=place_id,name,formatted_address&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status === "OK" && searchData.candidates?.length > 0) {
      const placeId = searchData.candidates[0].place_id;
      console.log(`==> [Sync] Found Place ID: ${placeId} for ${businessName}`);

      // 2. Fetch Place details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,formatted_address&key=${apiKey}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      if (detailsData.status === "OK" && detailsData.result?.reviews?.length > 0) {
        const fetchedReviews = detailsData.result.reviews;
        console.log(`==> [Sync] Retrieved ${fetchedReviews.length} live Google reviews.`);

        reviewsToInsert = fetchedReviews.map((rev: any) => ({
          reviewerName: rev.author_name || "Anonymous",
          reviewerLocation: "Google Maps Reviewer",
          rating: rev.rating || 5,
          text: rev.text || "",
          date: rev.time ? new Date(rev.time * 1000).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          productId: "google",
          productName: "Google Review",
          source: "google" as const,
          status: "approved" as const
        }));
      } else {
        throw new Error(`No reviews found or place details failed (Status: ${detailsData.status})`);
      }
    } else {
      throw new Error(`Place search failed (Status: ${searchData.status})`);
    }
  } catch (err: any) {
    console.error("==> [Sync] Failed to fetch live Google Reviews:", err);
    throw new Error(err.message || "Failed to fetch reviews from Google Places API.");
  }

  // Clear existing google reviews first to prevent duplicates only after successful fetch
  if (reviewsToInsert.length > 0) {
    await ProductReviewModel.deleteMany({ source: "google" });

    // Seed google reviews
    for (const review of reviewsToInsert) {
      await ProductReviewModel.create({
        id: `RV-G-${randomUUID().substring(0, 8).toUpperCase()}`,
        ...review,
      });
    }
  }

  // Update last synced timestamp and business name in settings
  await GoogleConnectionModel.updateOne(
    {},
    {
      $set: {
        lastSyncedAt: new Date().toLocaleString(),
        businessName: businessName
      }
    }
  );
}
