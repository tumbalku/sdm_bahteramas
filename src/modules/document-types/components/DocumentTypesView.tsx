"use client";

import { useState } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import {
  useCreateDocumentType,
  useDeleteDocumentType,
  useDocumentTypes,
  useUpdateDocumentType,
} from "../hooks";
import { DocumentTypeRecord } from "../types";
import { DocumentTypeTable } from "./DocumentTypeTable";
import { DocumentTypeFormModal } from "./DocumentTypeFormModal";

export function DocumentTypesView() {
  const [selectedCategory, setSelectedCategory] = useState<
    DocumentArchiveCategory | "ALL"
  >("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentTypeRecord | null>(
    null
  );

  const filters =
    selectedCategory === "ALL" ? {} : { category: selectedCategory };

  const { data: documentTypes = [], isLoading, error } =
    useDocumentTypes(filters);

  const createMutation = useCreateDocumentType();
  const updateMutation = useUpdateDocumentType();
  const deleteMutation = useDeleteDocumentType();

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DocumentTypeRecord) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: DocumentTypeRecord) => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus jenis dokumen '${item.name}'?`
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
            Master Jenis Dokumen
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola daftar jenis berkas kepegawaian dan kriteria persyaratannya.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 px-6 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Jenis Dokumen
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {(error as Error).message}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-sm font-semibold text-muted-foreground mr-2 flex items-center gap-1">
          <Filter className="w-4 h-4" /> Filter:
        </span>
        <button
          onClick={() => setSelectedCategory("ALL")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            selectedCategory === "ALL"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          Semua Kategori
        </button>
        <button
          onClick={() => setSelectedCategory("UTAMA")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            selectedCategory === "UTAMA"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          Arsip UTAMA
        </button>
        <button
          onClick={() => setSelectedCategory("PROFESI")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            selectedCategory === "PROFESI"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          Arsip PROFESI
        </button>
        <button
          onClick={() => setSelectedCategory("KONDISIONAL")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            selectedCategory === "KONDISIONAL"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          Arsip KONDISIONAL
        </button>
      </div>

      {/* Table Data */}
      <DocumentTypeTable
        data={documentTypes}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Modal Form */}
      <DocumentTypeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        initialData={editingItem}
      />
    </div>
  );
}
