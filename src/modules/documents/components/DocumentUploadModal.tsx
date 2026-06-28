"use client";

import { useEffect, useState } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { X, Loader2, UploadCloud } from "lucide-react";
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
  const { data: documentTypes, isLoading: isLoadingTypes } = useDocumentTypes({
    category: activeCategory,
  });

  const [documentTypeId, setDocumentTypeId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDocumentTypeId("");
      setIssueDate("");
      setExpiryDate("");
      setFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedType = documentTypes?.find((t) => t.id === documentTypeId);

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
      expiryDate: expiryDate || undefined,
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
              {documentTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Terbit (Opsional)</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Masa Berlaku {selectedType?.requiresExpiryDate && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required={selectedType?.requiresExpiryDate}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File Dokumen</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-input border-dashed rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="flex text-sm text-muted-foreground">
                  <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                    <span>Pilih file</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                      accept={
                        selectedType
                          ? selectedType.allowedFormats
                              .split(",")
                              .map((f) => `.${f.trim()}`)
                              .join(",")
                          : "*"
                      }
                    />
                  </label>
                  <p className="pl-1">atau seret dan lepas</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedType ? (
                    <>Format: {selectedType.allowedFormats} (Maks {selectedType.maxSizeMb}MB)</>
                  ) : (
                    "Pilih jenis dokumen terlebih dahulu"
                  )}
                </p>
              </div>
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600 font-medium break-all">
                File terpilih: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
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
