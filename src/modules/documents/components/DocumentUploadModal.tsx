"use client";

import { useEffect, useMemo, useRef, useState, DragEvent } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { X, Loader2, UploadCloud, FileCheck, RefreshCcw } from "lucide-react";
import { useDocumentTypes } from "@/modules/document-types/hooks";
import { DocumentRecordDto, DocumentUploadInput } from "../types";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentUploadInput) => void;
  isLoading: boolean;
  activeCategory: DocumentArchiveCategory;
  existingDocuments?: DocumentRecordDto[];
  replacementDocument?: DocumentRecordDto | null;
}

function formatDateInputValue(date?: Date | string | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function getUploadModalCopy(isReplacementMode: boolean) {
  return {
    title: isReplacementMode ? "Upload Ulang Dokumen" : "Unggah Dokumen",
    submitLabel: isReplacementMode ? "Upload Ulang" : "Unggah",
  };
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  activeCategory,
  existingDocuments = [],
  replacementDocument,
}: DocumentUploadModalProps) {
  const { data: documentTypes, isLoading: isLoadingTypes } = useDocumentTypes({ forUser: true });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [documentNumber, setDocumentNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const isReplacementMode = Boolean(replacementDocument);
  const modalCopy = getUploadModalCopy(isReplacementMode);
  const uploadedDocumentTypeIds = useMemo(() => {
    return new Set(existingDocuments.map((document) => document.documentTypeId));
  }, [existingDocuments]);

  useEffect(() => {
    if (!isOpen) {
      setDocumentTypeId("");
      setFile(null);
      setDocumentNumber("");
      setIssueDate("");
      setExpiryDate("");
      return;
    }

    if (replacementDocument) {
      setDocumentTypeId(replacementDocument.documentTypeId);
      setDocumentNumber(replacementDocument.documentNumber || "");
      setIssueDate(formatDateInputValue(replacementDocument.issueDate));
      setExpiryDate(formatDateInputValue(replacementDocument.expiryDate));
    }
  }, [isOpen, replacementDocument]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentTypeId) return;
    onSubmit({
      ownerId: "",
      documentTypeId,
      replaceDocumentId: replacementDocument?.id,
      documentNumber: documentNumber || undefined,
      issueDate: issueDate || undefined,
      file,
      expiryDate: expiryDate || undefined,
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const droppedExt = droppedFile.name.split(".").pop()?.toLowerCase();
      if (droppedExt && allowedFormats.includes(droppedExt)) {
        setFile(droppedFile);
      } else {
        alert(`File harus berformat ${allowedFormats.join(", ").toUpperCase()}!`);
      }
    }
  };

  const handleFilePickerOpen = () => {
    fileInputRef.current?.click();
  };

  const currentCategoryTypes = documentTypes?.filter((type) => {
    if (isReplacementMode) return type.id === replacementDocument?.documentTypeId;
    return type.archiveCategory === activeCategory && !uploadedDocumentTypeIds.has(type.id);
  }) || [];

  const selectedType = documentTypes?.find((type) => type.id === documentTypeId);
  const allowedFormats = selectedType?.allowedFormats
    .split(",")
    .map((format) => format.trim().toLowerCase())
    .filter(Boolean) || ["pdf", "jpg", "jpeg", "png"];
  const fileAccept = allowedFormats.map((format) => `.${format}`).join(",");
  const isSubmitDisabled =
    isLoading ||
    !file ||
    !documentTypeId ||
    Boolean(selectedType?.requiresDocumentNumber && !documentNumber.trim()) ||
    Boolean(selectedType?.requiresIssueDate && !issueDate) ||
    Boolean(selectedType?.requiresExpiryDate && !expiryDate);

  const optionItems = currentCategoryTypes.map((type) => ({
    value: type.id,
    label: `${type.code} - ${type.name}`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {isReplacementMode ? (
              <RefreshCcw className="w-5 h-5 text-primary" />
            ) : (
              <UploadCloud className="w-5 h-5 text-primary" />
            )}
            <span>{modalCopy.title}</span>
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Dokumen</label>
            <Select
              value={documentTypeId}
              onChange={(e) => {
                setDocumentTypeId(e.target.value);
                setDocumentNumber("");
                setIssueDate("");
                setExpiryDate("");
              }}
              disabled={isLoadingTypes || isReplacementMode}
              options={optionItems}
              placeholder="-- Pilih Jenis Dokumen --"
              required
            />
            {isReplacementMode && (
              <p className="mt-1 text-xs text-muted-foreground">
                Jenis dokumen dikunci agar upload ulang tetap mengganti dokumen yang sama.
              </p>
            )}
            {!isReplacementMode && !isLoadingTypes && optionItems.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Semua jenis dokumen pada kategori ini sudah pernah diunggah.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              File Dokumen ({allowedFormats.join(", ").toUpperCase()})
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : file
                  ? "border-green-500 bg-green-500/10"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={handleFilePickerOpen}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept={fileAccept}
                className="hidden"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
              />
              {file ? (
                <div className="flex flex-col items-center">
                  <FileCheck className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Tarik & Lepas file ke sini, atau <span className="text-primary font-semibold">Cari File</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maksimal ukuran file: {(() => {
                      if (!selectedType) return "10 MB";
                      if (selectedType.maxSizeMb < 1) return `${Math.round(selectedType.maxSizeMb * 1024)} KB`;
                      if (selectedType.maxSizeMb > 50) return `${Math.round(selectedType.maxSizeMb)} KB`;
                      return `${selectedType.maxSizeMb} MB`;
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {selectedType?.requiresDocumentNumber && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Nomor Surat <span className="text-destructive">*</span>
              </label>
              <Input
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Contoh: 800/123/RSUD/2026"
                required
              />
            </div>
          )}

          {selectedType?.requiresIssueDate && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Terbit Surat/Dokumen <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>
          )}

          {selectedType?.requiresExpiryDate && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Kedaluwarsa <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
          )}

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitDisabled} className="rounded-xl px-6">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <span>{modalCopy.submitLabel}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
