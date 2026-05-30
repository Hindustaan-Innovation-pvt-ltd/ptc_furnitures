import Link from "next/link";
import { notFound } from "next/navigation";
import AdminProductsManager from "@/components/custom/AdminProductsManager";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import { readBrands, readProducts } from "@/lib/products";

function normalizeBrand(value: string): string {
  try {
    return decodeURIComponent(value).trim().replace(/\s+/g, " ").toLowerCase();
  } catch {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
  }
}

type BrandPageProps = {
  params: Promise<{
    brand: string;
  }>;
};

export default async function BrandPage({ params }: BrandPageProps) {
  const { brand } = await params;
  const [brands, products] = await Promise.all([readBrands(), readProducts()]);
  const selectedBrand = brands.find(
    (entry) => normalizeBrand(entry) === normalizeBrand(brand),
  );

  if (!selectedBrand) {
    notFound();
  }

  const brandProducts = products.filter(
    (product) => normalizeBrand(product.brand) === normalizeBrand(selectedBrand),
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-slate-900 transition-colors duration-300 dark:bg-[#08090d] dark:text-slate-100">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4">
          <Link
            href="/admin"
            className="text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
          >
            Back to brands
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
              Brand workspace
            </p>
            <h1 className="mt-3 text-4xl font-semibold lg:text-5xl">
              {selectedBrand}
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Upload multiple images for this brand, then review the saved
              batches below.
            </p>
          </div>
        </div>

        <AdminProductsManager
          products={brandProducts}
          initialBrand={selectedBrand}
          brandLocked
          showAddTile
        />
      </main>
      <Footer />
    </div>
  );
}
