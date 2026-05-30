import "server-only";
import { NextResponse } from "next/server";
import { readProducts } from "@/lib/products";
import { isCloudinaryUrl } from "@/lib/cloudinary-url";
import { createBackgroundRemovedVariant, hasCloudinaryCredentials } from "@/lib/cloudinary";
import { readBrandWatermarks } from "@/lib/brand-watermarks";

type ReportEntry = {
  brand: string;
  original: string;
  derived: string | null;
  success: boolean;
  error?: string;
};

export async function POST() {
  if (!hasCloudinaryCredentials()) {
    return NextResponse.json({ error: "Missing Cloudinary credentials" }, { status: 400 });
  }

  const [products, watermarks] = await Promise.all([
    readProducts(),
    readBrandWatermarks(),
  ]);

  const tasks: Array<{ brand: string; image: string }> = [];

  for (const product of products) {
    for (const img of product.images) {
      if (isCloudinaryUrl(img)) {
        tasks.push({ brand: product.brand, image: img });
      }
    }
  }

  // Process in parallel with a small concurrency limit to avoid throttling.
  const concurrency = 4;
  const results: ReportEntry[] = [];

  async function worker() {
    while (tasks.length > 0) {
      const task = tasks.shift();
      if (!task) break;

      const watermark = watermarks[task.brand];

      try {
        const derived = await createBackgroundRemovedVariant(task.image, true, watermark);
        results.push({ brand: task.brand, original: task.image, derived: derived, success: Boolean(derived) });
      } catch (err: any) {
        results.push({ brand: task.brand, original: task.image, derived: null, success: false, error: String(err?.message ?? err) });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  return NextResponse.json({ processed: results.length, results });
}
