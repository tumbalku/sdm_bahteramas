import { DocumentRecordDto } from "@/modules/documents/types";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentDocumentsTableProps {
  documents: DocumentRecordDto[];
}

export function RecentDocumentsTable({ documents }: RecentDocumentsTableProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground shadow-sm h-full flex flex-col items-center justify-center">
        <FileText className="w-10 h-10 mb-3 opacity-20" />
        <p className="text-sm">Belum ada dokumen yang diunggah.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-border bg-background flex justify-between items-center shrink-0">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Dokumen Terbaru
        </h3>
        <Link href="/documents" className="text-xs font-semibold text-primary hover:underline flex items-center">
          Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
        </Link>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-3.5 py-2">Dokumen</th>
              <th className="px-3.5 py-2">Pemilik</th>
              <th className="px-3.5 py-2">Diunggah</th>
              <th className="px-3.5 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {documents.map((doc) => {
              let statusStyle = "";
              let statusLabel = "";
              
              if (doc.status === "PENDING") {
                statusStyle = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
                statusLabel = "Menunggu";
              } else if (doc.status === "APPROVED") {
                statusStyle = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
                statusLabel = "Disetujui";
              } else {
                statusStyle = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
                statusLabel = "Ditolak";
              }

              return (
                <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3.5 py-2.5">
                    <div className="font-semibold text-foreground line-clamp-1 max-w-[180px]" title={doc.documentType?.name}>
                      {doc.documentType?.name}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">
                      {doc.documentType?.archiveCategory}
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="font-medium text-foreground text-xs">{doc.owner?.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{doc.owner?.employeeId}</div>
                  </td>
                  <td className="px-3.5 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap">
                    {format(new Date(doc.uploadedAt), "dd MMM yy, HH:mm", { locale: localeId })}
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${statusStyle}`}>
                      {statusLabel}
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
