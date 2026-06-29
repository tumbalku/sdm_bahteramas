"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "../hooks";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import {
  UserCircle2,
  ArrowLeft,
  Mail,
  IdCard,
  Briefcase,
  Building2,
  BadgeCheck,
  Stethoscope,
  Award,
  Shield,
  Loader2,
  Phone,
  GraduationCap,
  Calendar,
  Heart,
  Home,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface UserDetailViewProps {
  userId: string;
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const { data: profile, isLoading } = useUser(userId);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in max-w-7xl mx-auto pb-8">
        <CardSkeleton count={3} gridClassName="grid grid-cols-1 md:grid-cols-3 gap-5" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
        <UserCircle2 className="w-16 h-16 text-muted-foreground/40" />
        <p className="text-base font-semibold">Data Pegawai Tidak Ditemukan</p>
        <Link href="/users">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Pegawai
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
    <div className="space-y-5 animate-fade-in max-w-7xl mx-auto pb-8">
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
            {profile.academicDegree && (
              <p className="text-xs text-muted-foreground font-medium">{profile.academicDegree}</p>
            )}
            <span className={`px-2.5 py-0.5 mt-2 text-[11px] font-bold rounded-full border ${currentRole.className}`}>
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
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <IdCard className="w-3.5 h-3.5 text-primary" /> NIK
                </span>
                <span className="font-mono font-bold text-foreground">{profile.nik || "-"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-accent/30 border border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium truncate pr-2">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" /> Email
                </span>
                <span className="font-semibold text-foreground truncate max-w-[160px]" title={profile.email}>
                  {profile.email}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-accent/30 border border-border/50">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium truncate pr-2">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" /> Telepon
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {profile.phone || "-"}
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
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Tanggal Masuk
                </span>
                <span className="font-bold text-foreground text-right">
                  {profile.joinDate ? format(new Date(profile.joinDate), "dd MMM yyyy", { locale: idLocale }) : "-"}
                </span>
              </div>
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
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold pb-3 border-b border-border/60 flex items-center gap-2 text-foreground">
              <UserCircle2 className="w-4 h-4 text-primary" />
              Biodata Lengkap Pegawai
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nama Lengkap</label>
                <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-medium text-foreground text-sm">
                  {profile.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Gelar Akademik</label>
                <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-medium text-foreground text-sm">
                  {profile.academicDegree || "-"}
                </div>
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Agama</label>
                <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-medium text-foreground text-sm">
                  {profile.religion || "-"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Status Pernikahan</label>
                <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-medium text-foreground text-sm">
                  {profile.maritalStatus || "-"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Pendidikan Terakhir</label>
                <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-medium text-foreground text-sm">
                  {profile.lastEducation || "-"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nomor Telepon / WA</label>
                <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-mono font-medium text-foreground text-sm">
                  {profile.phone || "-"}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Alamat Lengkap</label>
                <div className="px-4 py-2.5 bg-accent/20 border border-border/40 rounded-xl font-medium text-foreground text-sm leading-relaxed min-h-[60px]">
                  {profile.address || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
