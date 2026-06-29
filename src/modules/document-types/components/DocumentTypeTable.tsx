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
      header: "Kode / Nama",
      render: (item) => (
        <div>
          <div className="font-bold text-foreground flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono shrink-0">
              {item.code}
            </span>
            <span className="truncate max-w-[200px] sm:max-w-[280px]" title={item.name}>
              {item.name}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
              {item.description}
            </p>
          )}
        </div>
      ),
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
      render: (item) =>
        item.isMandatory ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Wajib
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <XCircle className="w-4 h-4 opacity-50" />
            Opsional
          </span>
        ),
    },
    {
      header: "Format & Ukuran",
      className: "whitespace-nowrap",
      render: (item) => {
        const formattedSize = item.maxSizeMb < 1
          ? `${Math.round(item.maxSizeMb * 1024)} KB`
          : `${item.maxSizeMb} MB`;
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
      header: "Target Profesi",
      render: (item) =>
        item.targetProfessions && item.targetProfessions.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {item.targetProfessions.map((tp) => (
              <span
                key={tp.id}
                className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[11px] font-medium whitespace-nowrap"
              >
                {tp.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic whitespace-nowrap">
            Semua Profesi
          </span>
        ),
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
