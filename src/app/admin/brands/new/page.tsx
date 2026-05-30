import Link from "next/link";
import AdminBrandsManager from "@/components/custom/AdminBrandsManager";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import { readBrands } from "@/lib/products";

export default async function NewBrandPage() {
  const brands = await readBrands();

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-slate-900 transition-colors duration-300 dark:bg-[#08090d] dark:text-slate-100">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4">
          <Link
            href="/admin"
            className="text-sm font-medium text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
          >
            Back to brands
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-semibold lg:text-5xl">
              Create a new brand.
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Add a brand here, then return to the grid to open its upload
              workspace.
            </p>
          </div>
        </div>

        <AdminBrandsManager brands={brands} />
      </main>
      <Footer />
    </div>
  );
}
