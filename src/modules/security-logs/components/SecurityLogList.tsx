"use client";

import { useState } from "react";
import { SecurityLogDto } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert,
  FileJson,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";

interface SecurityLogListProps {
  logs: SecurityLogDto[];
  isLoading: boolean;
}

export function SecurityLogList({ logs, isLoading }: SecurityLogListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (logId: string) => {
    setExpandedId((prev) => (prev === logId ? null : logId));
  };

  const columns: Column<SecurityLogDto>[] = [
    {
      header: "Waktu Kejadian",
      render: (log) => {
        const logDate = log.timestamp || log.createdAt || new Date();
        return (
          <div className="text-xs leading-tight">
            <div className="font-semibold text-foreground">
              {format(new Date(logDate), "dd MMM yyyy", { locale: id })}
            </div>
            <div className="text-muted-foreground text-[11px]">
              {format(new Date(logDate), "HH:mm:ss", { locale: id })}
            </div>
          </div>
        );
      },
    },
    {
      header: "Aktor",
      render: (log) => (
        <div className="text-xs leading-tight">
          <div className="font-semibold text-foreground truncate max-w-[140px]" title={log.actorName}>
            {log.actorName}
          </div>
          <div className="mt-0.5">
            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground">
              {log.actorRole}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Aktivitas",
      render: (log) => (
        <div className="text-xs leading-tight">
          <span className="font-mono text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium inline-block">
            {log.eventType}
          </span>
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[180px]" title={log.resource}>
            {log.resource}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (log) =>
        log.status === "SUCCESS" ? (
          <span className="inline-flex items-center text-green-600 bg-green-500/10 px-2 py-0.5 rounded text-[11px] font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Sukses
          </span>
        ) : (
          <span className="inline-flex items-center text-red-600 bg-red-500/10 px-2 py-0.5 rounded text-[11px] font-semibold">
            <XCircle className="w-3 h-3 mr-1" /> Gagal
          </span>
        ),
    },
    {
      header: <span className="sr-only">Aksi</span>,
      headerClassName: "text-right",
      className: "text-right w-12",
      render: (log) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(log.id);
          }}
          className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          {expandedId === log.id ? (
            <ChevronUp className="w-4 h-4 text-primary" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      isLoading={isLoading}
      loadingMessage="Memuat rekam aktivitas audit..."
      emptyMessage="Tidak ada rekam aktivitas"
      emptyDescription="Tidak ditemukan log keamanan sesuai kriteria pencarian."
      emptyIcon={ShieldAlert}
      keyExtractor={(log) => log.id}
      defaultPageSize={10}
      pageSizeOptions={[10, 25, 50]}
      onRowClick={(log) => toggleExpand(log.id)}
      renderSubRow={(log) => {
        if (expandedId !== log.id) return null;
        return (
          <tr className="bg-muted/15 border-b border-border/50 animate-fade-in">
            <td colSpan={5} className="px-4 py-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-card border border-border/70 rounded-xl p-2.5">
                  <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-1.5 flex items-center">
                    <FileJson className="w-3.5 h-3.5 mr-1 text-primary" /> Metadata Aktivitas
                  </div>
                  <div className="bg-muted/30 p-2 rounded-lg font-mono text-[11px] overflow-auto max-h-[120px] text-foreground">
                    {log.metadata ? (
                      <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.metadata, null, 2)}</pre>
                    ) : (
                      <span className="text-muted-foreground italic">Tidak ada metadata tambahan</span>
                    )}
                  </div>
                </div>

                <div className="bg-card border border-border/70 rounded-xl p-2.5 flex flex-col justify-between">
                  <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-1.5">
                    Informasi Sistem & Jaringan
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                      <span className="text-muted-foreground">Log ID:</span>
                      <span className="font-mono text-[11px] font-medium">{log.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                      <span className="text-muted-foreground">Alamat IP:</span>
                      <span className="font-mono font-medium text-primary">{log.ipAddress || "Internal / Localhost"}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-muted-foreground">User / Actor ID:</span>
                      <span className="font-mono text-[11px] font-medium">{log.actorId || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        );
      }}
    />
  );
}
