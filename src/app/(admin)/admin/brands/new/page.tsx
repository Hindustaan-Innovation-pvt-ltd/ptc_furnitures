import Link from "next/link";
import AdminBrandsManager from "@/components/custom/AdminBrandsManager";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import { readBrands } from "@/lib/products";
import { getBrandLogos } from "@/lib/brand-logos";



export default async function NewBrandPage() {
  const [brands, brandLogos] = await Promise.all([readBrands(), getBrandLogos()]);

  return (
    <AdminDashboardShell
      title="Create New Brand"
      subtitle="Expand the catalog catalog with premium brand workspaces"
    >
      <div className="grid gap-6">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-1.5 border border-slate-200/50 dark:border-white/5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Overview
          </Link>
        </div>

        <AdminBrandsManager brands={brands} initialBrandLogos={brandLogos} />
      </div>
    </AdminDashboardShell>
  );
}
