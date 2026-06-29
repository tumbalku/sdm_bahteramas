"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, Users as UsersIcon, Layers } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmployeeFilterBar, EmployeeFilterState } from "@/components/EmployeeFilterBar";
import { useDeleteUser, useUsers } from "../hooks";
import { UserRecord } from "../types";
import { UserTable } from "./UserTable";

export function UsersView() {
  const [filterValues, setFilterValues] = useState<EmployeeFilterState>({
    search: "",
    employmentStatusId: "",
    employeeGroupId: "",
    professionGroupId: "",
    employeePositionId: "",
  });

  const { data: users = [], isLoading, error } = useUsers(filterValues);

  const deleteMutation = useDeleteUser();

  const handleDelete = (item: UserRecord) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus akun pegawai '${item.name}' (${item.employeeId})?`
      )
    ) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header View */}
      <PageHeader
        icon={UsersIcon}
        title="Manajemen Pegawai"
        description="Kelola akun pengguna, data biodata, dan hak akses seluruh pegawai."
        action={
          <div className="flex items-center gap-3">
            <Link href="/users/categories">
              <Button variant="outline" className="rounded-full px-5 border-border">
                <Layers className="w-4 h-4 mr-2 text-primary" />
                Master Kategori
              </Button>
            </Link>
            <Link href="/users/new">
              <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 px-6 shrink-0">
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah Pegawai Baru
              </Button>
            </Link>
          </div>
        }
      />

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {(error as Error).message}
        </div>
      )}

      {/* Shared Reusable Employee Filter Bar */}
      <EmployeeFilterBar values={filterValues} onChange={setFilterValues} />

      {/* Table Data */}
      <UserTable
        data={users}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
