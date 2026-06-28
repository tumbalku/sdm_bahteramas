"use client";

import { useEffect, useState } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { CreateDocumentTypeInput, DocumentTypeRecord } from "../types";

interface DocumentTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDocumentTypeInput) => void;
  isLoading: boolean;
  initialData?: DocumentTypeRecord | null;
}

export function DocumentTypeFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: DocumentTypeFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [archiveCategory, setArchiveCategory] =
    useState<DocumentArchiveCategory>("UTAMA");
  const [isMandatory, setIsMandatory] = useState(false);
  const [requiresExpiryDate, setRequiresExpiryDate] = useState(false);
  const [allowedFormats, setAllowedFormats] = useState("pdf,jpg,png");
  const [maxSizeMb, setMaxSizeMb] = useState(5);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setDescription(initialData.description || "");
      setArchiveCategory(initialData.archiveCategory);
      setIsMandatory(initialData.isMandatory);
      setRequiresExpiryDate(initialData.requiresExpiryDate);
      setAllowedFormats(initialData.allowedFormats);
      setMaxSizeMb(initialData.maxSizeMb);
    } else {
      setCode("");
      setName("");
      setDescription("");
      setArchiveCategory("UTAMA");
      setIsMandatory(false);
      setRequiresExpiryDate(false);
      setAllowedFormats("pdf,jpg,png");
      setMaxSizeMb(5);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code,
      name,
      description,
      archiveCategory,
      isMandatory,
      requiresExpiryDate,
      allowedFormats,
      maxSizeMb: Number(maxSizeMb),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {initialData ? "Edit Jenis Dokumen" : "Tambah Jenis Dokumen"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kode Dokumen</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="STR, KTP, dll"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                disabled={!!initialData}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori Arsip</label>
              <select
                value={archiveCategory}
                onChange={(e) =>
                  setArchiveCategory(e.target.value as DocumentArchiveCategory)
                }
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="UTAMA">UTAMA (Wajib Dasar)</option>
                <option value="KONDISIONAL">KONDISIONAL (Opsional)</option>
                <option value="PROFESI">PROFESI (Tenaga Medis)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nama Jenis Dokumen</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Surat Tanda Registrasi Medis"
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Opsional</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan singkat mengenai dokumen..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Format Diizinkan</label>
              <input
                type="text"
                value={allowedFormats}
                onChange={(e) => setAllowedFormats(e.target.value)}
                placeholder="pdf,jpg,png"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Maks Ukuran (MB)</label>
              <input
                type="number"
                value={maxSizeMb}
                onChange={(e) => setMaxSizeMb(Number(e.target.value))}
                min={1}
                max={50}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="rounded text-primary focus:ring-primary w-4 h-4"
              />
              <span>Dokumen Wajib Dimiliki Pegawai</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={requiresExpiryDate}
                onChange={(e) => setRequiresExpiryDate(e.target.checked)}
                className="rounded text-primary focus:ring-primary w-4 h-4"
              />
              <span>Membutuhkan Tanggal Kedaluwarsa (Masa Berlaku)</span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl px-6">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Dokumen"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
