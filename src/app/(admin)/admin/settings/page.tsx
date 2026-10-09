import { connection } from "next/server";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import AdminSettingsTabs from "@/components/custom/AdminSettingsTabs";
import { getBrandLogos } from "@/lib/brand-logos";
import { readCategories } from "@/lib/categories";
import { readBrands, readProducts } from "@/lib/products";

export default async function AdminSettingsPage() {
  await connection();
  const [brands, brandLogos, categories, rawProducts] = await Promise.all([
    readBrands(),
    getBrandLogos(),
    readCategories(),
    readProducts(),
  ]);

  const products = JSON.parse(JSON.stringify(rawProducts));

  return (
    <AdminDashboardShell
      title="Brand & Category Settings"
      subtitle="Group brands into customer categories, manage brand directory, and configure watermark logos"
    >
      <AdminSettingsTabs
        brands={brands}
        brandLogos={brandLogos}
        categories={categories}
        products={products}
      />
    </AdminDashboardShell>
  );
}

