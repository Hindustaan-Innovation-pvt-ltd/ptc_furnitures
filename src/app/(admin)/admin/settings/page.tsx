import { connection } from "next/server";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import AdminSettingsTabs from "@/components/custom/AdminSettingsTabs";
import { getBrandLogos } from "@/lib/brand-logos";
import { readCategories } from "@/lib/categories";
import { readBrands } from "@/lib/products";

export default async function AdminSettingsPage() {
  await connection();
  const [brands, brandLogos, categories] = await Promise.all([
    readBrands(),
    getBrandLogos(),
    readCategories(),
  ]);

  return (
    <AdminDashboardShell
      title="Brand & Category Settings"
      subtitle="Group brands into customer categories, manage brand directory, and configure watermark logos"
    >
      <AdminSettingsTabs
        brands={brands}
        brandLogos={brandLogos}
        categories={categories}
      />
    </AdminDashboardShell>
  );
}

