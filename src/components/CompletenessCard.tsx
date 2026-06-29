"use client";

import { CheckCircle2 } from "lucide-react";

interface CompletenessCardProps {
  uploaded: number;
  total: number;
  percentage: number;
  title?: string;
  subtitle?: string;
}

export function CompletenessCard({
  uploaded,
  total,
  percentage,
  title = "Kelengkapan Dokumen Kepegawaian",
  subtitle = "Total persyaratan berkas yang telah diverifikasi & disetujui",
}: CompletenessCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base flex flex-wrap items-center gap-1.5">
              <span>{title}</span>
              <span className="text-xs font-normal text-muted-foreground">
                ({uploaded} dari {total} berkas)
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-primary">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
