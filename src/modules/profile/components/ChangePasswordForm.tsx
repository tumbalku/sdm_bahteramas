"use client";

import { useState } from "react";
import { useChangePassword } from "../hooks";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function ChangePasswordForm() {
  const { mutate: changePassword, isPending } = useChangePassword();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast.error("Kata sandi baru minimal 8 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }
    
    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-extrabold mb-1 flex items-center gap-2 text-foreground">
        <KeyRound className="w-4 h-4 text-primary" />
        Keamanan Akun
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Ganti kata sandi secara berkala untuk menjaga keamanan akun.
      </p>

      <div className="space-y-3 flex-1 text-xs md:text-sm">
        <div>
          <label className="block font-semibold mb-1 text-foreground">Kata Sandi Saat Ini</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-foreground">Kata Sandi Baru</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            required
            minLength={8}
          />
        </div>
        
        <div>
          <label className="block font-semibold mb-1 text-foreground">Konfirmasi Kata Sandi Baru</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end pt-3 border-t border-border/40">
        <Button type="submit" disabled={isPending} variant="secondary" className="rounded-xl px-5 h-9 text-xs font-bold w-full md:w-auto border border-border">
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <KeyRound className="w-3.5 h-3.5 mr-1.5" />
          )}
          Ganti Kata Sandi
        </Button>
      </div>
    </form>
  );
}
