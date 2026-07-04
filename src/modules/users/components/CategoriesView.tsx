"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { MasterCategoryCard } from "@/components/MasterCategoryCard";
import {
  Layers,
  Plus,
  Folder,
  Briefcase,
  Award,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { CategoryFormModal, DataType } from "./CategoryFormModal";
import { useMasterCategories } from "../hooks";

export function CategoriesView() {
  const { data: categories, isLoading: fetchLoading, refetch: refetchCategories } = useMasterCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; type: DataType; parentId?: string } | null>(null);
  const [defaultType, setDefaultType] = useState<DataType>("STATUS");

  const employmentStatuses = categories?.employmentStatuses || [];
  const professionGroups = categories?.professionGroups || [];
  const employeeRanks = categories?.employeeRanks || [];
  const workplaces = categories?.workplaces || [];

  const handleOpenAddModal = (type: DataType = "STATUS") => {
    setEditingItem(null);
    setDefaultType(type);
    setIsModalOpen(true);
  };

  const handleStartEdit = (id: string, itemName: string, itemType: DataType, pId?: string) => {
    setEditingItem({ id, name: itemName, type: itemType, parentId: pId });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string, itemType: DataType, itemName: string) => {
    const confirmText =
      itemType === "STATUS" || itemType === "PROFESSION"
        ? `Menghapus "${itemName}" akan menghapus semua sub-kategori di bawahnya. Yakin ingin menghapus?`
        : `Apakah Anda yakin ingin menghapus "${itemName}"?`;

    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/v1/users/categories?id=${id}&type=${itemType}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menghapus data.");
      }

      toast.success(`Data "${itemName}" berhasil dihapus.`);
      if (editingItem?.id === id) handleCloseModal();
      refetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus data.");
    }
  };

  const handleFormSubmit = async (payload: { type: DataType; name: string; parentId?: string }) => {
    if ((payload.type === "GROUP" || payload.type === "POSITION") && !payload.parentId) {
      toast.error("Harap pilih kategori induk terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const method = editingItem ? "PATCH" : "POST";
      const bodyPayload = editingItem
        ? { id: editingItem.id, type: payload.type, name: payload.name, parentId: payload.parentId || null }
        : { type: payload.type, name: payload.name, parentId: payload.parentId || null };

      const res = await fetch("/api/v1/users/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Gagal ${editingItem ? "memperbarui" : "menambahkan"} data.`);
      }

      toast.success(`Data "${payload.name}" berhasil ${editingItem ? "diperbarui" : "ditambahkan"}.`);
      handleCloseModal();
      refetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="page-container space-y-6 animate-fade-in pb-8">
        <div className="flex items-center gap-4 pb-4 border-b border-border/60">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
        </div>

        <CardSkeleton count={4} gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <PageHeader
        icon={Layers}
        title="Master Kategori Pegawai"
        description="Kelola hirarki status, jenis kepegawaian, kelompok profesi, jabatan, pangkat, dan tempat tugas."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => handleOpenAddModal("STATUS")} className="rounded-xl shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Master
            </Button>
            <Link href="/users">
              <Button variant="outline" className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Grid Layout for Master Cards */}
      <div className="space-y-6">
        {/* Row 1: Status Kepegawaian & Kelompok Profesi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MasterCategoryCard
            title="Status & Jenis Kepegawaian"
            icon={Folder}
            iconColorClass="text-amber-500"
            badgeDotColorClass="bg-amber-500"
            countLabel={`${employmentStatuses.length} Status Induk`}
            emptyText="Belum ada data status kepegawaian."
            emptySubText="Belum ada sub-jenis untuk status ini."
            items={employmentStatuses.map((s) => ({
              id: s.id,
              name: s.name,
              children: s.employeeGroups,
            }))}
            parentType="STATUS"
            childType="GROUP"
            onEdit={handleStartEdit}
            onDelete={handleDelete}
          />

          <MasterCategoryCard
            title="Kelompok Profesi & Jabatan"
            icon={Briefcase}
            iconColorClass="text-blue-500"
            badgeDotColorClass="bg-blue-500"
            countLabel={`${professionGroups.length} Kelompok Profesi`}
            emptyText="Belum ada data kelompok profesi."
            emptySubText="Belum ada jabatan untuk profesi ini."
            items={professionGroups.map((p) => ({
              id: p.id,
              name: p.name,
              children: p.employeePositions,
            }))}
            parentType="PROFESSION"
            childType="POSITION"
            onEdit={handleStartEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Row 2: Pangkat/Golongan & Tempat Tugas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MasterCategoryCard
            title="Pangkat & Golongan"
            icon={Award}
            iconColorClass="text-orange-500"
            countLabel={`${employeeRanks.length} Pangkat`}
            emptyText="Belum ada data pangkat."
            items={employeeRanks.map((r) => ({ id: r.id, name: r.name }))}
            parentType="RANK"
            onEdit={handleStartEdit}
            onDelete={handleDelete}
          />

          <MasterCategoryCard
            title="Tempat Tugas"
            icon={Building2}
            iconColorClass="text-emerald-500"
            countLabel={`${workplaces.length} Tempat Tugas`}
            emptyText="Belum ada data tempat tugas."
            items={workplaces.map((w) => ({ id: w.id, name: w.name }))}
            parentType="WORKPLACE"
            onEdit={handleStartEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        isLoading={submitting}
        initialData={editingItem}
        employmentStatuses={employmentStatuses}
        professionGroups={professionGroups}
        defaultType={defaultType}
      />
    </div>
  );
}
