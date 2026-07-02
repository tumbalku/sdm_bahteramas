"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Edit, ArrowLeft, Loader2, Check } from "lucide-react";
import { useDocumentType, useUpdateDocumentType } from "../hooks";
import { TargetCriteriaSelector } from "./TargetCriteriaSelector";
import { cn } from "@/lib/utils";

const FORMAT_OPTIONS = [
  { id: "pdf", label: "PDF", desc: "Dokumen (.pdf)" },
  { id: "jpg", label: "JPG / JPEG", desc: "Gambar (.jpg, .jpeg)" },
  { id: "png", label: "PNG", desc: "Gambar (.png)" },
  { id: "docx", label: "Word", desc: "Dokumen (.docx)" },
  { id: "xlsx", label: "Excel", desc: "Spreadsheet (.xlsx)" },
];

interface EditDocumentTypeViewProps {
  id: string;
}

export function EditDocumentTypeView({ id }: EditDocumentTypeViewProps) {
  const router = useRouter();
  const { data: initialData, isLoading, error } = useDocumentType(id);
  const updateMutation = useUpdateDocumentType();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [archiveCategory, setArchiveCategory] = useState<DocumentArchiveCategory>("UTAMA");
  const [isMandatory, setIsMandatory] = useState(false);
  const [requiresExpiryDate, setRequiresExpiryDate] = useState(false);
  const [requiresIssueDate, setRequiresIssueDate] = useState(false);
  const [requiresDocumentNumber, setRequiresDocumentNumber] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [sizeValue, setSizeValue] = useState<number>(5);
  const [sizeUnit, setSizeUnit] = useState<"KB" | "MB">("MB");

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [selectedRanks, setSelectedRanks] = useState<string[]>([]);
  const [selectedWorkplaces, setSelectedWorkplaces] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setDescription(initialData.description || "");
      setArchiveCategory(initialData.archiveCategory);
      setIsMandatory(initialData.isMandatory);
      setRequiresExpiryDate(initialData.requiresExpiryDate);
      setRequiresIssueDate(initialData.requiresIssueDate);
      setRequiresDocumentNumber(initialData.requiresDocumentNumber);
      setSelectedFormats(initialData.allowedFormats ? initialData.allowedFormats.split(",") : []);
      
      if (initialData.maxSizeMb < 1) {
        setSizeValue(Math.round(initialData.maxSizeMb * 1024));
        setSizeUnit("KB");
      } else {
        setSizeValue(initialData.maxSizeMb);
        setSizeUnit("MB");
      }

      if (initialData.targetStatuses) setSelectedStatuses(initialData.targetStatuses.map((s) => s.id));
      if (initialData.targetGroups) setSelectedGroups(initialData.targetGroups.map((g) => g.id));
      if (initialData.targetProfessions) setSelectedProfessions(initialData.targetProfessions.map((p) => p.id));
      if (initialData.targetRanks) setSelectedRanks(initialData.targetRanks.map((r) => r.id));
      if (initialData.targetWorkplaces) setSelectedWorkplaces(initialData.targetWorkplaces.map((w) => w.id));
    }
  }, [initialData]);

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

    updateMutation.mutate(
      {
        id,
        input: {
          code,
          name,
          description,
          archiveCategory,
          isMandatory,
          requiresExpiryDate,
          requiresIssueDate,
          requiresDocumentNumber,
          allowedFormats: selectedFormats.join(","),
          maxSizeMb: calculatedMb,
          employmentStatusIds: selectedStatuses,
          employeeGroupIds: selectedGroups,
          professionGroupIds: selectedProfessions,
          employeeRankIds: selectedRanks,
          workplaceIds: selectedWorkplaces,
        }
      },
      {
        onSuccess: () => {
          router.push("/document-types");
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-10 h-10 mb-3 animate-spin opacity-50 text-primary" />
        <p className="text-sm font-medium">Memuat data jenis dokumen...</p>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl text-red-600 max-w-lg mx-auto mt-10">
        <p className="font-semibold">Gagal memuat jenis dokumen</p>
        <p className="text-sm mt-1 opacity-80">Data mungkin telah dihapus atau Anda tidak memiliki akses.</p>
        <Button variant="outline" onClick={() => router.push("/document-types")} className="mt-4 rounded-xl border-red-500/20 hover:bg-red-500/10 text-red-600">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6 pb-12 animate-fade-in">
      <PageHeader
        icon={Edit}
        title="Edit Jenis Dokumen"
        description="Ubah kriteria dan klasifikasi berkas kepegawaian."
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

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Kode Dokumen *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: STR, KTP, SIP"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                <option value="MB">MB (Megabyte)</option>
                <option value="KB">KB (Kilobyte)</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Batas ukuran berkas maksimal saat diunggah pegawai ({sizeValue} {sizeUnit}).
            </p>
          </div>

          {/* Target Criteria Selection Panel */}
          <TargetCriteriaSelector
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            selectedGroups={selectedGroups}
            setSelectedGroups={setSelectedGroups}
            selectedProfessions={selectedProfessions}
            setSelectedProfessions={setSelectedProfessions}
            selectedRanks={selectedRanks}
            setSelectedRanks={setSelectedRanks}
            selectedWorkplaces={selectedWorkplaces}
            setSelectedWorkplaces={setSelectedWorkplaces}
          />

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

            <div className="border-t border-border/40 my-2" />

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requiresIssueDate}
                onChange={(e) => setRequiresIssueDate(e.target.checked)}
                className="rounded-lg text-primary focus:ring-primary w-5 h-5 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold block text-foreground">Membutuhkan Tanggal Terbit Surat/Dokumen</span>
                <span className="text-xs text-muted-foreground block">Pegawai wajib mengisikan tanggal terbit saat mengunggah dokumen ini.</span>
              </div>
            </label>

            <div className="border-t border-border/40 my-2" />

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requiresDocumentNumber}
                onChange={(e) => setRequiresDocumentNumber(e.target.checked)}
                className="rounded-lg text-primary focus:ring-primary w-5 h-5 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold block text-foreground">Membutuhkan Nomor Surat</span>
                <span className="text-xs text-muted-foreground block">Pegawai wajib mengisikan nomor surat saat mengunggah dokumen ini.</span>
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
              disabled={updateMutation.isPending}
              className="rounded-2xl px-8 h-11 shadow-lg shadow-primary/25 hover:shadow-primary/40 font-semibold"
            >
              {updateMutation.isPending ? (
               <>
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                 Menyimpan...
               </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
