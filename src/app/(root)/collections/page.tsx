import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import BreadcrumbJsonLd from "@/components/custom/BreadcrumbJsonLd";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import ProductsCollections from "@/components/custom/products/collections";
import { getBrandLogos, loadLogosIntoCache } from "@/lib/brand-logos";
import { readBrands, readProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Curated Collections",
  description:
    "Explore our complete collection of commercial, executive, and ergonomic furniture crafted for modern living and workspaces.",
  alternates: {
    canonical: "/collections",
  },
};

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export default async function page({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[]; brand?: string | string[] }>;
}) {
  return (
    <section>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Collections", url: "/collections" },
        ]}
      />
      <Navigation />
      <div className="max-w-2xl mx-auto py-12 pb-24 px-4 text-center transition-colors duration-300">
        <h1 className="text-6xl font-bold mb-4">
          Curated <span className="text-red-700">Collections</span>
        </h1>
        <span className="text-base">
          Furniture crafted for considered living — built <br /> to endure,
          designed to inspire.
        </span>
      </div>
      <Suspense
        fallback={
          <div className="text-center py-20 text-slate-500">
            Loading collection...
          </div>
        }
      >
        <CollectionsLoader searchParams={searchParams} />
      </Suspense>
      <Footer />
    </section>
  );
}

async function CollectionsLoader({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[]; brand?: string | string[] }>;
}) {
  await connection();
  await loadLogosIntoCache();
  const brandLogos = await getBrandLogos();
  const productsPromise = readProducts();
  const brandsPromise = readBrands();
  const [initialProducts, initialBrands, params] = await Promise.all([
    productsPromise,
    brandsPromise,
    searchParams || Promise.resolve(undefined),
  ]);
  const q = params?.q;
  const initialSearchTerm = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");
  const b = params?.brand;
  const initialBrand = Array.isArray(b) ? (b[0] ?? "all") : (b ?? "all");

  return (
    <ProductsCollections
      initialProducts={initialProducts}
      initialBrands={initialBrands}
      initialSearchTerm={initialSearchTerm}
      initialBrand={initialBrand}
      brandLogos={brandLogos}
    />
  );
}
