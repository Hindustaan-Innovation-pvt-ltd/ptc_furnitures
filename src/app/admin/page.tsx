import AdminBrandGrid from "@/components/custom/AdminBrandGrid";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import { readBrands, readProducts } from "@/lib/products";

export default async function AdminPage() {
  const [products, brands] = await Promise.all([readProducts(), readBrands()]);

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-slate-900 transition-colors duration-300 dark:bg-[#08090d] dark:text-slate-100">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-semibold lg:text-5xl">
            Choose a brand workspace.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Open a brand to upload images in bulk, or create a new brand from
            the grid.
          </p>
        </div>

        <AdminBrandGrid brands={brands} products={products} />
      </main>
      <Footer />
    </div>
  );
}
