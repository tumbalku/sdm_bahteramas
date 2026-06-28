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
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-primary" />
        Keamanan Akun
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Ganti kata sandi secara berkala untuk menjaga keamanan akun Anda.
      </p>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium mb-1">Kata Sandi Saat Ini</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Kata Sandi Baru</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
            minLength={8}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Konfirmasi Kata Sandi Baru</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={isPending} variant="secondary" className="rounded-xl px-6 w-full md:w-auto border border-border">
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <KeyRound className="w-4 h-4 mr-2" />
          )}
          Ganti Kata Sandi
        </Button>
      </div>
    </form>
  );
}
