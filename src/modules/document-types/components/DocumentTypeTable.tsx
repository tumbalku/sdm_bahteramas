"use client";

import Link from "next/link";

import { DocumentTypeRecord } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle2, XCircle, FileCheck } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";

interface DocumentTypeTableProps {
  data: DocumentTypeRecord[];
  isLoading: boolean;
  onDelete: (item: DocumentTypeRecord) => void;
}

export function DocumentTypeTable({
  data,
  isLoading,
  onDelete,
}: DocumentTypeTableProps) {
  const columns: Column<DocumentTypeRecord>[] = [
    {
      header: "Kode",
      className: "whitespace-nowrap",
      render: (item) => {
        const displayCode = item.code.length > 15 ? `${item.code.slice(0, 15)}...` : item.code;
        return (
          <span
            className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono font-bold align-middle"
            title={item.code}
          >
            {displayCode}
          </span>
        );
      },
    },
    {
      header: "Nama Dokumen",
      render: (item) => {
        const displayName = item.name.length > 30 ? `${item.name.slice(0, 30)}...` : item.name;
        return (
          <div
            className="font-semibold text-foreground text-sm whitespace-nowrap"
            title={item.name}
          >
            {displayName}
          </div>
        );
      },
    },
    {
      header: "Kategori Arsip",
      className: "whitespace-nowrap",
      render: (item) => {
        const isUtama = item.archiveCategory === "UTAMA";
        const isProfesi = item.archiveCategory === "PROFESI";
        return (
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
        );
      },
    },
    {
      header: "Status Wajib",
      className: "whitespace-nowrap",
      render: (item) => (
        <div className="space-y-1">
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
          <div className="flex flex-wrap gap-1 max-w-[160px]">
            {item.requiresExpiryDate && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                Kedaluwarsa
              </span>
            )}
            {item.requiresIssueDate && (
              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                Terbit
              </span>
            )}
            {item.requiresDocumentNumber && (
              <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 text-[10px] font-semibold">
                No. Surat
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Format & Ukuran",
      className: "whitespace-nowrap",
      render: (item) => {
        let formattedSize = `${item.maxSizeMb} MB`;
        if (item.maxSizeMb < 1) {
          formattedSize = `${Math.round(item.maxSizeMb * 1024)} KB`;
        } else if (item.maxSizeMb > 50) {
          formattedSize = `${Math.round(item.maxSizeMb)} KB`;
        }

        return (
          <div className="text-xs space-y-0.5">
            <div className="font-mono text-foreground font-semibold">
              {item.allowedFormats.toUpperCase()}
            </div>
            <div className="text-muted-foreground font-medium">Maks: {formattedSize}</div>
          </div>
        );
      },
    },
    {
      header: "Target Pegawai",
      render: (item) => {
        const allTargets = [
          ...(item.targetStatuses || []).map((t) => ({ ...t, label: "Status" })),
          ...(item.targetGroups || []).map((t) => ({ ...t, label: "Jenis" })),
          ...(item.targetProfessions || []).map((t) => ({ ...t, label: "Profesi" })),
          ...(item.targetRanks || []).map((t) => ({ ...t, label: "Golongan" })),
          ...(item.targetWorkplaces || []).map((t) => ({ ...t, label: "Unit" })),
        ];

        return allTargets.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {allTargets.slice(0, 3).map((t, i) => (
              <span
                key={`${t.id}-${i}`}
                className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[11px] font-medium whitespace-nowrap"
                title={`${t.label}: ${t.name}`}
              >
                {t.name}
              </span>
            ))}
            {allTargets.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                +{allTargets.length - 3} lainnya
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic whitespace-nowrap">
            Semua Pegawai
          </span>
        );
      },
    },
    {
      header: "Aksi",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/documents-types/${item.id}/edit`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      loadingMessage="Memuat data jenis dokumen..."
      emptyMessage="Tidak ada jenis dokumen"
      emptyDescription="Belum ada jenis dokumen yang sesuai dengan filter ini."
      emptyIcon={FileCheck}
      keyExtractor={(item) => item.id}
    />
  );
}
