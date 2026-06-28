"use client";

import { useProfile } from "../hooks";
import { UpdateProfileForm } from "./UpdateProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { Loader2, UserCircle2 } from "lucide-react";

export function ProfileView() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-12 h-12 mb-4 animate-spin opacity-50 text-primary" />
        <p>Memuat profil pengguna...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl text-red-600 max-w-lg mx-auto mt-10">
        <p className="font-semibold">Gagal memuat profil</p>
        <p className="text-sm mt-1 opacity-80">Silakan muat ulang halaman ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
          <UserCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Profil Pengguna</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Kelola data diri dan keamanan akun Anda
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
              {profile.role}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="lg:col-span-1">
          <UpdateProfileForm profile={profile} />
        </div>
        <div className="lg:col-span-1">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
