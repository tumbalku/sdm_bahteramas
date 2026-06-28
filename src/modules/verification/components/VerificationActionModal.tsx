"use client";

import { useState, useEffect } from "react";
import { DocumentRecordDto } from "@/modules/documents/types";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, XCircle, Loader2, Download, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface VerificationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRecordDto | null;
  onApprove: (docId: string) => void;
  onReject: (docId: string, reason: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export function VerificationActionModal({
  isOpen,
  onClose,
  document,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: VerificationActionModalProps) {
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsRejectMode(false);
      setRejectReason("");
    }
  }, [isOpen]);

  if (!isOpen || !document) return null;

  const fileUrl = `/api/v1/documents/download?file=${encodeURIComponent(document.filePath)}`;
  const isPdf = document.filePath.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(document.filePath);
  
  const isLoading = isApproving || isRejecting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col md:flex-row bg-card rounded-3xl overflow-hidden shadow-2xl border border-border">
        
        {/* Left Side: File Preview */}
        <div className="flex-1 bg-muted/30 border-b md:border-b-0 md:border-r border-border relative flex flex-col">
          <div className="p-4 border-b border-border bg-background flex justify-between items-center">
            <h3 className="font-semibold text-sm">Pratinjau Dokumen</h3>
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs flex items-center text-primary hover:underline font-medium"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Buka di Tab Baru
            </a>
          </div>
          <div className="flex-1 w-full h-full p-4 overflow-auto flex items-center justify-center relative">
             {isPdf ? (
                <iframe 
                  src={fileUrl} 
                  className="w-full h-full rounded-xl border border-border shadow-sm"
                  title={document.fileName}
                />
             ) : isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={fileUrl} 
                  alt={document.fileName}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-sm"
                />
             ) : (
                <div className="text-center p-8 bg-background rounded-xl border border-border">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <p className="font-medium">Pratinjau tidak tersedia untuk format ini.</p>
                  <a href={fileUrl} className="text-primary hover:underline mt-2 inline-block">
                    Unduh file
                  </a>
                </div>
             )}
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-[400px] flex flex-col bg-background h-full">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-lg">Detail Verifikasi</h3>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Informasi Pegawai
              </h4>
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div>
                  <span className="block text-xs text-muted-foreground mb-0.5">Nama Lengkap</span>
                  <span className="font-semibold">{document.owner?.name}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-0.5">NIP</span>
                  <span className="font-mono text-sm">{document.owner?.employeeId}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Informasi Dokumen
              </h4>
              <div className="space-y-4 text-sm">
                <div className="border-b border-border pb-2">
                  <span className="block text-muted-foreground">Jenis Dokumen</span>
                  <span className="font-medium text-base">{document.documentType?.name}</span>
                </div>
                <div className="border-b border-border pb-2">
                  <span className="block text-muted-foreground">Kategori Arsip</span>
                  <span className="font-medium">{document.documentType?.archiveCategory}</span>
                </div>
                <div className="border-b border-border pb-2">
                  <span className="block text-muted-foreground">Tanggal Unggah</span>
                  <span className="font-medium">
                    {format(new Date(document.uploadedAt), "dd MMMM yyyy, HH:mm", { locale: id })}
                  </span>
                </div>
                {document.issueDate && (
                  <div className="border-b border-border pb-2">
                    <span className="block text-muted-foreground">Tanggal Terbit</span>
                    <span className="font-medium">
                      {format(new Date(document.issueDate), "dd MMMM yyyy", { locale: id })}
                    </span>
                  </div>
                )}
                {document.expiryDate && (
                  <div className="pb-2">
                    <span className="block text-muted-foreground">Masa Berlaku</span>
                    <span className="font-medium text-amber-600">
                      {format(new Date(document.expiryDate), "dd MMMM yyyy", { locale: id })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Reject Form Animation Area */}
            {isRejectMode && (
              <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 animate-fade-in mt-4">
                <label className="block text-sm font-medium text-red-600 mb-2">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Misal: Dokumen buram, tanggal kedaluwarsa tidak sesuai, dll."
                  className="w-full h-24 p-3 rounded-lg border border-red-500/30 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-muted/10 space-y-3">
            {isRejectMode ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl"
                  onClick={() => setIsRejectMode(false)}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    if (rejectReason.length < 5) {
                      alert("Alasan penolakan minimal 5 karakter.");
                      return;
                    }
                    onReject(document.id, rejectReason);
                  }}
                  disabled={isLoading}
                >
                  {isRejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Konfirmasi Tolak
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1 rounded-xl border-red-500/30 text-red-600 hover:bg-red-500 hover:text-white"
                  onClick={() => setIsRejectMode(true)}
                  disabled={isLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
                <Button 
                  className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onApprove(document.id)}
                  disabled={isLoading}
                >
                  {isApproving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Setujui
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
