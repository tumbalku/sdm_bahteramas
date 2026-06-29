"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { FilePlus, ArrowLeft, Loader2, Check } from "lucide-react";
import { useCreateDocumentType } from "../hooks";
import { cn } from "@/lib/utils";

const FORMAT_OPTIONS = [
  { id: "pdf", label: "PDF", desc: "Dokumen (.pdf)" },
  { id: "jpg", label: "JPG / JPEG", desc: "Gambar (.jpg, .jpeg)" },
  { id: "png", label: "PNG", desc: "Gambar (.png)" },
  { id: "docx", label: "Word", desc: "Dokumen (.docx)" },
  { id: "xlsx", label: "Excel", desc: "Spreadsheet (.xlsx)" },
];

export function AddDocumentTypeView() {
  const router = useRouter();
  const createMutation = useCreateDocumentType();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [archiveCategory, setArchiveCategory] = useState<DocumentArchiveCategory>("UTAMA");
  const [isMandatory, setIsMandatory] = useState(false);
  const [requiresExpiryDate, setRequiresExpiryDate] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["pdf", "jpg", "png"]);
  const [sizeValue, setSizeValue] = useState<number>(5);
  const [sizeUnit, setSizeUnit] = useState<"KB" | "MB">("MB");

  const toggleFormat = (fmtId: string) => {
    setSelectedFormats((prev) =>
      prev.includes(fmtId) ? prev.filter((f) => f !== fmtId) : [...prev, fmtId]
    );
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedFormats.length === 0) {
      alert("Pilih minimal 1 format ekstensi file yang diizinkan!");
      return;
    }
    const calculatedMb = sizeUnit === "KB" ? Math.round((sizeValue / 1024) * 10000) / 10000 : sizeValue;

    createMutation.mutate(
      {
        code,
        name,
        description,
        archiveCategory,
        isMandatory,
        requiresExpiryDate,
        allowedFormats: selectedFormats.join(","),
        maxSizeMb: calculatedMb,
      },
      {
        onSuccess: () => {
          router.push("/document-types");
        },
      }
    );
  }

  return (
    <div className="page-container space-y-6 pb-12 animate-fade-in">
      <PageHeader
        icon={FilePlus}
        title="Tambah Jenis Dokumen Baru"
        description="Buat kriteria dan klasifikasi berkas kepegawaian baru."
        action={
          <Button
            variant="outline"
            onClick={() => router.push("/document-types")}
            className="rounded-full px-5 border-border hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Kode Dokumen *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: STR, KTP, SIP"
                className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Kode unik identifikasi dokumen (huruf kapital).</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Kategori Arsip *</label>
              <select
                value={archiveCategory}
                onChange={(e) => setArchiveCategory(e.target.value as DocumentArchiveCategory)}
                className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="UTAMA">UTAMA (Wajib Dasar Semua Pegawai)</option>
                <option value="KONDISIONAL">KONDISIONAL (Opsional / Tergantung Kondisi)</option>
                <option value="PROFESI">PROFESI (Khusus Tenaga Medis / Kesehatan)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">Klasifikasi kelompok berkas kepegawaian.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Nama Jenis Dokumen *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Surat Tanda Registrasi (STR) Tenaga Medis"
              className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Deskripsi Keterangan Opsional</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara singkat mengenai berkas ini dan persyaratannya..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Format Ekstensi Diizinkan *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {FORMAT_OPTIONS.map((fmt) => {
                const isSelected = selectedFormats.includes(fmt.id);
                return (
                  <button
                    type="button"
                    key={fmt.id}
                    onClick={() => toggleFormat(fmt.id)}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all select-none cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase">{fmt.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{fmt.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 ml-1 text-primary" />}
                  </button>
                );
              })}
            </div>
            {selectedFormats.length === 0 ? (
              <p className="text-xs text-destructive mt-1.5 font-medium">Pilih minimal 1 format ekstensi file.</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1.5">
                Format terpilih: <span className="font-mono font-bold text-foreground">{selectedFormats.join(", ")}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Maksimal Ukuran File *</label>
            <div className="flex items-center gap-3 max-w-md">
              <input
                type="number"
                value={sizeValue}
                onChange={(e) => setSizeValue(Number(e.target.value))}
                min={1}
                max={sizeUnit === "KB" ? 50000 : 100}
                className="flex-1 px-4 py-3 rounded-2xl border border-input bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <select
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value as "KB" | "MB")}
                className="px-5 py-3 rounded-2xl border border-input bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-xs"
              >
                <option value="MB font-semibold">MB (Megabyte)</option>
                <option value="KB font-semibold">KB (Kilobyte)</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Batas ukuran berkas maksimal saat diunggah pegawai ({sizeValue} {sizeUnit}).
            </p>
          </div>

          <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="rounded-lg text-primary focus:ring-primary w-5 h-5 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold block text-foreground">Dokumen Wajib Dimiliki Pegawai</span>
                <span className="text-xs text-muted-foreground block">Jika diaktifkan, indikator kelengkapan akan memperhitungkan berkas ini.</span>
              </div>
            </label>

            <div className="border-t border-border/40 my-2" />

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requiresExpiryDate}
                onChange={(e) => setRequiresExpiryDate(e.target.checked)}
                className="rounded-lg text-primary focus:ring-primary w-5 h-5 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold block text-foreground">Membutuhkan Tanggal Kedaluwarsa (Masa Berlaku)</span>
                <span className="text-xs text-muted-foreground block">Pegawai wajib mengisikan tanggal masa berlaku saat mengunggah dokumen ini.</span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/document-types")}
              className="rounded-2xl px-6 h-11"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-2xl px-8 h-11 shadow-lg shadow-primary/25 hover:shadow-primary/40 font-semibold"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Jenis Dokumen"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
