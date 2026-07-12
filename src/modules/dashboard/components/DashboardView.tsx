"use client";

import { useDashboardStats } from "../hooks";
import { StatsCard } from "@/components/StatsCard";
import { RecentDocumentsTable } from "./RecentDocumentsTable";
import { ExpiringDocumentsList } from "./ExpiringDocumentsList";
import { Skeleton, CardSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  LayoutDashboard
} from "lucide-react";
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/PageHeader";

interface DashboardViewProps {
  userRole?: Role;
}

export function DashboardView({ userRole }: DashboardViewProps) {
  const { data: stats, isLoading, error } = useDashboardStats();

  const isEmployee = userRole === "EMPLOYEE";
  const isAdmin = userRole === "ADMIN";

  if (isLoading) {
    return (
      <div className="page-container space-y-6 animate-fade-in pb-8">
        <div className="flex items-center gap-4 pb-4 border-b border-border/60">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
        </div>

        <CardSkeleton count={4} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2">
            <TableSkeleton rows={5} cols={4} />
          </div>
          <div className="lg:col-span-1">
            <TableSkeleton rows={4} cols={2} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="page-container p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl text-red-600 max-w-lg mx-auto mt-10">
        <p className="font-semibold">Gagal memuat statistik</p>
        <p className="text-sm mt-1 opacity-80">Silakan muat ulang halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6 animate-fade-in pb-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Ringkasan metrik dan dokumen pribadi Anda"
      />

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 h-[380px]">
          <RecentDocumentsTable documents={stats.recentDocuments} />
        </div>
        <div className="lg:col-span-1 h-[380px]">
          <ExpiringDocumentsList documents={stats.expiringDocuments} />
        </div>
      </div>
    </div>
  );
}
