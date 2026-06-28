"use client";

import { useDocumentVerificationHistory } from "../hooks";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationHistoryTimelineProps {
  documentId: string;
}

export function VerificationHistoryTimeline({ documentId }: VerificationHistoryTimelineProps) {
  const { data: history, isLoading, error } = useDocumentVerificationHistory(documentId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500 bg-red-500/10 rounded-xl">
        Gagal memuat riwayat verifikasi.
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
        Belum ada riwayat verifikasi untuk dokumen ini.
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {history.map((item, index) => {
        const isApproved = item.status === "APPROVED";
        const Icon = isApproved ? CheckCircle : XCircle;
        
        return (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
              <Icon className={`w-5 h-5 ${isApproved ? "text-green-500" : "text-red-500"}`} />
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isApproved ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                  {isApproved ? "DISETUJUI" : "DITOLAK"}
                </span>
                <time className="text-xs text-muted-foreground flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {format(new Date(item.reviewedAt), "dd MMM yyyy, HH:mm", { locale: id })}
                </time>
              </div>
              
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Oleh: </span>
                <span className="font-semibold">{item.reviewer?.name || "Sistem"}</span>
              </div>
              
              {item.reviewNote && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm border border-border/50">
                  <span className="block text-xs font-semibold text-muted-foreground mb-1">Catatan:</span>
                  {item.reviewNote}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
