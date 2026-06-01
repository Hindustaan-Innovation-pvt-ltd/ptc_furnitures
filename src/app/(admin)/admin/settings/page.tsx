import AdminBrandsManager from "@/components/custom/AdminBrandsManager";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import { readBrands } from "@/lib/products";
import { getBrandLogos } from "@/lib/brand-logos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [brands, brandLogos] = await Promise.all([readBrands(), getBrandLogos()]);

  return (
    <AdminDashboardShell
      title="Brand & Watermarks Settings"
      subtitle="Manage brand names list and configure transparent brand logo watermarks"
    >
      <AdminBrandsManager brands={brands} initialBrandLogos={brandLogos} />
    </AdminDashboardShell>
  );
}
