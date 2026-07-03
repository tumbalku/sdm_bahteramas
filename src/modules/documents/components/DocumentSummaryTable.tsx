"use client";

import { DocumentRecordDto } from "../types";
import type { ReactNode } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DocumentSummaryContext = "dashboard" | "employee-profile";

interface DocumentSummaryTableProps {
  documents: DocumentRecordDto[];
  context?: DocumentSummaryContext;
  title?: string;
  headerAction?: ReactNode;
  emptyText?: string;
  showOwner?: boolean;
  showViewAllLink?: boolean;
  isLoading?: boolean;
  onRowClick?: (document: DocumentRecordDto) => void;
}

const statusConfig = {
  PENDING: {
    label: "Menunggu",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  APPROVED: {
    label: "Disetujui",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Ditolak",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
};

function formatOptionalDate(value?: Date | string | null) {
  if (!value) return "-";
  return format(new Date(value), "dd MMM yy", { locale: localeId });
}

export function DocumentSummaryTable({
  documents,
  context = "dashboard",
  title = "Dokumen Terbaru",
  headerAction,
  emptyText = "Belum ada dokumen yang diunggah.",
  showOwner = context === "dashboard",
  showViewAllLink = context === "dashboard",
  isLoading = false,
  onRowClick,
}: DocumentSummaryTableProps) {
  const router = useRouter();

  const handleRowClick = (document: DocumentRecordDto) => {
    if (onRowClick) {
      onRowClick(document);
      return;
    }

    router.push(`/documents/${document.id}`);
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground shadow-xs h-full flex flex-col items-center justify-center">
        <FileText className="w-10 h-10 mb-3 opacity-20 animate-pulse" />
        <p className="text-sm">Memuat dokumen...</p>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden text-muted-foreground shadow-xs h-full flex flex-col">
        {(headerAction || title) && (
          <div className="px-4 py-2.5 border-b border-border bg-background flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              {headerAction}
              <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                <FileText className="w-4 h-4 text-primary" />
                {title}
              </h3>
            </div>
          </div>
        )}
        <div className="p-8 text-center flex flex-1 flex-col items-center justify-center">
          <FileText className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-border bg-background flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          {headerAction}
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {title}
          </h3>
        </div>
        {showViewAllLink && (
          <Link href="/documents" className="text-xs font-semibold text-primary hover:underline flex items-center">
            Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-3.5 py-2">Dokumen</th>
              {showOwner && <th className="px-3.5 py-2">Pemilik</th>}
              <th className="px-3.5 py-2">Diunggah</th>
              {context === "employee-profile" && (
                <>
                  <th className="px-3.5 py-2">Terbit</th>
                  <th className="px-3.5 py-2">Kedaluwarsa</th>
                </>
              )}
              <th className="px-3.5 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {documents.map((doc) => {
              const status = statusConfig[doc.status];

              return (
                <tr
                  key={doc.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(doc)}
                  title="Buka detail dokumen"
                >
                  <td className="px-3.5 py-2.5">
                    <div className="font-semibold text-foreground line-clamp-1 max-w-[220px]" title={doc.documentType?.name}>
                      {doc.documentType?.name || "Dokumen"}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">
                      {doc.documentType?.archiveCategory || "-"}
                    </div>
                  </td>
                  {showOwner && (
                    <td className="px-3.5 py-2.5">
                      <div className="font-medium text-foreground text-xs">{doc.owner?.name || "-"}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{doc.owner?.employeeId || "-"}</div>
                    </td>
                  )}
                  <td className="px-3.5 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap">
                    {format(new Date(doc.uploadedAt), "dd MMM yy, HH:mm", { locale: localeId })}
                  </td>
                  {context === "employee-profile" && (
                    <>
                      <td className="px-3.5 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap">
                        {formatOptionalDate(doc.issueDate)}
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap">
                        {formatOptionalDate(doc.expiryDate)}
                      </td>
                    </>
                  )}
                  <td className="px-3.5 py-2.5 text-right">
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
