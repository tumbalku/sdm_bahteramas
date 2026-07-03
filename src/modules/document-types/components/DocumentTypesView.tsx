"use client";

import { useState } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Filter, FileSpreadsheet, FolderArchive } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LayeredDeleteModal } from "@/components/LayeredDeleteModal";
import {
  useDeleteDocumentType,
  useDocumentTypes,
} from "../hooks";
import { DocumentTypeRecord } from "../types";
import { DocumentTypeTable } from "./DocumentTypeTable";

export function DocumentTypesView() {
  const [selectedCategory, setSelectedCategory] = useState<
    DocumentArchiveCategory | "ALL"
  >("ALL");

  const [itemToDelete, setItemToDelete] = useState<DocumentTypeRecord | null>(null);

  const filters =
    selectedCategory === "ALL" ? {} : { category: selectedCategory };

  const { data: documentTypes = [], isLoading, error } =
    useDocumentTypes(filters);

  const deleteMutation = useDeleteDocumentType();

  const handleDelete = (item: DocumentTypeRecord) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id, {
        onSuccess: () => {
          setItemToDelete(null);
        },
      });
    }
  };

  return (
    <div className="page-container space-y-6">
      {/* Header View */}
      <PageHeader
        icon={FileSpreadsheet}
        title="Master Jenis Dokumen"
        description="Kelola daftar jenis berkas kepegawaian dan kriteria persyaratannya."
        action={
          <div className="flex items-center gap-3">
            <Link href="/document-types/archives">
              <Button
                variant="outline"
                className="rounded-full px-5 shrink-0 border-border hover:bg-accent"
              >
                <FolderArchive className="w-4 h-4 mr-2 text-primary" />
                Lihat Arsip
              </Button>
            </Link>
            <Link href="/documents-types/add">
              <Button
                className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 px-6 shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Dokumen
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

      {/* Filter Dropdown */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" /> Filter Kategori:
        </span>
        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(
              e.target.value as DocumentArchiveCategory | "ALL"
            )
          }
          className="px-4 py-2 rounded-xl border border-input bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[200px]"
        >
          <option value="ALL">Semua Kategori</option>
          <option value="UTAMA">Arsip Utama</option>
          <option value="PROFESI">Arsip Profesi</option>
          <option value="KONDISIONAL">Arsip Kondisional</option>
        </select>
      </div>

      {/* Table Data */}
      <DocumentTypeTable
        data={documentTypes}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* Layered Security Delete Modal */}
      {itemToDelete && (
        <LayeredDeleteModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Konfirmasi Hapus Jenis Dokumen"
          itemName={itemToDelete.name}
          itemType="jenis dokumen"
          impactDetails={[
            `Seluruh kriteria kualifikasi target sasaran untuk '${itemToDelete.name}' akan dihapus permanen.`,
            "Tindakan ini tidak dapat dibatalkan atau dikembalikan.",
            "Pegawai tidak akan lagi melihat persyaratan jenis dokumen ini di dashboard mereka.",
          ]}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
