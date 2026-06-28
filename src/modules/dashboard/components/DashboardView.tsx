"use client";

import { useDashboardStats } from "../hooks";
import { StatsCard } from "./StatsCard";
import { RecentDocumentsTable } from "./RecentDocumentsTable";
import { ExpiringDocumentsList } from "./ExpiringDocumentsList";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  LayoutDashboard,
  Loader2
} from "lucide-react";
import { useSession } from "next-auth/react";

export function DashboardView() {
  const { data: session } = useSession();
  const { data: stats, isLoading, error } = useDashboardStats();

  const role = session?.user?.role;
  const isEmployee = role === "EMPLOYEE";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary opacity-50" />
        <p className="text-muted-foreground">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl text-red-600 max-w-lg mx-auto mt-10">
        <p className="font-semibold">Gagal memuat statistik</p>
        <p className="text-sm mt-1 opacity-80">Silakan muat ulang halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {isEmployee 
              ? "Ringkasan metrik dan dokumen pribadi Anda"
              : "Ringkasan metrik dan aktivitas dokumen seluruh pegawai"}
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Dokumen"
          value={stats.totalDocuments}
          icon={FileText}
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Menunggu Verifikasi"
          value={stats.pendingDocuments}
          icon={Clock}
          iconClassName="bg-amber-100 text-amber-600"
        />
        <StatsCard
          title="Disetujui"
          value={stats.approvedDocuments}
          icon={CheckCircle}
          iconClassName="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Ditolak"
          value={stats.rejectedDocuments}
          icon={XCircle}
          iconClassName="bg-red-100 text-red-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 h-[450px]">
          <RecentDocumentsTable documents={stats.recentDocuments} />
        </div>
        <div className="lg:col-span-1 h-[450px]">
          <ExpiringDocumentsList documents={stats.expiringDocuments} />
        </div>
      </div>
    </div>
  );
}
