"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, Sparkles } from "lucide-react";

export type DataType = "STATUS" | "GROUP" | "PROFESSION" | "POSITION" | "RANK" | "WORKPLACE";

interface ItemWithChild {
  id: string;
  name: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { type: DataType; name: string; parentId?: string }) => Promise<void>;
  isLoading: boolean;
  initialData?: { id: string; name: string; type: DataType; parentId?: string } | null;
  employmentStatuses: ItemWithChild[];
  professionGroups: ItemWithChild[];
  defaultType?: DataType;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
  employmentStatuses,
  professionGroups,
  defaultType = "STATUS",
}: CategoryFormModalProps) {
  const [type, setType] = useState<DataType>(defaultType);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setName(initialData.name);
      setParentId(initialData.parentId || "");
    } else {
      setType(defaultType);
      setName("");
      setParentId("");
    }
  }, [initialData, isOpen, defaultType]);

  useEffect(() => {
    if (!initialData && type !== "GROUP" && type !== "POSITION") {
      setParentId("");
    }
  }, [type, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      type,
      name: name.trim(),
      parentId: parentId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold">
              {initialData ? "Edit Data Master" : "Tambah Data Master"}
            </h3>
          </div>
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
          <p className="text-xs text-muted-foreground -mt-2">
            {initialData
              ? `Sedang mengubah entri: ${initialData.name}`
              : "Isi formulir di bawah ini untuk menambahkan item ke dalam struktur master data pegawai."}
          </p>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              Tipe Data <span className="text-red-500">*</span>
            </label>
            <select
              disabled={!!initialData}
              value={type}
              onChange={(e) => setType(e.target.value as DataType)}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70"
            >
              <option value="STATUS">Status Kepegawaian (e.g. ASN, Non ASN)</option>
              <option value="GROUP">Jenis Kepegawaian (e.g. PNS, PPPK)</option>
              <option value="PROFESSION">Kelompok Profesi (e.g. Medis, Administrasi)</option>
              <option value="POSITION">Jabatan (e.g. Dokter, Programmer)</option>
              <option value="RANK">Pangkat / Golongan (e.g. Pembina (IV/a))</option>
              <option value="WORKPLACE">Tempat Tugas (e.g. Ruang ICCU)</option>
            </select>
          </div>

          {(type === "GROUP" || type === "POSITION") && (
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                {type === "GROUP" ? "Status Kepegawaian Induk *" : "Kelompok Profesi Induk *"}
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              >
                <option value="">
                  {type === "GROUP" ? "-- Pilih Status Induk --" : "-- Pilih Profesi Induk --"}
                </option>
                {type === "GROUP"
                  ? employmentStatuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  : professionGroups.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              Nama Entri <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama..."
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
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
                  {initialData ? "Perbarui..." : "Simpan..."}
                </>
              ) : initialData ? (
                "Perbarui"
              ) : (
                "Simpan Data"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
