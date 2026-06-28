"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { useLogin } from "../hooks";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("NIP/Email dan Password wajib diisi");
      return;
    }

    loginMutation.mutate(
      { identifier, password },
      {
        onError: (error: any) => {
          setErrorMessage(error.message || "Gagal masuk ke sistem");
        },
      }
    );
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-card border border-border shadow-2xl shadow-primary/5">
      {/* Header Form */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 text-primary-foreground shadow-lg shadow-primary/30">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Masuk ke SMDP Portal</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gunakan NIP atau Email pegawai Anda
        </p>
      </div>

      {/* Alert Error */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm font-medium animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            NIP / Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Contoh: 19900101... atau admin@smdp.local"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              disabled={loginMutation.isPending}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Kata Sandi
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              disabled={loginMutation.isPending}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Memverifikasi...
            </>
          ) : (
            "Masuk Sekarang"
          )}
        </Button>
      </form>
    </div>
  );
}
