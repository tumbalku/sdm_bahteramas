import { Metadata } from "next";
import { DashboardView } from "@/modules/dashboard/components/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard | SMDP Portal",
  description: "Ringkasan metrik dan aktivitas dokumen",
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <DashboardView />
    </div>
  );
}
