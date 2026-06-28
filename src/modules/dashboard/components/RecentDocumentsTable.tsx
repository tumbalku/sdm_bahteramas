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
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-border bg-background flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Dokumen Terbaru
        </h3>
        <Link href="/documents" className="text-xs font-medium text-primary hover:underline flex items-center">
          Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 font-medium">Dokumen</th>
              <th className="px-5 py-3 font-medium">Pemilik</th>
              <th className="px-5 py-3 font-medium">Diunggah</th>
              <th className="px-5 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((doc) => {
              let statusStyle = "";
              let statusLabel = "";
              
              if (doc.status === "PENDING") {
                statusStyle = "bg-amber-100 text-amber-700 border-amber-200";
                statusLabel = "Menunggu";
              } else if (doc.status === "APPROVED") {
                statusStyle = "bg-green-100 text-green-700 border-green-200";
                statusLabel = "Disetujui";
              } else {
                statusStyle = "bg-red-100 text-red-700 border-red-200";
                statusLabel = "Ditolak";
              }

              return (
                <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-foreground line-clamp-1 max-w-[200px]" title={doc.documentType?.name}>
                      {doc.documentType?.name}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground mt-0.5">
                      {doc.documentType?.archiveCategory}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium">{doc.owner?.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{doc.owner?.employeeId}</div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {format(new Date(doc.uploadedAt), "dd MMM yy, HH:mm", { locale: localeId })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${statusStyle}`}>
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
