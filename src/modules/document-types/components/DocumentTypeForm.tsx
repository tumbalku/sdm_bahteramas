"use client";

import { useReducer, useEffect } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import { TargetCriteriaSelector } from "./TargetCriteriaSelector";
import { cn } from "@/lib/utils";
import { DocumentTypeFormState, DocumentTypeRecord } from "../types";

export const FORMAT_OPTIONS = [
  { id: "pdf", label: "PDF", desc: "Dokumen (.pdf)" },
  { id: "jpg", label: "JPG / JPEG", desc: "Gambar (.jpg, .jpeg)" },
  { id: "png", label: "PNG", desc: "Gambar (.png)" },
  { id: "docx", label: "Word", desc: "Dokumen (.docx)" },
  { id: "xlsx", label: "Excel", desc: "Spreadsheet (.xlsx)" },
];

export const DOCUMENT_TYPE_FORM_DEFAULT: DocumentTypeFormState = {
  code: "",
  name: "",
  description: "",
  archiveCategory: "UTAMA",
  isMandatory: false,
  requiresExpiryDate: false,
  requiresIssueDate: false,
  requiresDocumentNumber: false,
  selectedFormats: ["pdf", "jpg", "png"],
  sizeValue: 5,
  sizeUnit: "MB",
  selectedStatuses: [],
  selectedGroups: [],
  selectedProfessions: [],
  selectedRanks: [],
  selectedWorkplaces: [],
};

export function mapDocumentTypeToFormState(data: DocumentTypeRecord): DocumentTypeFormState {
  const isKb = data.maxSizeMb < 1;
  const sizeValue = isKb ? Math.round(data.maxSizeMb * 1024) : data.maxSizeMb;
  const sizeUnit = isKb ? "KB" : "MB";

  return {
    code: data.code,
    name: data.name,
    description: data.description || "",
    archiveCategory: data.archiveCategory,
    isMandatory: data.isMandatory,
    requiresExpiryDate: data.requiresExpiryDate,
    requiresIssueDate: data.requiresIssueDate,
    requiresDocumentNumber: data.requiresDocumentNumber,
    selectedFormats: data.allowedFormats ? data.allowedFormats.split(",") : [],
    sizeValue,
    sizeUnit,
    selectedStatuses: data.targetStatuses ? data.targetStatuses.map((s) => s.id) : [],
    selectedGroups: data.targetGroups ? data.targetGroups.map((g) => g.id) : [],
    selectedProfessions: data.targetProfessions ? data.targetProfessions.map((p) => p.id) : [],
    selectedRanks: data.targetRanks ? data.targetRanks.map((r) => r.id) : [],
    selectedWorkplaces: data.targetWorkplaces ? data.targetWorkplaces.map((w) => w.id) : [],
  };
}

export function formStateToPayload(state: DocumentTypeFormState) {
  const calculatedMb =
    state.sizeUnit === "KB"
      ? Math.round((state.sizeValue / 1024) * 10000) / 10000
      : state.sizeValue;

  return {
    code: state.code,
    name: state.name,
    description: state.description,
    archiveCategory: state.archiveCategory,
    isMandatory: state.isMandatory,
    requiresExpiryDate: state.requiresExpiryDate,
    requiresIssueDate: state.requiresIssueDate,
    requiresDocumentNumber: state.requiresDocumentNumber,
    allowedFormats: state.selectedFormats.join(","),
    maxSizeMb: calculatedMb,
    employmentStatusIds: state.selectedStatuses,
    employeeGroupIds: state.selectedGroups,
    professionGroupIds: state.selectedProfessions,
    employeeRankIds: state.selectedRanks,
    workplaceIds: state.selectedWorkplaces,
  };
}

function formReducer(state: DocumentTypeFormState, patch: Partial<DocumentTypeFormState>): DocumentTypeFormState {
  return { ...state, ...patch };
}

interface DocumentTypeFormProps {
  initialValues?: DocumentTypeFormState;
  onSubmit: (values: DocumentTypeFormState) => void;
  isPending: boolean;
  submitLabel?: string;
  onCancel: () => void;
}

