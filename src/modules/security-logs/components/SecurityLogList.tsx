"use client";

import { SecurityLogDto } from "../types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileJson,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";

interface SecurityLogListProps {
  logs: SecurityLogDto[];
  isLoading: boolean;
}

export function SecurityLogList({ logs, isLoading }: SecurityLogListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-2xl animate-pulse">
        <p>Memuat rekam aktivitas...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Tidak ada data</h3>
        <p className="text-muted-foreground max-w-sm">
          Tidak ditemukan rekam aktivitas sesuai kriteria pencarian Anda.
        </p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Waktu Kejadian</th>
              <th className="px-6 py-4 font-semibold">Aktor</th>
              <th className="px-6 py-4 font-semibold">Aktivitas</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => {
              const isExpanded = expandedId === log.id;
              
              return (
                <React.Fragment key={log.id}>
                  <tr 
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {format(new Date(log.createdAt), "dd MMM yyyy", { locale: id })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), "HH:mm:ss", { locale: id })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground truncate max-w-[150px]" title={log.actorName}>
                        {log.actorName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        <span className="bg-muted px-1.5 py-0.5 rounded mr-1.5">{log.actorRole}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                        {log.eventType}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]" title={log.resource}>
                        {log.resource}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "SUCCESS" ? (
                        <div className="flex items-center text-green-600 bg-green-500/10 px-2 py-1 rounded w-fit text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Sukses
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 bg-red-500/10 px-2 py-1 rounded w-fit text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Gagal
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-muted/10">
                      <td colSpan={5} className="px-6 py-4 border-t border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center">
                              <FileJson className="w-3.5 h-3.5 mr-1.5" /> Data Tambahan (Metadata)
                            </h4>
                            <div className="bg-card border border-border rounded-xl p-3 text-xs font-mono overflow-auto max-h-[150px]">
                              {log.metadata ? (
                                <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                              ) : (
                                <span className="text-muted-foreground italic">Tidak ada metadata</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                              Info Sistem
                            </h4>
                            <ul className="space-y-1 text-sm text-foreground bg-card border border-border p-3 rounded-xl">
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">ID Log:</span>
                                <span className="font-mono text-xs">{log.id}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">Alamat IP:</span>
                                <span className="font-mono">{log.ipAddress || "Tidak diketahui"}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-muted-foreground">ID Aktor:</span>
                                <span className="font-mono text-xs">{log.actorId}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
