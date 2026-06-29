"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { PasswordVerificationModal } from "@/components/PasswordVerificationModal";
import { useSettings, useUpdateSettings } from "../hooks";
import {
  Settings,
  Image as ImageIcon,
  ShieldAlert,
  Save,
  Loader2,
  Sliders,
  CheckCircle2,
  HardDrive,
  Clock,
  Info,
  Database,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export function SettingsFormView() {
  const { data: settings = [], isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [formData, setFormData] = useState<Record<string, string>>({
    MAX_AVATAR_UPLOAD_SIZE_KB: "200",
    SECURITY_LOG_RETENTION_DAYS: "30",
  });

  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  useEffect(() => {
    if (settings && settings.length > 0) {
      const initialMap: Record<string, string> = {};
      settings.forEach((item) => {
        initialMap[item.key] = item.value;
      });
      setFormData((prev) => ({ ...prev, ...initialMap }));
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    try {
      const response = await fetch("/api/v1/backup/export");
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message || "Gagal mengunduh backup database");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `smdp_backup_${new Date().toISOString().slice(0, 10)}.sql`;
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/"/g, "");
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("File backup database (.sql) berhasil diunduh!");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mengunduh backup");
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-8">
        <CardSkeleton count={3} gridClassName="grid grid-cols-1 lg:grid-cols-2 gap-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-8">
      <PageHeader
        icon={Settings}
        title="Pengaturan Sistem"
        description="Kelola konfigurasi global aplikasi, batasan berkas unggahan, kebijakan retensi, dan pemeliharaan cadangan database."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Card 1: Unggahan & Media */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      Media & Unggahan Berkas
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Batasan berkas yang diunggah pengguna
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                      Maksimal Ukuran Foto Profil / Avatar
                      <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="50"
                      max="10000"
                      value={formData.MAX_AVATAR_UPLOAD_SIZE_KB || "200"}
                      onChange={(e) => handleChange("MAX_AVATAR_UPLOAD_SIZE_KB", e.target.value)}
                      className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                      required
                    />
                    <span className="absolute right-3.5 px-2 py-0.5 text-xs font-bold text-muted-foreground bg-muted rounded-md border border-border/50">
                      KB
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      Batas maksimal ukuran file foto profil pegawai (Default: 200 KB). Berkas melebihi ukuran ini akan ditolak otomatis.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Perubahan berlaku langsung pada unggahan berikutnya.</span>
            </div>
          </div>

          {/* Card 2: Keamanan & Retensi Logs */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      Keamanan & Audit Logs
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Kebijakan retensi & penyimpanan rekam jejak
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      Masa Simpan Retensi Security Logs
                      <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="3650"
                      value={formData.SECURITY_LOG_RETENTION_DAYS || "30"}
                      onChange={(e) => handleChange("SECURITY_LOG_RETENTION_DAYS", e.target.value)}
                      className="w-full pl-3.5 pr-16 py-2.5 rounded-xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
                      required
                    />
                    <span className="absolute right-3.5 px-2 py-0.5 text-xs font-bold text-muted-foreground bg-muted rounded-md border border-border/50">
                      Hari
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      Seluruh rekam aktivitas audit yang melampaui jumlah hari ini akan dibersihkan secara otomatis oleh sistem.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
              <Sliders className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Otomatisasi pembersihan berjalan saat halaman log diakses.</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pemeliharaan & Backup Database (Full Width) */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 hover:border-border transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Pemeliharaan & Backup Basis Data
                </h3>
                <p className="text-xs text-muted-foreground">
                  Unduh salinan cadangan (*backup dump*) basis data PostgreSQL dalam format SQL (.sql)
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsVerifyModalOpen(true)}
              disabled={isDownloadingBackup}
              variant="outline"
              className="rounded-xl px-5 h-10 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400 shrink-0 font-bold text-xs"
            >
              {isDownloadingBackup ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengunduh SQL...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Unduh Backup SQL (.sql)
                </>
              )}
            </Button>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent/30 p-3 rounded-xl border border-border/50">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Berkas backup mengontain seluruh struktur relasi data dan *record* master kepegawaian, dokumen, pengguna, serta audit log. Berkas `.sql` ini dapat diimpor langsung ke PostgreSQL untuk keperluan pemulihan bencana (*disaster recovery*).
            </p>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-end gap-4 p-4 bg-card border border-border/80 rounded-2xl shadow-sm">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Pastikan memeriksa kembali nilai pengaturan sebelum menyimpan.
          </span>
          <Button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="rounded-xl px-6 py-2.5 shadow-md font-semibold text-sm transition-all hover:shadow-lg"
          >
            {updateSettingsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Password Verification Identity Modal */}
      <PasswordVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSuccess={handleDownloadBackup}
        title="Verifikasi Identitas Unduh Backup"
        actionDescription="mengunduh salinan cadangan basis data (.sql)"
        securityImpacts={[
          "Berkas backup (.sql) mengontain seluruh struktur relasi data dan informasi sensitif kepegawaian.",
          "Verifikasi kata sandi wajib dilakukan untuk memvalidasi bahwa tindakan ini benar-benar diprakarsai oleh Anda.",
          "Rekam jejak otentikasi dan pengunduhan berkas ini akan dicatat permanen dalam Audit Log sistem.",
        ]}
      />
    </div>
  );
}
