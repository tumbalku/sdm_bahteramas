"use client";

import { useEffect, useState, DragEvent } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { X, Loader2, UploadCloud, FileCheck } from "lucide-react";
import { useDocumentTypes } from "@/modules/document-types/hooks";
import { DocumentUploadInput } from "../types";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentUploadInput) => void;
  isLoading: boolean;
  activeCategory: DocumentArchiveCategory;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  activeCategory,
}: DocumentUploadModalProps) {
  const { data: documentTypes, isLoading: isLoadingTypes } = useDocumentTypes();

  const [documentTypeId, setDocumentTypeId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const utamaTypes = documentTypes?.filter((t) => t.archiveCategory === "UTAMA") || [];
  const kondisionalTypes = documentTypes?.filter((t) => t.archiveCategory === "KONDISIONAL") || [];
  const profesiTypes = documentTypes?.filter((t) => t.archiveCategory === "PROFESI") || [];

  useEffect(() => {
    if (isOpen) {
      setDocumentTypeId("");
      setIssueDate("");
      setExpiryDate("");
      setFile(null);
      setIsDragging(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedType = documentTypes?.find((t) => t.id === documentTypeId);

  const handleFileSelect = (selectedFile: File | undefined) => {
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Harap pilih file terlebih dahulu");
      return;
    }
    if (!documentTypeId) {
      alert("Harap pilih jenis dokumen");
      return;
    }
    
    onSubmit({
      documentTypeId,
      issueDate: issueDate || undefined,
      expiryDate: selectedType?.requiresExpiryDate ? expiryDate || undefined : undefined,
      file,
      ownerId: "", // Akan di-override oleh backend session
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" />
            Unggah Dokumen Baru
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Dokumen</label>
            <select
              value={documentTypeId}
              onChange={(e) => setDocumentTypeId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              disabled={isLoadingTypes}
            >
              <option value="">-- Pilih Jenis Dokumen --</option>
              {utamaTypes.length > 0 && (
                <optgroup label="Arsip Utama">
                  {utamaTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {kondisionalTypes.length > 0 && (
                <optgroup label="Arsip Kondisional">
                  {kondisionalTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {profesiTypes.length > 0 && (
                <optgroup label="Arsip Profesi">
                  {profesiTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className={selectedType?.requiresExpiryDate ? "grid grid-cols-2 gap-4" : "block"}>
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Terbit (Opsional)</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {selectedType?.requiresExpiryDate && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Masa Berlaku <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File Dokumen</label>
            
            {/* Clickable & Drag-Drop Box */}
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : file
                  ? "border-green-500/50 bg-green-500/5 hover:bg-green-500/10"
                  : "border-input bg-muted/20 hover:bg-muted/40"
              }`}
            >
              <input
                type="file"
                className="sr-only"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                accept={
                  selectedType
                    ? selectedType.allowedFormats
                        .split(",")
                        .map((f) => `.${f.trim()}`)
                        .join(",")
                    : "*"
                }
              />
              
              <div className="space-y-1 text-center pointer-events-none">
                {file ? (
                  <FileCheck className="mx-auto h-12 w-12 text-green-600 animate-bounce" />
                ) : (
                  <UploadCloud className={`mx-auto h-12 w-12 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                )}
                
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <span className="font-semibold text-primary underline underline-offset-2">
                    {file ? "Ganti file" : "Pilih file"}
                  </span>
                  <span className="pl-1">atau seret dan lepas di sini</span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {selectedType ? (
                    <>
                      Format: {selectedType.allowedFormats.toUpperCase()} (Maks{" "}
                      {selectedType.maxSizeMb < 1
                        ? `${Math.round(selectedType.maxSizeMb * 1024)} KB`
                        : `${selectedType.maxSizeMb} MB`}
                      )
                    </>
                  ) : (
                    "Pilih jenis dokumen terlebih dahulu"
                  )}
                </p>
              </div>
            </label>

            {file && (
              <div className="mt-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-between text-sm text-green-700 dark:text-green-400">
                <span className="font-medium truncate max-w-[80%]">
                  📄 {file.name}
                </span>
                <span className="text-xs shrink-0 font-semibold">
                  ({file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || !file || !documentTypeId} className="rounded-xl px-6">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                "Unggah Dokumen"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
