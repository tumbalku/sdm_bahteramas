import { Metadata } from "next";
import { requireRole } from "@/lib/auth-utils";
import { Role } from "@prisma/client";
import { StatisticsView } from "@/modules/dashboard/components/StatisticsView";

export const metadata: Metadata = {
  title: "Statistik Kepegawaian | SIMDP",
  description: "Statistik global dan operasional dokumen pegawai",
};

export default async function StatisticsPage() {
  await requireRole([Role.ADMIN, Role.STAFF]);
  return <StatisticsView />;
}
