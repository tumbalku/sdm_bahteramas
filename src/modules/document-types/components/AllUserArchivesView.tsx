"use client";

import Image from "next/image";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useDocuments } from "@/modules/documents/hooks";
import { DataTable, Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { CompletenessCard } from "@/components/CompletenessCard";
import { EmployeeFilterBar, EmployeeFilterState } from "@/components/EmployeeFilterBar";
import { Button } from "@/components/ui/button";
import {
  FolderArchive,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  FileText,
  User,
} from "lucide-react";
import { DocumentRecordDto } from "@/modules/documents/types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const statusConfig = {
  PENDING: { label: "Menunggu", icon: Clock, className: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  APPROVED: { label: "Disetujui", icon: CheckCircle2, className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  REJECTED: { label: "Ditolak", icon: XCircle, className: "text-red-500 bg-red-500/10 border-red-500/20" },
};

export function AllUserArchivesView() {
  const [filterValues, setFilterValues] = useState<EmployeeFilterState>({
    search: "",
    archiveCategory: "ALL",
    employmentStatusId: "",
    employeeGroupId: "",
    professionGroupId: "",
    employeePositionId: "",
  });

  // Build filters object for useDocuments hook
  const filters = useMemo(() => {
    const f: any = {};
    if (filterValues.archiveCategory && filterValues.archiveCategory !== "ALL") {
      f.archiveCategory = filterValues.archiveCategory;
    }
    if (filterValues.search.trim()) {
      f.search = filterValues.search.trim();
    }
    if (filterValues.employmentStatusId) {
      f.employmentStatusId = filterValues.employmentStatusId;
    }
    if (filterValues.employeeGroupId) {
      f.employeeGroupId = filterValues.employeeGroupId;
    }
    if (filterValues.professionGroupId) {
      f.professionGroupId = filterValues.professionGroupId;
    }
    if (filterValues.employeePositionId) {
      f.employeePositionId = filterValues.employeePositionId;
    }
    return f;
  }, [filterValues]);

  const { data: documents = [], isLoading: isLoadingDocs } = useDocuments(filters);

  // Calculate overall completeness stats across documents
  const overallStats = useMemo(() => {
    const total = documents.length;
    const uploaded = documents.filter((d) => d.status === "APPROVED").length;
    const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;
    return { uploaded, total, percentage };
  }, [documents]);

  const handleDownload = (filePath: string) => {
    window.open(`/api/v1/documents/download?file=${encodeURIComponent(filePath)}`, "_blank");
  };

  const columns: Column<DocumentRecordDto>[] = [
    {
      header: "Pegawai",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 overflow-hidden">
            {item.owner?.avatarUrl ? (
              <Image src={item.owner.avatarUrl} alt={item.owner.name} fill className="object-cover" unoptimized />
            ) : (
              item.owner?.name ? item.owner.name.charAt(0).toUpperCase() : "U"
            )}
          </div>
          <div>
            <div className="font-bold text-foreground whitespace-nowrap">{item.owner?.name || "Tidak Diketahui"}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono whitespace-nowrap mt-0.5">
              <User className="w-3 h-3 text-muted-foreground/70" />
              <span>NIP: {item.owner?.employeeId || "-"}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Jenis Dokumen",
      render: (item) => (
        <div>
          <div className="font-bold text-foreground flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono shrink-0">
              {item.documentType?.code || "DOC"}
            </span>
            <span className="truncate max-w-[200px] sm:max-w-[280px]" title={item.documentType?.name || "Dokumen"}>
              {item.documentType?.name || "Dokumen"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate" title={item.fileName}>
            {item.fileName}
          </p>
        </div>
      ),
    },
    {
      header: "Kategori Arsip",
      className: "whitespace-nowrap",
      render: (item) => {
        const cat = item.documentType?.archiveCategory || "UTAMA";
        const isUtama = cat === "UTAMA";
        const isProfesi = cat === "PROFESI";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              isUtama
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                : isProfesi
                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            {cat}
          </span>
        );
      },
    },
    {
      header: "Status Verifikasi",
      className: "whitespace-nowrap",
      render: (item) => {
        const config = statusConfig[item.status] || statusConfig.PENDING;
        const StatusIcon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      header: "Tanggal Unggah / Kadaluwarsa",
      className: "whitespace-nowrap",
      render: (item) => (
        <div className="text-xs space-y-0.5">
          <div className="text-foreground">
            <span className="text-muted-foreground">Unggah: </span>
            {item.uploadedAt ? format(new Date(item.uploadedAt), "dd MMM yyyy", { locale: idLocale }) : "-"}
          </div>
          {item.expiryDate && (
            <div className="text-muted-foreground">
              <span>Masa Berlaku: </span>
              <span className="font-medium text-foreground">
                {format(new Date(item.expiryDate), "dd MMM yyyy", { locale: idLocale })}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Aksi",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload(item.filePath)}
          className="h-8 px-3 text-xs gap-1.5 rounded-xl border-border hover:bg-accent font-semibold"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          Unduh
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header View */}
      <PageHeader
        icon={FolderArchive}
        title="Rekapitulasi Arsip Dokumen Pegawai"
        description="Pantau seluruh berkas dokumen arsip kepegawaian yang telah diunggah oleh seluruh pegawai."
        action={
          <Link href="/document-types">
            <Button variant="outline" className="rounded-full px-5 border-border hover:bg-accent font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Master Dokumen
            </Button>
          </Link>
        }
      />

      {/* Overall Completeness Indicator Summary Card */}
      <CompletenessCard
        uploaded={overallStats.uploaded}
        total={overallStats.total}
        percentage={overallStats.percentage}
        title="Rekapitulasi Dokumen Seluruh Pegawai"
        subtitle="Total berkas kepegawaian yang terdaftar dan terverifikasi di seluruh sistem"
      />

      {/* Shared Reusable Employee Filter Bar */}
      <EmployeeFilterBar values={filterValues} onChange={setFilterValues} showArchiveCategory={true} />

      {/* Compact Table */}
      <DataTable
        columns={columns}
        data={documents}
        isLoading={isLoadingDocs}
        loadingMessage="Memuat berkas arsip pegawai..."
        emptyMessage="Tidak ada berkas dokumen ditemukan"
        emptyDescription="Belum ada dokumen yang diunggah sesuai dengan pencarian atau filter ini."
        emptyIcon={FileText}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
