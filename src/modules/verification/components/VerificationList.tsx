"use client";

import { DocumentRecordDto } from "@/modules/documents/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileSearch, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationListProps {
  documents: DocumentRecordDto[];
  isLoading: boolean;
  onReview: (doc: DocumentRecordDto) => void;
}

export function VerificationList({ documents, isLoading, onReview }: VerificationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
        <Clock className="w-12 h-12 mb-4 opacity-50" />
        <p>Memuat daftar dokumen...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Semua Selesai!</h3>
        <p className="text-muted-foreground max-w-sm">
          Tidak ada dokumen yang perlu diverifikasi saat ini. Anda telah menyelesaikan semua tugas Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="group relative bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
          onClick={() => onReview(doc)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit mb-2">
                {doc.documentType?.archiveCategory}
              </span>
              <h4 className="font-bold text-base line-clamp-1" title={doc.documentType?.name}>
                {doc.documentType?.name}
              </h4>
            </div>
          </div>

          <div className="space-y-2 mt-auto text-sm bg-muted/30 p-3 rounded-xl border border-border/50">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Pemilik</span>
              <span className="font-medium truncate max-w-[140px]" title={doc.owner?.name}>
                {doc.owner?.name}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">NIP</span>
              <span className="font-medium font-mono text-xs">
                {doc.owner?.employeeId}
              </span>
            </div>
            
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Diunggah</span>
              <span className="font-medium">
                {format(new Date(doc.uploadedAt), "dd MMM yy", { locale: id })}
              </span>
            </div>
          </div>

          <Button
            variant="default"
            className="w-full mt-4 rounded-xl flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onReview(doc);
            }}
          >
            <FileSearch className="w-4 h-4 mr-2" />
            Tinjau Dokumen
          </Button>
        </div>
      ))}
    </div>
  );
}
