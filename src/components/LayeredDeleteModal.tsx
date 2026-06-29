"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowRight, ArrowLeft, Trash2, Loader2, CheckCircle2, KeyRound, Lock } from "lucide-react";

interface LayeredDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName: string;
  itemType?: string;
  impactDetails?: string[];
  isLoading?: boolean;
}

export function LayeredDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Penghapusan Permanen",
  itemName,
  itemType = "data",
  impactDetails = [
    "File dan record akan dihapus secara permanen dari basis data dan penyimpanan server.",
    "Tindakan ini tidak dapat dibatalkan atau dikembalikan dengan cara apapun.",
    "Akses publik atau link terkait berkas ini akan langsung terputus.",
  ],
  isLoading = false,
}: LayeredDeleteModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [confirmInput, setConfirmInput] = useState("");
  const [password, setPassword] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmInput("");
      setPassword("");
      setPasswordError(null);
      setIsVerifyingPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatch = confirmInput.trim() === itemName.trim();

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
      setPasswordError(null);
    }
  };

  const handleFinalConfirm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      setPasswordError("Harap masukkan kata sandi akun Anda!");
      return;
    }

    setIsVerifyingPassword(true);
    setPasswordError(null);

    try {
      const res = await fetch("/api/v1/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Kata sandi yang Anda masukkan salah.");
      }

      onConfirm();
    } catch (err: any) {
      setPasswordError(err.message || "Kata sandi yang Anda masukkan salah!");
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {/* Compact Header */}
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4 shrink-0" /> {title} (Tahap {step}/4)
          </DialogTitle>
          <DialogDescription className="text-xs">
            Prosedur konfirmasi 4-layer keamanan untuk mencegah penghapusan ketidaksengajaan.
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: Intent Confirmation */}
        {step === 1 && (
          <div className="space-y-3 py-1 animate-fade-in">
            <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1.5">
              <p className="text-xs text-foreground font-medium">
                Apakah Anda yakin ingin menghapus <span className="font-semibold text-destructive">{itemType}</span> berikut?
              </p>
              <div className="p-2.5 rounded-lg bg-card border border-border font-mono text-xs font-bold text-foreground break-all">
                {itemName}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-lg text-xs h-9">
                <span>Batal</span>
              </Button>
              <Button onClick={handleNext} variant="destructive" size="sm" className="rounded-lg text-xs h-9 flex items-center gap-1.5">
                <span>Lanjut Tinjau Dampak (1/4)</span> <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 2: Impact & Consequences Warning */}
        {step === 2 && (
          <div className="space-y-3 py-1 animate-fade-in">
            <Alert variant="destructive" className="rounded-xl p-3 border-destructive/30 bg-destructive/10">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <div className="space-y-0.5">
                <AlertTitle className="font-bold text-xs">Peringatan Konsekuensi Permanen!</AlertTitle>
                <AlertDescription className="text-[11px] leading-tight">
                  Seluruh berkas fisik dan riwayat verifikasi terkait akan terhapus secara permanen.
                </AlertDescription>
              </div>
            </Alert>

            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Dampak Penghapusan:</h4>
              <ul className="space-y-1 text-xs">
                {impactDetails.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground bg-accent/30 p-2.5 rounded-lg border border-border/50 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1 shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={handleBack} className="rounded-lg text-xs h-9 flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> <span>Kembali</span>
              </Button>
              <Button onClick={handleNext} variant="destructive" size="sm" className="rounded-lg text-xs h-9 flex items-center gap-1.5">
                <span>Lanjut Verifikasi Nama (2/4)</span> <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 3: Text Verification Matching */}
        {step === 3 && (
          <div className="space-y-3 py-1 animate-fade-in">
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Ketik <span className="font-mono font-bold text-destructive select-all bg-destructive/10 px-1.5 py-0.5 rounded text-[11px]">{itemName}</span> untuk mengonfirmasi:
              </p>

              <Input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={`Ketik "${itemName}" di sini...`}
                className="font-mono text-xs h-9 border-destructive/40 focus-visible:ring-destructive/50 rounded-lg w-full"
                autoFocus
              />

              {isMatch && (
                <div className="flex items-center gap-1 text-[11px] text-green-600 font-bold animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Nama Cocok! Lanjut Verifikasi Otentikasi Password.
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" onClick={handleBack} className="rounded-lg text-xs h-9 flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isMatch}
                variant="destructive"
                size="sm"
                className="rounded-lg text-xs h-9 px-4 font-bold flex items-center gap-1.5"
              >
                <span>Lanjut Otentikasi Password (3/4)</span> <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 4: Password Verification Authentication */}
        {step === 4 && (
          <form onSubmit={handleFinalConfirm} className="space-y-3 py-1 animate-fade-in">
            <Alert variant="destructive" className="rounded-xl p-3 border-destructive/30 bg-destructive/10">
              <KeyRound className="w-4 h-4 text-destructive shrink-0" />
              <div className="space-y-0.5">
                <AlertTitle className="font-bold text-xs">Tahap Akhir: Otentikasi Password Pengguna</AlertTitle>
                <AlertDescription className="text-[11px] leading-tight">
                  Ketik kata sandi akun Anda untuk memverifikasi identitas dan mengeksekusi penghapusan permanen.
                </AlertDescription>
              </div>
            </Alert>

            <div className="space-y-2">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ketik kata sandi akun Anda..."
                className="font-mono text-xs h-10 border-destructive/40 focus-visible:ring-destructive/50 rounded-lg w-full"
                autoFocus
              />

              {passwordError && (
                <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-semibold">
                  {passwordError}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={isVerifyingPassword || isLoading}
                className="rounded-lg text-xs h-9 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </Button>
              <Button
                type="submit"
                disabled={!password || isVerifyingPassword || isLoading}
                variant="destructive"
                size="sm"
                className="rounded-lg text-xs h-9 px-4 font-bold"
              >
                {isVerifyingPassword || isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memverifikasi & Menghapus...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>HAPUS PERMANEN SEKARANG</span>
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
