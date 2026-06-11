import { connection } from "next/server";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import AdminPremiumManager from "@/components/custom/AdminPremiumManager";
import { readProducts } from "@/lib/products";

export default async function AdminPremiumPage() {
  await connection();
  const products = await readProducts();

  return (
    <AdminDashboardShell
      title="Premium Products"
      subtitle="Mark products as premium to feature them at the top of every storefront listing"
    >
      <AdminPremiumManager products={products} />
    </AdminDashboardShell>
  );
}
