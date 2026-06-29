"use client";

import { useEffect, useState, DragEvent } from "react";
import { DocumentArchiveCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
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
  const { data: documentTypes, isLoading: isLoadingTypes } = useDocumentTypes({ forUser: true });
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDocumentTypeId("");
      setFile(null);
      setExpiryDate("");
      setNotes("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentTypeId) return;
    onSubmit({
      ownerId: "",
      documentTypeId,
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
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (validTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
      } else {
        alert("File harus berformat PDF, JPG, atau PNG!");
      }
    }
  };

  const currentCategoryTypes = documentTypes?.filter(
    (type) => type.archiveCategory === activeCategory
  ) || [];

  const optionItems = currentCategoryTypes.map((type) => ({
    value: type.id,
    label: `${type.code} - ${type.name}`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" />
            Unggah Dokumen
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
              onChange={(e) => setDocumentTypeId(e.target.value)}
              disabled={isLoadingTypes}
              options={optionItems}
              placeholder="-- Pilih Jenis Dokumen --"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File Dokumen (PDF, JPG, PNG)</label>
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
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
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
                      const selectedType = documentTypes?.find((dt) => dt.id === documentTypeId);
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

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Kedaluwarsa (Opsional)</label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catatan Tambahan (Opsional)</label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan keterangan jika ada..."
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
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
                "Unggah"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
