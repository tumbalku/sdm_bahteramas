"use client";

import Image from "next/image";
import Link from "next/link";
import { UserRecord } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User, Shield, Building2, Stethoscope } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";

interface UserTableProps {
  data: UserRecord[];
  isLoading: boolean;
  onDelete: (item: UserRecord) => void;
}

export function UserTable({ data, isLoading, onDelete }: UserTableProps) {
  const columns: Column<UserRecord>[] = [
    {
      header: "Pegawai",
      render: (item) => (
        <Link href={`/users/${item.id}`} className="flex items-center gap-3 hover:bg-accent/50 p-2 -ml-2 rounded-xl transition-colors w-max group cursor-pointer">
          <div className="relative w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 overflow-hidden group-hover:ring-2 group-hover:ring-primary/40 transition-all">
            {item.avatarUrl ? (
              <Image src={item.avatarUrl} alt={item.name} fill className="object-cover" unoptimized />
            ) : (
              item.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div
              className="font-bold text-foreground group-hover:text-primary transition-colors text-sm whitespace-nowrap"
              title={item.name}
            >
              {item.name.length > 30 ? `${item.name.slice(0, 30)}...` : item.name}
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-0.5 whitespace-nowrap">
              NIP: {item.employeeId}
            </div>
          </div>
        </Link>
      ),
    },
    {
      header: "Role Sistem",
      className: "whitespace-nowrap",
      render: (item) => {
        const isAdmin = item.role === "ADMIN";
        const isStaff = item.role === "STAFF";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isAdmin
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                : isStaff
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}
          >
            <Shield className="w-3 h-3" />
            {item.role}
          </span>
        );
      },
    },
    {
      header: "Kelompok Profesi",
      className: "whitespace-nowrap",
      render: (item) =>
        item.professionGroup ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Stethoscope className="w-3.5 h-3.5 text-primary" />
            {item.professionGroup.name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">-</span>
        ),
    },
    {
      header: "Unit Kerja",
      className: "whitespace-nowrap",
      render: (item) =>
        item.workplace ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            {item.workplace.name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">-</span>
        ),
    },
    {
      header: "Status",
      className: "whitespace-nowrap",
      render: (item) =>
        item.employmentStatus ? (
          <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs font-medium">
            {item.employmentStatus.name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">-</span>
        ),
    },
    {
      header: "Aksi",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/users/${item.id}/edit`}>
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
      loadingMessage="Memuat data pegawai..."
      emptyMessage="Tidak ada pegawai ditemukan"
      emptyDescription="Coba sesuaikan kata kunci pencarian atau filter Anda."
      emptyIcon={User}
      keyExtractor={(item) => item.id}
    />
  );
}
