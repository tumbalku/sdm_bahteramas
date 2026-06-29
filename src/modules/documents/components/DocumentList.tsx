"use client";

import { DocumentRecordDto } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Download, Trash2, FileText, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentListProps {
  documents: DocumentRecordDto[];
  isLoading: boolean;
  onDelete: (doc: DocumentRecordDto) => void;
  currentUserRole: string;
  currentUserId: string;
}

const statusConfig = {
  PENDING: { label: "Menunggu", icon: Clock, className: "text-amber-500 bg-amber-500/10" },
  APPROVED: { label: "Disetujui", icon: CheckCircle2, className: "text-green-500 bg-green-500/10" },
  REJECTED: { label: "Ditolak", icon: XCircle, className: "text-red-500 bg-red-500/10" },
};

export function DocumentList({
  documents,
  isLoading,
  onDelete,
  currentUserRole,
  currentUserId,
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>Memuat dokumen...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Belum ada dokumen</h3>
        <p className="text-muted-foreground max-w-sm">
          Anda belum mengunggah dokumen apapun pada kategori ini. Silakan klik tombol unggah untuk menambahkan.
        </p>
      </div>
    );
  }

  const canDelete = (doc: DocumentRecordDto) => {
    if (currentUserRole === "ADMIN") return true;
    if (currentUserRole === "EMPLOYEE" || currentUserRole === "STAFF") {
      return doc.ownerId === currentUserId && doc.status !== "APPROVED";
    }
    return false;
  };

  const handleDownload = (filePath: string) => {
    window.open(`/api/v1/documents/download?file=${encodeURIComponent(filePath)}`, "_blank");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => {
        const StatusIcon = statusConfig[doc.status].icon;
        const lastRejection = doc.verificationHistories?.find((vh) => vh.status === "REJECTED");
        
        return (
          <div
            key={doc.id}
            className="group relative bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[doc.status].className}`}>
              <StatusIcon className="w-3.5 h-3.5 mr-1" />
              {statusConfig[doc.status].label}
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 pr-24">
                <h4 className="font-bold text-base line-clamp-2" title={doc.documentType?.name}>
                  {doc.documentType?.name || "Dokumen"}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 truncate" title={doc.fileName}>
                  {doc.fileName}
                </p>
              </div>
            </div>

            {doc.status === "REJECTED" && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Alasan Penolakan:</span>
                </div>
                <p className="text-foreground/90 italic pl-5 leading-relaxed">
                  "{lastRejection?.reviewNote || "Dokumen belum memenuhi kualifikasi persyaratan."}"
                </p>
                {lastRejection?.reviewedBy?.name && (
                  <p className="text-[10px] text-muted-foreground text-right pt-0.5 font-medium">
                    Oleh: {lastRejection.reviewedBy.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 mt-auto text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Diunggah pada</span>
                <span className="font-medium">
                  {format(new Date(doc.uploadedAt), "dd MMM yyyy", { locale: id })}
                </span>
              </div>
              
              {doc.issueDate && (
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Tanggal Terbit</span>
                  <span className="font-medium">
                    {format(new Date(doc.issueDate), "dd MMM yyyy", { locale: id })}
                  </span>
                </div>
              )}
              
              {doc.expiryDate && (
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">Masa Berlaku</span>
                  <span className="font-medium text-amber-600">
                    {format(new Date(doc.expiryDate), "dd MMM yyyy", { locale: id })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="default"
                className="flex-1 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleDownload(doc.filePath)}
              >
                <Download className="w-4 h-4 mr-2" />
                Unduh
              </Button>
              
              {canDelete(doc) && (
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  onClick={() => onDelete(doc)}
                  title="Hapus Dokumen"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
