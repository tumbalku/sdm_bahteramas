import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth-utils";
import { DashboardView } from "@/modules/dashboard/components/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard | SMDP Portal",
  description: "Ringkasan metrik dan aktivitas dokumen",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <div className="page-container">
      <DashboardView userRole={user?.role} />
    </div>
  );
}