export function DocumentTypeForm({
  initialValues,
  onSubmit,
  isPending,
  submitLabel = "Simpan Dokumen",
  onCancel,
}: DocumentTypeFormProps) {
  const [state, dispatch] = useReducer(formReducer, initialValues ?? DOCUMENT_TYPE_FORM_DEFAULT);

  // Sync initialValues if they arrive late
  useEffect(() => {
    if (initialValues) {
      dispatch(initialValues);
    }
  }, [initialValues]);

  const toggleFormat = (fmtId: string) => {
    dispatch({
      selectedFormats: state.selectedFormats.includes(fmtId)
        ? state.selectedFormats.filter((f) => f !== fmtId)
        : [...state.selectedFormats, fmtId],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.selectedFormats.length === 0) {
      alert("Pilih minimal 1 format ekstensi file yang diizinkan!");
      return;
    }
    onSubmit(state);
  };

  // Helper setter functions that conform to React.Dispatch<React.SetStateAction<string[]>>
  const makeSetter = (key: keyof DocumentTypeFormState) => {
    const setter: React.Dispatch<React.SetStateAction<string[]>> = (action) => {
      const prevValue = state[key] as string[];
      const newValue = typeof action === "function" ? action(prevValue) : action;
      dispatch({ [key]: newValue });
    };
    return setter;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Kode Dokumen *</label>
          <input
            type="text"
            value={state.code}
            onChange={(e) => dispatch({ code: e.target.value.toUpperCase() })}
            placeholder="Contoh: STR, KTP, SIP"
            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Kode unik identifikasi dokumen (huruf kapital).</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Kategori Arsip *</label>
          <Select
            value={state.archiveCategory}
            onChange={(e) => dispatch({ archiveCategory: e.target.value as DocumentArchiveCategory })}
            options={[
              { value: "UTAMA", label: "Arsip Utama" },
              { value: "KONDISIONAL", label: "Arsip Kondisional" },
              { value: "PROFESI", label: "Arsip Profesi" },
            ]}
            className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground mt-1">Klasifikasi kelompok berkas kepegawaian.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Nama Jenis Dokumen *</label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => dispatch({ name: e.target.value })}
          placeholder="Contoh: Surat Tanda Registrasi (STR) Tenaga Medis"
          className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Deskripsi Keterangan Opsional</label>
        <textarea
          value={state.description}
          onChange={(e) => dispatch({ description: e.target.value })}
          placeholder="Jelaskan secara singkat mengenai berkas ini dan persyaratannya..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Format Ekstensi Diizinkan *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {FORMAT_OPTIONS.map((fmt) => {
            const isSelected = state.selectedFormats.includes(fmt.id);
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
        {state.selectedFormats.length === 0 ? (
          <p className="text-xs text-destructive mt-1.5 font-medium">Pilih minimal 1 format ekstensi file.</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1.5">
            Format terpilih: <span className="font-mono font-bold text-foreground">{state.selectedFormats.join(", ")}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Maksimal Ukuran File *</label>
        <div className="flex items-center gap-3 max-w-md">
          <input
            type="number"
            value={state.sizeValue}
            onChange={(e) => dispatch({ sizeValue: Number(e.target.value) })}
            min={1}
            max={state.sizeUnit === "KB" ? 50000 : 100}
            className="flex-1 px-4 py-3 rounded-2xl border border-input bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <Select
            value={state.sizeUnit}
            onChange={(e) => dispatch({ sizeUnit: e.target.value as "KB" | "MB" })}
            options={[
              { value: "MB", label: "Megabyte" },
              { value: "KB", label: "Kilobyte" },
            ]}
            className="px-5 py-3 rounded-2xl border border-input bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-xs"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Batas ukuran berkas maksimal saat diunggah pegawai ({state.sizeValue} {state.sizeUnit}).
        </p>
      </div>

      {/* Target Criteria Selection Panel */}
      <TargetCriteriaSelector
        selectedStatuses={state.selectedStatuses}
        setSelectedStatuses={makeSetter("selectedStatuses")}
        selectedGroups={state.selectedGroups}
        setSelectedGroups={makeSetter("selectedGroups")}
        selectedProfessions={state.selectedProfessions}
        setSelectedProfessions={makeSetter("selectedProfessions")}
        selectedRanks={state.selectedRanks}
        setSelectedRanks={makeSetter("selectedRanks")}
        selectedWorkplaces={state.selectedWorkplaces}
        setSelectedWorkplaces={makeSetter("selectedWorkplaces")}
      />

      <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={state.isMandatory}
            onChange={(e) => dispatch({ isMandatory: e.target.checked })}
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
            checked={state.requiresExpiryDate}
            onChange={(e) => dispatch({ requiresExpiryDate: e.target.checked })}
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
            checked={state.requiresIssueDate}
            onChange={(e) => dispatch({ requiresIssueDate: e.target.checked })}
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
            checked={state.requiresDocumentNumber}
            onChange={(e) => dispatch({ requiresDocumentNumber: e.target.checked })}
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
          onClick={onCancel}
          className="rounded-2xl px-6 h-11"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-2xl px-8 h-11 shadow-lg shadow-primary/25 hover:shadow-primary/40 font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
