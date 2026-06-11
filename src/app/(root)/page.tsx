import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import HeroSection from "@/components/custom/HeroSection";
import Products from "@/components/custom/products";
import Reviews from "@/components/custom/reviews";
import { Button } from "@/components/ui/button";
import { readBrands, readProducts } from "@/lib/products";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  return (
    <div className="min-h-screen bg-[#f8f8f8] text-slate-900 dark:bg-[#08090d] dark:text-slate-100 transition-colors duration-300">
      <Navigation />
      <HeroSection />
      <hr className="border-slate-200 dark:border-white/10 mt-32" />
      <Suspense
        fallback={
          <div className="text-center py-20 text-slate-500">
            Loading products...
          </div>
        }
      >
        <HomeProductsLoader searchParams={searchParams} />
      </Suspense>
      <hr className="border-slate-200 dark:border-white/10" />
      <Reviews />
      <Footer />
    </div>
  );
}

async function HomeProductsLoader({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  await connection();
  const productsPromise = readProducts();
  const brandsPromise = readBrands();

  const [initialProducts, initialBrands, params] = await Promise.all([
    productsPromise,
    brandsPromise,
    searchParams || Promise.resolve(undefined),
  ]);
  const q = params?.q;
  const initialSearchTerm = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");

  return (
    <Products
      initialProducts={initialProducts}
      initialBrands={initialBrands}
      initialSearchTerm={initialSearchTerm}
      maxItems={9}
    />
  );
}
