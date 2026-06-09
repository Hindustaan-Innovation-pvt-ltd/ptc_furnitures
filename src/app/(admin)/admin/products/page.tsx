import { connection } from "next/server";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import AdminProductsCatalog from "@/components/custom/AdminProductsCatalog";
import { readBrands, readProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  await connection();
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
