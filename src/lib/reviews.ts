import { randomUUID } from "node:crypto";
import { connectToDatabase } from "./mongodb";
import { ProductReviewModel } from "./db-models";
import { connection } from "next/server";

export type ProductReview = {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  text: string;
  date: string;
  status: "approved" | "pending" | "rejected";
};

export type ProductReviewInput = {
  productId: string;
  productName: string;
  rating: number;
  text: string;
};

export async function readReviews(): Promise<ProductReview[]> {
  await connection();
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
    }));
  } catch (error) {
    console.error("Failed to read reviews from database:", error);
    return [];
  }
}

export async function writeReviews(reviews: ProductReview[]): Promise<void> {
  // Deprecated no-op
}

export async function addReview(input: ProductReviewInput): Promise<ProductReview> {
  await connectToDatabase();

  const newReview: ProductReview = {
    id: `RV-${randomUUID().substring(0, 8).toUpperCase()}`,
    productId: input.productId,
    productName: input.productName.trim(),
    rating: Math.max(1, Math.min(5, input.rating)), // clamp 1-5
    text: input.text.trim(),
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    status: "approved", // auto-approve for developer comfort, moderate in admin panel
  };

  await ProductReviewModel.create(newReview);
  return newReview;
}

export async function updateReviewStatus(
  id: string,
  status: ProductReview["status"]
): Promise<ProductReview | null> {
  await connectToDatabase();

  const doc = await ProductReviewModel.findOneAndUpdate(
    { id },
    { $set: { status } },
    { new: true }
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
  };
}
