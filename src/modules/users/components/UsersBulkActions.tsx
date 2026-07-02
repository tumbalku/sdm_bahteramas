"use client";

import { useRef, useState } from "react";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useDownloadUsersImportTemplate, useExportUsers, useImportUsers } from "../hooks";
import { ImportUsersResult, UserFilter } from "../types";

interface UsersBulkActionsProps {
  filters: UserFilter;
}

export function UsersBulkActions({ filters }: UsersBulkActionsProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportUsersResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportUsers();
  const templateMutation = useDownloadUsersImportTemplate();
  const exportMutation = useExportUsers(filters);

  const handleDownloadTemplate = () => {
    templateMutation.mutate(undefined, {
      onError: (error: any) => toast.error(error.message || "Gagal mengunduh template"),
    });
  };

  const handleExport = () => {
    exportMutation.mutate(undefined, {
      onError: (error: any) => toast.error(error.message || "Gagal mengekspor data pegawai"),
    });
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error("Pilih file CSV terlebih dahulu");
      return;
    }

    setImportResult(null);
    importMutation.mutate(selectedFile, {
      onSuccess: (result) => {
        if (!result) return;
        setImportResult(result);
        if (result.errorCount > 0) {
          toast.error("Import belum disimpan karena masih ada error validasi");
          return;
        }
        toast.success(`${result.createdCount} pegawai berhasil diimport`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (error: any) => toast.error(error.message || "Gagal mengimport pegawai"),
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setImportResult(null);
          setIsImportOpen(true);
        }}
        className="rounded-full px-4 border-border"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2 text-primary" />
        Import
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleExport}
        disabled={exportMutation.isPending}
        className="rounded-full px-4 border-border"
      >
        <span className="relative mr-2 inline-flex h-4 w-4 items-center justify-center">
          <FileDown className={`absolute h-4 w-4 text-primary transition-opacity ${exportMutation.isPending ? "opacity-0" : "opacity-100"}`} />
          <Loader2 className={`absolute h-4 w-4 animate-spin transition-opacity ${exportMutation.isPending ? "opacity-100" : "opacity-0"}`} />
        </span>
        Export
      </Button>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Pegawai dari CSV</DialogTitle>
            <DialogDescription>
              Upload file CSV sesuai template. Jika ada satu baris invalid, seluruh data tidak akan disimpan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-accent/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">Gunakan template resmi</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Download template CSV terlebih dahulu, isi data pegawai sesuai kolom yang tersedia,
                    lalu upload kembali file tersebut. Kolom master data harus memakai nama yang sudah ada di sistem.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  disabled={templateMutation.isPending}
                  className="rounded-xl border-border sm:w-auto"
                >
                  <span className="relative mr-2 inline-flex h-4 w-4 items-center justify-center">
                    <FileDown className={`absolute h-4 w-4 text-primary transition-opacity ${templateMutation.isPending ? "opacity-0" : "opacity-100"}`} />
                    <Loader2 className={`absolute h-4 w-4 animate-spin transition-opacity ${templateMutation.isPending ? "opacity-100" : "opacity-0"}`} />
                  </span>
                  Download Template
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border bg-accent/20 p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  setImportResult(null);
                  setSelectedFile(event.target.files?.[0] || null);
                }}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/80"
              />
              {selectedFile && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{selectedFile.name}</Badge>
                  <span>{Math.max(1, Math.round(selectedFile.size / 1024))} KB</span>
                </div>
              )}
            </div>

            {importResult && (
              <Alert variant={importResult.errorCount > 0 ? "destructive" : "info"}>
                <AlertTitle>
                  {importResult.errorCount > 0
                    ? `${importResult.errorCount} error validasi ditemukan`
                    : "Import berhasil"}
                </AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      Total baris: {importResult.totalRows} | Valid: {importResult.validRows} | Dibuat:{" "}
                      {importResult.createdCount}
                    </p>
                    {importResult.errors.length > 0 && (
                      <div className="max-h-56 overflow-y-auto rounded-xl border border-border/60 bg-background/60 p-2">
                        <ul className="space-y-1">
                          {importResult.errors.slice(0, 30).map((error, index) => (
                            <li key={`${error.row}-${error.field || "row"}-${index}`}>
                              Baris {error.row}
                              {error.field ? ` (${error.field})` : ""}: {error.message}
                            </li>
                          ))}
                        </ul>
                        {importResult.errors.length > 30 && (
                          <p className="mt-2 font-semibold">
                            +{importResult.errors.length - 30} error lainnya
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportOpen(false)}
              className="rounded-xl"
            >
              Tutup
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={importMutation.isPending || !selectedFile}
              className="rounded-xl px-5"
            >
              <span className="relative mr-2 inline-flex h-4 w-4 items-center justify-center">
                <Loader2 className={`absolute h-4 w-4 animate-spin transition-opacity ${importMutation.isPending ? "opacity-100" : "opacity-0"}`} />
              </span>
              Upload CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
