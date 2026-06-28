"use client";

import { DocumentTypeRecord } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle2, XCircle, FileCheck } from "lucide-react";

interface DocumentTypeTableProps {
  data: DocumentTypeRecord[];
  isLoading: boolean;
  onEdit: (item: DocumentTypeRecord) => void;
  onDelete: (item: DocumentTypeRecord) => void;
}

export function DocumentTypeTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: DocumentTypeTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Memuat data jenis dokumen...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
        <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="font-semibold text-lg">Tidak ada jenis dokumen</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Belum ada jenis dokumen yang sesuai dengan filter ini.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-accent/50 text-muted-foreground font-semibold border-b border-border">
          <tr>
            <th className="px-6 py-4">Kode / Nama</th>
            <th className="px-6 py-4">Kategori Arsip</th>
            <th className="px-6 py-4">Status Wajib</th>
            <th className="px-6 py-4">Format & Ukuran</th>
            <th className="px-6 py-4">Target Profesi</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item) => {
            const isUtama = item.archiveCategory === "UTAMA";
            const isProfesi = item.archiveCategory === "PROFESI";

            return (
              <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">
                      {item.code}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isUtama
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : isProfesi
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {item.archiveCategory}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.isMandatory ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Wajib
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <XCircle className="w-4 h-4 opacity-50" />
                      Opsional
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-0.5">
                    <div className="font-mono text-foreground">
                      {item.allowedFormats.toUpperCase()}
                    </div>
                    <div className="text-muted-foreground">
                      Maks: {item.maxSizeMb} MB
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {item.targetProfessions && item.targetProfessions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.targetProfessions.map((tp) => (
                        <span
                          key={tp.id}
                          className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[11px] font-medium"
                        >
                          {tp.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Semua Profesi
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
