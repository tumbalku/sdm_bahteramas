import { DocumentRecordDto } from "@/modules/documents/types";
import { format, differenceInDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertTriangle, Clock, CalendarDays } from "lucide-react";
import Link from "next/link";

interface ExpiringDocumentsListProps {
  documents: DocumentRecordDto[];
}

export function ExpiringDocumentsList({ documents }: ExpiringDocumentsListProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-card border border-border rounded-3xl shadow-sm h-full">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-green-500" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Tidak ada dokumen yang kedaluwarsa dalam 30 hari ke depan.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-border bg-background flex items-center justify-between shrink-0">
        <h3 className="font-bold text-sm flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          Segera Kedaluwarsa
        </h3>
        <span className="text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
          {documents.length} Dokumen
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {documents.map((doc) => {
          const daysLeft = doc.expiryDate ? differenceInDays(new Date(doc.expiryDate), new Date()) : 0;
          const isCritical = daysLeft <= 14;

          return (
            <div 
              key={doc.id} 
              className={`p-3 rounded-lg border flex flex-col gap-1.5 relative overflow-hidden transition-colors
                ${isCritical 
                  ? "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40" 
                  : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-xs line-clamp-1" title={doc.documentType?.name}>
                    {doc.documentType?.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{doc.owner?.name}</p>
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center whitespace-nowrap ml-2
                  ${isCritical ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"}
                `}>
                  <Clock className="w-3 h-3 mr-1" />
                  {daysLeft} hr
                </div>
              </div>
              
              <div className="flex items-center text-[11px] text-muted-foreground">
                <CalendarDays className="w-3 h-3 mr-1 shrink-0" />
                Masa Berlaku: {doc.expiryDate ? format(new Date(doc.expiryDate), "dd MMM yyyy", { locale: localeId }) : "-"}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-2.5 border-t border-border bg-muted/20 text-center shrink-0">
        <Link href="/documents" className="text-xs text-primary font-semibold hover:underline">
          Kelola Dokumen &rarr;
        </Link>
      </div>
    </div>
  );
}
