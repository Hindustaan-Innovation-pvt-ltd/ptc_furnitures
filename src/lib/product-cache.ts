import type { Product } from "@/lib/products";

export const PRODUCTS_CACHE_KEY = "/api/products";

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(PRODUCTS_CACHE_KEY);
  const payload = (await response.json()) as { products?: Product[] };

  return Array.isArray(payload.products) ? payload.products : [];
}