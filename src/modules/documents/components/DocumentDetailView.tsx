"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDocument } from "../hooks";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileQuestion,
  FileText,
  Hash,
  IdCard,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface DocumentDetailViewProps {
  documentId: string;
}

const statusConfig = {
  PENDING: { label: "Menunggu Verifikasi", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  APPROVED: { label: "Disetujui", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  REJECTED: { label: "Ditolak", className: "bg-rose-500/10 text-rose-700 border-rose-500/20" },
};

function formatDate(value?: Date | string | null, withTime = false) {
  if (!value) return "-";
  return format(new Date(value), withTime ? "dd MMMM yyyy, HH:mm" : "dd MMMM yyyy", { locale: localeId });
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function isImageExtension(ext: string) {
  return ["jpg", "jpeg", "png", "webp"].includes(ext);
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-accent/20 border border-border/40">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground text-right break-words">{value}</span>
    </div>
  );
}

export function DocumentDetailView({ documentId }: DocumentDetailViewProps) {
  const { data: document, isLoading, error } = useDocument(documentId);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showLoading = !isMounted || isLoading;

  if (showLoading) {
    return (
      <div className="page-container space-y-5 animate-fade-in pb-8">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Skeleton className="lg:col-span-8 h-[520px] rounded-2xl" />
          <Skeleton className="lg:col-span-4 h-[520px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
        <FileQuestion className="w-16 h-16 text-muted-foreground/40" />
        <p className="text-base font-semibold">Dokumen tidak ditemukan atau tidak dapat diakses</p>
        <Link href="/documents">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dokumen
          </Button>
        </Link>
      </div>
    );
  }

  const downloadUrl = `/api/v1/documents/${document.id}/download`;
  const extension = getFileExtension(document.fileName || document.filePath);
  const canPreviewImage = isImageExtension(extension);
  const canPreviewPdf = extension === "pdf";
  const latestVerification = document.verificationHistories?.[0];
  const status = statusConfig[document.status];

  return (
    <div className="page-container space-y-5 animate-fade-in pb-8">
      <PageHeader
        icon={FileText}
        title="Detail Dokumen"
        description="Pratinjau berkas dokumen dan informasi properti arsip pegawai."
        action={
          <Link href="/documents">
            <Button variant="outline" className="rounded-full px-5 border-border hover:bg-accent font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-background flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground truncate">{document.fileName}</h2>
              <p className="text-xs text-muted-foreground">{document.documentType?.name || "Dokumen"}</p>
            </div>
            <a href={downloadUrl} target="_blank" rel="noreferrer">
              <Button size="sm" className="rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Unduh
              </Button>
            </a>
          </div>

          <div className="bg-muted/20 min-h-[520px] flex items-center justify-center">
            {canPreviewPdf ? (
              <iframe
                src={downloadUrl}
                title={`Preview ${document.fileName}`}
                className="w-full h-[70vh] min-h-[520px] bg-background"
              />
            ) : canPreviewImage ? (
              <img
                src={downloadUrl}
                alt={`Preview ${document.fileName}`}
                className="max-h-[70vh] max-w-full object-contain"
              />
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <FileQuestion className="w-14 h-14 mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-foreground">Preview tidak tersedia untuk format ini</p>
                <p className="text-sm mt-1">Gunakan tombol unduh untuk membuka file di aplikasi yang sesuai.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Properti Dokumen
              </h3>
              <span className={`px-2.5 py-1 rounded-full border text-[10px] uppercase font-bold ${status.className}`}>
                {status.label}
              </span>
            </div>

            <DetailItem icon={UserCircle2} label="Pemilik" value={document.owner?.name || "-"} />
            <DetailItem icon={IdCard} label="NIP" value={<span className="font-mono">{document.owner?.employeeId || "-"}</span>} />
            <DetailItem icon={FileText} label="Jenis" value={document.documentType?.name || "-"} />
            <DetailItem icon={Hash} label="Kode" value={document.documentType?.code || "-"} />
            <DetailItem icon={FileText} label="Kategori" value={document.documentType?.archiveCategory || "-"} />
            <DetailItem icon={Hash} label="Nomor Surat" value={document.documentNumber || "-"} />
            <DetailItem icon={Calendar} label="Tanggal Terbit" value={formatDate(document.issueDate)} />
            <DetailItem icon={Calendar} label="Kedaluwarsa" value={formatDate(document.expiryDate)} />
            <DetailItem icon={Calendar} label="Diunggah" value={formatDate(document.uploadedAt, true)} />
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-border/60 pb-3">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Verifikasi Terakhir
            </h3>
            {latestVerification ? (
              <div className="space-y-3">
                <DetailItem icon={ShieldCheck} label="Status" value={statusConfig[latestVerification.status].label} />
                <DetailItem icon={UserCircle2} label="Reviewer" value={latestVerification.reviewedBy?.name || "-"} />
                <DetailItem icon={Calendar} label="Tanggal" value={formatDate(latestVerification.reviewedAt, true)} />
                <div className="p-3 rounded-xl bg-accent/20 border border-border/40">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Catatan</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {latestVerification.reviewNote || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada riwayat verifikasi untuk dokumen ini.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
