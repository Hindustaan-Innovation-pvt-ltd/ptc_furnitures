import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import AdminImageProcessor from "@/components/custom/AdminImageProcessor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProcessorPage() {
  return (
    <AdminDashboardShell
      title="Bulk AI Image Processor Hub"
      subtitle="Launch bulk background removals, apply watermarks, and inspect logs"
    >
      <AdminImageProcessor />
    </AdminDashboardShell>
  );
}
