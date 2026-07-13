"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, Users as UsersIcon, Layers } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmployeeFilterBar, EmployeeFilterState } from "@/components/EmployeeFilterBar";
import { useDeleteUser, useMasterCategories, useUsers } from "../hooks";
import { UserFilter, UserRecord } from "../types";
import { UserTable } from "./UserTable";
import { LayeredDeleteModal } from "@/components/LayeredDeleteModal";
import { UsersBulkActions } from "./UsersBulkActions";

function toUserFilter(values: EmployeeFilterState): UserFilter {
  return {
    search: values.search.trim() || undefined,
    employmentStatusId: values.employmentStatusId || undefined,
    employeeGroupId: values.employeeGroupId || undefined,
    employeeRankId: values.employeeRankId || undefined,
    professionGroupId: values.professionGroupId || undefined,
    employeePositionId: values.employeePositionId || undefined,
    workplaceId: values.workplaceId || undefined,
    tmtStartDate: values.tmtStartDate || undefined,
    tmtEndDate: values.tmtEndDate || undefined,
    retirementAgeMin: values.retirementAgeMin === "" ? undefined : values.retirementAgeMin,
    retirementAgeMax: values.retirementAgeMax === "" ? undefined : values.retirementAgeMax,
    maritalStatus: values.maritalStatus || undefined,
    lastEducation: values.lastEducation || undefined,
  };
}

export function UsersView() {
  const [filterValues, setFilterValues] = useState<EmployeeFilterState>({
    search: "",
    employmentStatusId: "",
    employeeGroupId: "",
    employeeRankId: "",
    professionGroupId: "",
    employeePositionId: "",
    workplaceId: "",
    tmtStartDate: "",
    tmtEndDate: "",
    retirementAgeMin: "",
    retirementAgeMax: "",
    maritalStatus: "",
    lastEducation: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState<UserFilter>(() => toUserFilter(filterValues));
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  const { data: categories } = useMasterCategories();
  const { data: users = [], isLoading, error } = useUsers(debouncedFilters);
  const deleteMutation = useDeleteUser();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilters(toUserFilter(filterValues));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [filterValues]);

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        setUserToDelete(null);
      },
    });
  };

  return (
    <div className="page-container space-y-6 animate-fade-in">
      {/* Header View */}
      <PageHeader
        icon={UsersIcon}
        title="Manajemen Pegawai"
        description="Kelola akun pengguna, data biodata, dan hak akses seluruh pegawai."
        action={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link href="/users/categories">
              <Button variant="outline" className="rounded-full px-5 border-border">
                <Layers className="w-4 h-4 mr-2 text-primary" />
                Master Kategori
              </Button>
            </Link>
            <Link href="/users/new">
              <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 px-6 shrink-0">
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah Pegawai
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
      <EmployeeFilterBar values={filterValues} onChange={setFilterValues} categories={categories} />

      <div className="flex items-center justify-end gap-3">
        <UsersBulkActions filters={debouncedFilters} />
      </div>

      {/* Table Data */}
      <UserTable
        data={users}
        isLoading={isLoading}
        onDelete={(item) => setUserToDelete(item)}
      />

      {/* GitHub-Style Layered Delete Modal for User Account Deletion */}
      <LayeredDeleteModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Akun Pegawai Permanen"
        itemName={userToDelete?.employeeId || ""}
        itemType="akun pegawai"
        impactDetails={[
          `Akun atas nama '${userToDelete?.name}' akan dihapus secara permanen dari sistem.`,
          "Seluruh arsip dokumen yang diunggah oleh pegawai ini akan kehilangan asosiasi kepemilikan.",
          "Hak akses login pegawai ke SIMDP akan dicabut secara serta-merta.",
          "Aksi penghapusan ini tidak dapat dibatalkan.",
        ]}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
