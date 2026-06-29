"use client";

import { useUser } from "../hooks";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  UserCircle2,
  Stethoscope,
  Building2,
  Briefcase,
  Award,
  BadgeCheck,
  Shield,
  Mail,
  IdCard,
  User,
  ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface UserDetailViewProps {
  userId: string;
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const { data: profile, isLoading, error } = useUser(userId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-10 h-10 mb-3 animate-spin opacity-50 text-primary" />
        <p className="text-sm font-medium">Memuat profil pegawai...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl text-red-600 max-w-lg mx-auto mt-10">
        <p className="font-semibold">Gagal memuat profil</p>
        <p className="text-sm mt-1 opacity-80">Silakan kembali atau muat ulang halaman.</p>
        <Link href="/users">
          <Button variant="outline" className="mt-4 rounded-xl border-red-500/20 hover:bg-red-500/10 text-red-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
        </Link>
      </div>
    );
  }

  const roleConfig = {
    ADMIN: { label: "Administrator", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
    STAFF: { label: "Staf Verifikator", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    EMPLOYEE: { label: "Pegawai", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  };

  const currentRole = roleConfig[profile.role] || roleConfig.EMPLOYEE;

  return (
    <div className="space-y-5 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        icon={UserCircle2}
        title="Preview Profil Pegawai"
        description="Melihat informasi detail, jabatan, dan biodata dari pegawai bersangkutan."
        action={
          <Link href="/users">
            <Button variant="outline" className="rounded-full px-5 border-border hover:bg-accent font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Compact Profile & Employment Details Card (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* User Summary Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            
            <div className="relative w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-3xl mb-3 shrink-0 border-2 border-primary/20 shadow-inner overflow-hidden">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>

            <h2 className="text-xl font-bold text-foreground line-clamp-1">{profile.name}</h2>
            <span className={`px-2.5 py-0.5 mt-1.5 text-[11px] font-bold rounded-full border ${currentRole.className}`}>
              {currentRole.label}
            </span>

            <div className="w-full pt-4 mt-4 border-t border-border/60 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-accent/30 border border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <IdCard className="w-3.5 h-3.5 text-primary" /> NIP
                </span>
                <span className="font-mono font-bold text-foreground">{profile.employeeId}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-accent/30 border border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium truncate pr-2">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" /> Email
                </span>
                <span className="font-semibold text-foreground truncate max-w-[160px]" title={profile.email}>
                  {profile.email}
                </span>
              </div>
            </div>
          </div>

          {/* Employment Master Details Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Informasi Kepegawaian</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-accent/20 border border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
                  <Stethoscope className="w-3.5 h-3.5 text-primary" /> Profesi
                </span>
                <span className="font-bold text-foreground text-right">
                  {profile.professionGroup?.name || <span className="text-muted-foreground italic font-normal">-</span>}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-accent/20 border border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
                  <Briefcase className="w-3.5 h-3.5 text-primary" /> Jabatan
                </span>
                <span className="font-bold text-foreground text-right">
                  {profile.employeePosition?.name || <span className="text-muted-foreground italic font-normal">-</span>}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-accent/20 border border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
                  <BadgeCheck className="w-3.5 h-3.5 text-primary" /> Status
                </span>
                <span className="font-bold text-foreground text-right">
                  {profile.employmentStatus?.name || <span className="text-muted-foreground italic font-normal">-</span>}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-accent/20 border border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
                  <Award className="w-3.5 h-3.5 text-primary" /> Golongan
                </span>
                <span className="font-bold text-foreground text-right">
                  {profile.employeeGroup?.name || <span className="text-muted-foreground italic font-normal">-</span>}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-accent/20 border border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" /> Pangkat
                </span>
                <span className="font-bold text-foreground text-right">
                  {profile.employeeRank?.name || <span className="text-muted-foreground italic font-normal">-</span>}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-accent/20 border border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> Penempatan
                </span>
                <span className="font-bold text-foreground text-right">
                  {profile.workplace?.name || <span className="text-muted-foreground italic font-normal">-</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Read-Only Biodata */}
        <div className="lg:col-span-8">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm h-full">
            <h3 className="text-base font-extrabold mb-5 flex items-center gap-2 text-foreground">
              <UserCircle2 className="w-4 h-4 text-primary" />
              Biodata Profil
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nama Lengkap</label>
                <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-medium text-foreground text-sm">
                  {profile.name}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Jenis Kelamin</label>
                  <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-medium text-foreground text-sm">
                    {profile.gender === "L" ? "Laki-laki" : profile.gender === "P" ? "Perempuan" : "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Tanggal Lahir</label>
                  <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-medium text-foreground text-sm">
                    {profile.birthDate ? format(new Date(profile.birthDate), "dd MMMM yyyy", { locale: idLocale }) : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
