"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Search } from "lucide-react";
import { useCreateUser, useDeleteUser, useUsers, useUpdateUser } from "../hooks";
import { UserRecord } from "../types";
import { UserTable } from "./UserTable";
import { UserFormModal } from "./UserFormModal";

export function UsersView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserRecord | null>(null);

  const { data: users = [], isLoading, error } = useUsers({
    search: searchTerm || undefined,
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: UserRecord) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: UserRecord) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus akun pegawai '${item.name}' (${item.employeeId})?`
      )
    ) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleFormSubmit = (formData: any) => {
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, input: formData },
        {
          onSuccess: () => setIsModalOpen(false),
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Manajemen Pegawai
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola akun pengguna, data biodata, dan hak akses seluruh pegawai.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 px-6 shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Pegawai Baru
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {(error as Error).message}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan Nama atau NIP pegawai..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
          />
        </div>
      </div>

      {/* Table Data */}
      <UserTable
        data={users}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Modal Form */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        initialData={editingItem}
      />
    </div>
  );
}
