"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  FolderArchive,
  Trash2,
  UploadCloud,
  User,
  XCircle,
} from "lucide-react";
import { DocumentStatus } from "@prisma/client";
import { DataTable, Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { CompletenessCard } from "@/components/CompletenessCard";
import { EmployeeFilterBar, EmployeeFilterState } from "@/components/EmployeeFilterBar";
import { LayeredDeleteModal } from "@/components/LayeredDeleteModal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useDeleteDocument } from "@/modules/documents/hooks";
import { useMasterCategories } from "@/modules/users/hooks";
import {
  useDocumentArchiveRecap,
  useExportDocumentArchiveRecap,
} from "@/modules/document-types/hooks";
import {
  DocumentArchiveFilter,
  DocumentArchiveRow,
} from "@/modules/document-types/types";

const statusConfig = {
  PENDING: { label: "Menunggu", icon: Clock, className: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  APPROVED: { label: "Disetujui", icon: CheckCircle2, className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  REJECTED: { label: "Ditolak", icon: XCircle, className: "text-red-500 bg-red-500/10 border-red-500/20" },
  MISSING: { label: "Belum Upload", icon: UploadCloud, className: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
};

function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  return format(new Date(value), "dd MMM yyyy", { locale: idLocale });
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function AllUserArchivesView() {
  const [filterValues, setFilterValues] = useState<EmployeeFilterState>({
    search: "",
    archiveCategory: "ALL",
    employmentStatusId: "",
    employeeGroupId: "",
    professionGroupId: "",
    employeePositionId: "",
    workplaceId: "",
    tmtStartDate: "",
    tmtEndDate: "",
    retirementAgeMin: "",
    retirementAgeMax: "",
    maritalStatus: "",
    lastEducation: "",
  });
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | "">("");
  const [uploadStatus, setUploadStatus] = useState<"UPLOADED" | "MISSING" | "">("UPLOADED");
  const [rowToDelete, setRowToDelete] = useState<DocumentArchiveRow | null>(null);

  const filters = useMemo<DocumentArchiveFilter>(() => {
    const nextFilters: DocumentArchiveFilter = {};
    if (filterValues.archiveCategory && filterValues.archiveCategory !== "ALL") {
      nextFilters.archiveCategory = filterValues.archiveCategory;
    }
    if (filterValues.search.trim()) nextFilters.search = filterValues.search.trim();
    if (filterValues.employmentStatusId) nextFilters.employmentStatusId = filterValues.employmentStatusId;
    if (filterValues.employeeGroupId) nextFilters.employeeGroupId = filterValues.employeeGroupId;
    if (filterValues.professionGroupId) nextFilters.professionGroupId = filterValues.professionGroupId;
    if (filterValues.employeePositionId) nextFilters.employeePositionId = filterValues.employeePositionId;
    if (filterValues.workplaceId) nextFilters.workplaceId = filterValues.workplaceId;
    if (filterValues.tmtStartDate) nextFilters.tmtStartDate = filterValues.tmtStartDate;
    if (filterValues.tmtEndDate) nextFilters.tmtEndDate = filterValues.tmtEndDate;
    if (filterValues.retirementAgeMin !== "" && filterValues.retirementAgeMin !== undefined) {
      nextFilters.retirementAgeMin = filterValues.retirementAgeMin;
    }
    if (filterValues.retirementAgeMax !== "" && filterValues.retirementAgeMax !== undefined) {
      nextFilters.retirementAgeMax = filterValues.retirementAgeMax;
    }
    if (filterValues.maritalStatus) nextFilters.maritalStatus = filterValues.maritalStatus;
    if (filterValues.lastEducation) nextFilters.lastEducation = filterValues.lastEducation;
    if (documentStatus) nextFilters.status = documentStatus;
    if (uploadStatus) nextFilters.uploadStatus = uploadStatus;
    return nextFilters;
  }, [documentStatus, filterValues, uploadStatus]);

  const { data: recap, isLoading, refetch } = useDocumentArchiveRecap(filters);
  const { data: categories } = useMasterCategories();
  const exportMutation = useExportDocumentArchiveRecap();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  const rows = recap?.rows || [];
  const stats = recap?.stats || {
    totalRequired: 0,
    uploaded: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    missing: 0,
    percentage: 0,
    employeeCount: 0,
    documentTypeCount: 0,
  };

  const handleConfirmDelete = () => {
    if (!rowToDelete?.document) return;
    deleteDocument(rowToDelete.document.id, {
      onSuccess: () => {
        setRowToDelete(null);
        refetch();
      },
    });
  };

  const handleDownload = (id: string) => {
    window.open(`/api/v1/documents/${id}/download`, "_blank");
  };

  const handleExport = () => {
    exportMutation.mutate(filters, {
      onSuccess: ({ blob, fileName }) => {
        triggerBlobDownload(blob, fileName);
        toast.success("Rekap arsip dokumen berhasil diekspor");
      },
      onError: (error: any) => {
        toast.error(error.message || "Gagal mengekspor rekap arsip dokumen");
      },
    });
  };

  const columns: Column<DocumentArchiveRow>[] = [
    {
      header: "Pegawai",
      render: (item) => (
        <Link
          href={`/users/${item.employee.id}`}
          className="flex items-center gap-3 hover:bg-accent/50 p-1.5 -ml-1.5 rounded-xl transition-colors w-max group cursor-pointer"
        >
          <div className="relative w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 overflow-hidden group-hover:ring-2 group-hover:ring-primary/40 transition-all">
            {item.employee.avatarUrl ? (
              <Image src={item.employee.avatarUrl} alt={item.employee.name} fill className="object-cover" unoptimized />
            ) : (
              item.employee.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-bold text-foreground whitespace-nowrap group-hover:text-primary transition-colors">
              {item.employee.name}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono whitespace-nowrap mt-0.5">
              <User className="w-3 h-3 text-muted-foreground/70" />
              <span>NIP: {item.employee.employeeId || "-"}</span>
            </div>
          </div>
        </Link>
      ),
    },
    {
      header: "Jenis Dokumen",
      render: (item) => (
        <div>
          <div className="font-bold text-foreground flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono shrink-0">
              {item.documentType.code}
            </span>
            <span className="truncate max-w-[200px] sm:max-w-[280px]" title={item.documentType.name}>
              {item.documentType.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate" title={item.document?.fileName || ""}>
            {item.document?.fileName || "Dokumen belum diupload"}
          </p>
        </div>
      ),
    },
    {
      header: "Kategori Arsip",
      className: "whitespace-nowrap",
      render: (item) => {
        const cat = item.documentType.archiveCategory;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              cat === "UTAMA"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                : cat === "PROFESI"
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
      header: "Status",
      className: "whitespace-nowrap",
      render: (item) => {
        const config = item.status ? statusConfig[item.status] : statusConfig.MISSING;
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
      header: "Tanggal",
      className: "whitespace-nowrap",
      render: (item) => (
        <div className="text-xs space-y-0.5">
          <div className="text-foreground">
            <span className="text-muted-foreground">Upload: </span>
            {formatDate(item.document?.uploadedAt)}
          </div>
          <div className="text-muted-foreground">
            <span>Terbit: </span>
            <span className="font-medium text-foreground">{formatDate(item.document?.issueDate)}</span>
          </div>
          <div className="text-muted-foreground">
            <span>Kedaluwarsa: </span>
            <span className="font-medium text-foreground">{formatDate(item.document?.expiryDate)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Aksi",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.document ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(item.document?.id || "")}
                className="h-8 px-2.5 text-xs gap-1 rounded-xl border-border hover:bg-accent font-semibold"
                title="Unduh Berkas"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Unduh</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRowToDelete(item)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                title="Hapus Dokumen Arsip"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">Belum ada file</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <PageHeader
        icon={FolderArchive}
        title="Rekapitulasi Arsip Dokumen Pegawai"
        description="Pantau kewajiban dokumen pegawai, status upload, dan hasil verifikasi seluruh arsip wajib."
        action={
          <Link href="/document-types">
            <Button variant="outline" className="rounded-full px-5 border-border hover:bg-accent font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Master Dokumen
            </Button>
          </Link>
        }
      />

      <CompletenessCard
        uploaded={stats.uploaded}
        total={stats.totalRequired}
        percentage={stats.percentage}
        title="Rekapitulasi Dokumen Seluruh Pegawai"
        subtitle={`Sudah upload ${stats.uploaded}, terverifikasi ${stats.approved}, menunggu ${stats.pending}, ditolak ${stats.rejected}, belum upload ${stats.missing}`}
      />

      <EmployeeFilterBar
        values={filterValues}
        onChange={setFilterValues}
        categories={categories}
        showArchiveCategory={true}
      />

      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-muted-foreground">Status Verifikasi</label>
          <Select
            value={documentStatus}
            onChange={(event) => setDocumentStatus(event.target.value as DocumentStatus | "")}
            placeholder="Semua Status Verifikasi"
            className="h-9 text-xs font-semibold"
            options={[
              { value: "PENDING", label: "Menunggu" },
              { value: "APPROVED", label: "Disetujui" },
              { value: "REJECTED", label: "Ditolak" },
            ]}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-muted-foreground">Status Upload</label>
          <Select
            value={uploadStatus}
            onChange={(event) => setUploadStatus(event.target.value as "UPLOADED" | "MISSING" | "")}
            placeholder="Sudah Upload"
            className="h-9 text-xs font-semibold"
            options={[
              { value: "UPLOADED", label: "Sudah Upload" },
              { value: "MISSING", label: "Belum Upload" },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="rounded-full px-5 font-semibold gap-2"
        >
          <Download className="w-4 h-4" />
          {exportMutation.isPending ? "Mengekspor..." : "Export CSV"}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        loadingMessage="Memuat rekap arsip pegawai..."
        emptyMessage="Tidak ada data rekap ditemukan"
        emptyDescription="Belum ada dokumen yang sudah diupload dan cocok dengan pencarian atau filter ini."
        emptyIcon={FileText}
        keyExtractor={(item) => item.key}
      />

      <LayeredDeleteModal
        isOpen={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Berkas Arsip Permanen"
        itemName={rowToDelete?.document?.fileName || rowToDelete?.documentType.name || ""}
        itemType="berkas arsip dokumen"
        impactDetails={[
          `File '${rowToDelete?.document?.fileName}' milik pegawai '${rowToDelete?.employee.name || "Pegawai"}' akan dihapus permanen dari server.`,
          "Status verifikasi dan rekam jejak histori verifikasi dokumen ini akan dibersihkan.",
          "Tindakan ini tidak dapat dibatalkan atau dikembalikan dengan cara apapun.",
        ]}
        isLoading={isDeleting}
      />
    </div>
  );
}
