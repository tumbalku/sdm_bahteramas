"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, ArrowRight, ArrowLeft, Lock, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface PasswordVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  actionDescription?: string;
  securityImpacts?: string[];
}

export function PasswordVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Verifikasi Identitas Keamanan",
  actionDescription = "mengunduh salinan cadangan basis data (.sql)",
  securityImpacts = [
    "Aksi ini melibatkan unduhan data sensitif sistem dan master kepegawaian.",
    "Verifikasi password diperlukan untuk memastikan tindakan ini benar-benar dilakukan oleh Anda.",
    "Seluruh aktivitas verifikasi keamanan ini akan dicatat permanen pada Audit Log.",
  ],
}: PasswordVerificationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPassword("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    setStep(2);
  };

  const handleBackStep = () => {
    setStep(1);
    setErrorMessage(null);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      setErrorMessage("Harap masukkan kata sandi Anda!");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Verifikasi kata sandi gagal.");
      }

      toast.success("Verifikasi identitas berhasil!");
      onClose();
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Kata sandi yang Anda masukkan salah.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2 text-primary">
            <ShieldAlert className="w-5 h-5 text-primary shrink-0" /> {title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Prosedur verifikasi otentikasi pemilik akun untuk tindakan keamanan tingkat tinggi.
          </DialogDescription>
        </DialogHeader>

        {/* LAYER 1: Intent & Security Impact Notice */}
        {step === 1 && (
          <div className="space-y-3.5 py-1 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
              <p className="text-xs text-foreground font-medium">
                Anda meminta untuk <span className="font-bold text-primary">{actionDescription}</span>.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Untuk alasan keamanan akun, harap konfirmasikan otentikasi identitas Anda sebelum melanjutkan.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-primary" /> Kebijakan Keamanan:
              </h4>
              <ul className="space-y-1 text-xs">
                {securityImpacts.map((impact, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-foreground bg-accent/30 p-2.5 rounded-xl border border-border/50 text-[11px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    <span>{impact}</span>
                  </li>
                ))}
              </ul>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs h-9">
                Batal
              </Button>
              <Button
                onClick={handleNextStep}
                size="sm"
                className="rounded-xl text-xs h-9 flex items-center gap-1.5 shadow-md shadow-primary/20"
              >
                <span>Lanjut Verifikasi Password</span> <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* LAYER 2: Password Authentication Form */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-3.5 py-1 animate-fade-in">
            <Alert className="rounded-2xl p-3 border-primary/30 bg-primary/10">
              <KeyRound className="w-4 h-4 text-primary shrink-0" />
              <div className="space-y-0.5">
                <AlertTitle className="font-bold text-xs text-foreground">Masukkan Kata Sandi Anda</AlertTitle>
                <AlertDescription className="text-[11px] leading-tight text-muted-foreground">
                  Ketikkan password akun Anda yang sedang aktif saat ini untuk memverifikasi identitas.
                </AlertDescription>
              </div>
            </Alert>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik kata sandi Anda..."
                  className="font-mono text-xs h-10 px-3.5 rounded-xl border-input focus-visible:ring-primary/50 w-full"
                  autoFocus
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-semibold">
                  {errorMessage}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBackStep}
                disabled={isVerifying}
                className="rounded-xl text-xs h-9 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </Button>
              <Button
                type="submit"
                disabled={!password || isVerifying}
                size="sm"
                className="rounded-xl text-xs h-9 px-4 font-bold shadow-md shadow-primary/20"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memverifikasi...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIKASI & UNDUH BAKUP</span>
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
