"use client";

import { UserRecord } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User, Shield, Building2, Stethoscope } from "lucide-react";

interface UserTableProps {
  data: UserRecord[];
  isLoading: boolean;
  onEdit: (item: UserRecord) => void;
  onDelete: (item: UserRecord) => void;
}

export function UserTable({ data, isLoading, onEdit, onDelete }: UserTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Memuat data pegawai...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="font-semibold text-lg">Tidak ada pegawai ditemukan</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Coba sesuaikan kata kunci pencarian atau filter Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-accent/50 text-muted-foreground font-semibold border-b border-border">
          <tr>
            <th className="px-6 py-4">Pegawai</th>
            <th className="px-6 py-4">Role Sistem</th>
            <th className="px-6 py-4">Kelompok Profesi</th>
            <th className="px-6 py-4">Unit Kerja</th>
            <th className="px-6 py-4">Status Kepegawaian</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item) => {
            const isAdmin = item.role === "ADMIN";
            const isStaff = item.role === "STAFF";

            return (
              <tr key={item.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 font-mono">
                        <span>NIP: {item.employeeId}</span>
                        <span>•</span>
                        <span>{item.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isAdmin
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        : isStaff
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {item.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.professionGroup ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Stethoscope className="w-3.5 h-3.5 text-primary" />
                      {item.professionGroup.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {item.workplace ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      {item.workplace.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {item.employmentStatus ? (
                    <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs font-medium">
                      {item.employmentStatus.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">-</span>
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
