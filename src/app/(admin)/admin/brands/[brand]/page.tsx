import Link from "next/link";
import { notFound } from "next/navigation";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import AdminProductsManager from "@/components/custom/AdminProductsManager";
import { readBrands, readProducts } from "@/lib/products";

function normalizeBrand(value: string | undefined | null): string {
  const safeVal = value || "";
  try {
    return decodeURIComponent(safeVal)
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  } catch {
    return safeVal.trim().replace(/\s+/g, " ").toLowerCase();
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
    (product) =>
      normalizeBrand(product.brand) === normalizeBrand(selectedBrand),
  );

  return (
    <AdminDashboardShell
      title={`${selectedBrand} Workspace`}
      subtitle={`Workspace uploader and drag-and-drop staging area for ${selectedBrand}`}
    >
      <div className="grid gap-6">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-1.5 border border-slate-200/50 dark:border-white/5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Overview
          </Link>
        </div>

        <AdminProductsManager
          products={brandProducts}
          brands={brands}
          initialBrand={selectedBrand}
          brandLocked
          showAddTile
        />
      </div>
    </AdminDashboardShell>
  );
}
