import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import AdminProductsCatalog from "@/components/custom/AdminProductsCatalog";
import { readBrands, readProducts } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, brands] = await Promise.all([readProducts(), readBrands()]);

  return (
    <AdminDashboardShell
      title="Global Products Catalog"
      subtitle="Unified database search, filtering, and workspace brand assignments"
    >
      <AdminProductsCatalog products={products} brands={brands} />
    </AdminDashboardShell>
  );
}
