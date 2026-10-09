import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import Footer from "@/components/custom/Footer";
import HeroSection from "@/components/custom/HeroSection";
import Navigation from "@/components/custom/Navigation";
import Products from "@/components/custom/products";
import Reviews from "@/components/custom/reviews";
import WhatsNew from "@/components/custom/WhatsNew";
import { getBrandLogos, loadLogosIntoCache } from "@/lib/brand-logos";
import { readBrands, readProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "PTC Furnitures | Re-imagined Furniture & Seating Solutions",
  description:
    "Discover high-quality chairs, office desks, curated collections, and digital catalogs by PTC Furnitures.",
  alternates: {
    canonical: "/",
  },
};

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

import { readCategories } from "@/lib/categories";

async function HomeProductsLoader({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[]; category?: string | string[] }>;
}) {
  await connection();
  await loadLogosIntoCache();
  const [brandLogos, categories, initialProducts, initialBrands, params] =
    await Promise.all([
      getBrandLogos(),
      readCategories(),
      readProducts(),
      readBrands(),
      searchParams || Promise.resolve(undefined),
    ]);
  const q = params?.q;
  const initialSearchTerm = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");
  const c = params?.category;
  const initialCategory = Array.isArray(c) ? (c[0] ?? "all") : (c ?? "all");

  return (
    <>
      <Products
        initialProducts={initialProducts}
        initialBrands={initialBrands}
        initialSearchTerm={initialSearchTerm}
        initialCategory={initialCategory}
        brandLogos={brandLogos}
        categories={categories}
        maxItems={9}
      />
      <hr className="border-slate-200 dark:border-white/10" />
      <WhatsNew products={initialProducts} />
    </>
  );
}
