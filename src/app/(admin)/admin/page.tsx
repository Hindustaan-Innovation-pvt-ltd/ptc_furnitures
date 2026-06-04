import AdminBrandGrid from "@/components/custom/AdminBrandGrid";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import { readBrands, readProducts } from "@/lib/products";

export default async function AdminPage() {
  const [products, brands] = await Promise.all([readProducts(), readBrands()]);

  // Compute analytics metrics
  const totalProducts = products.length;
  const activeBrands = brands.length;
  const brandedProducts = products.filter(
    (p) => (p.brand || "").trim() !== "",
  ).length;
  const unassignedProducts = products.filter(
    (p) => (p.brand || "").trim() === "",
  ).length;
  const totalImages = products.reduce((acc, p) => acc + p.images.length, 0);

  return (
    <AdminDashboardShell
      title="Overview Hub"
      subtitle="Catalog metrics, connection health, and brand workspaces"
    >
      <div className="grid gap-8">
        {/* Metric Cards Layout */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Products */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Catalog
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {totalProducts}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Total items in the database
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.25 7.5L12 12L3.75 7.5M20.25 7.5V16.5L12 21L3.75 16.5V7.5M20.25 7.5L12 3L3.75 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Total Active Brands */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Brands
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {activeBrands}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Branded catalog workspaces
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.59 4.59A2 2 0 1111 8H2.414a2 2 0 01-.586-1.414V2.414A2 2 0 013.243.586L9.59 4.59zM10.5 6a3.75 3.75 0 11-7.5 0A3.75 3.75 0 0110.5 6z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Branded vs Unassigned */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Branded / Free
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {brandedProducts} /{" "}
                <span className="text-slate-400">{unassignedProducts}</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Assigned vs unassigned batches
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 7.5L12 12M12 12L5 7.5M12 12v9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 4: Total Stored Images */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Image Assets
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {totalImages}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Total MongoDB stored assets
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V6.75z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Brand Workspace Selection Grid */}
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 shadow-xs">
          <div className="border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Interactive Brand Workspaces
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select a brand below to launch its uploader, catalog manager, and
              dedicated drag-and-drop workspace stage.
            </p>
          </div>

          <AdminBrandGrid brands={brands} products={products} />
        </div>
      </div>
    </AdminDashboardShell>
  );
}
