import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import AdminCatalogsManager from "@/components/custom/AdminCatalogsManager";
import { readCatalogs } from "@/lib/catalogs";
import { readProducts, readBrands } from "@/lib/products";



export default async function AdminCatalogsPage() {
  const [catalogs, products, brands] = await Promise.all([
    readCatalogs(),
    readProducts(),
    readBrands(),
  ]);

  return (
    <AdminDashboardShell
      title="Brochures & Catalogs Hub"
      subtitle="Upload catalog PDFs or build custom digital interactive product portfolios"
    >
      <AdminCatalogsManager catalogs={catalogs} products={products} brands={brands} />
    </AdminDashboardShell>
  );
}
