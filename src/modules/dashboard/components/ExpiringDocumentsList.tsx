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
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-border bg-background flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Segera Kedaluwarsa
        </h3>
        <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
          {documents.length} Dokumen
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {documents.map((doc) => {
          const daysLeft = doc.expiryDate ? differenceInDays(new Date(doc.expiryDate), new Date()) : 0;
          const isCritical = daysLeft <= 14;

          return (
            <div 
              key={doc.id} 
              className={`p-4 rounded-xl border flex flex-col gap-2 relative overflow-hidden transition-colors
                ${isCritical 
                  ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40" 
                  : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-sm line-clamp-1" title={doc.documentType?.name}>
                    {doc.documentType?.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.owner?.name}</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-md flex items-center whitespace-nowrap ml-2
                  ${isCritical ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}
                `}>
                  <Clock className="w-3 h-3 mr-1" />
                  {daysLeft} hari lagi
                </div>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <CalendarDays className="w-3.5 h-3.5 mr-1" />
                Masa Berlaku: {doc.expiryDate ? format(new Date(doc.expiryDate), "dd MMM yyyy", { locale: localeId }) : "-"}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-border bg-muted/20 text-center">
        <Link href="/documents" className="text-xs text-primary font-medium hover:underline">
          Kelola Dokumen &rarr;
        </Link>
      </div>
    </div>
  );
}
