"use client";

import { useProfile, useUploadAvatar } from "../hooks";
import { UpdateProfileForm } from "./UpdateProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useRef } from "react";
import Image from "next/image";
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
  Camera,
  Phone,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export function ProfileView() {
  const { data: profile, isLoading, error } = useProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in max-w-7xl mx-auto pb-8">
        <CardSkeleton count={3} gridClassName="grid grid-cols-1 md:grid-cols-3 gap-5" />
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
        title="Profil Saya"
        description="Kelola informasi kepegawaian, biodata pribadi, dan keamanan akun Anda."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Profile & Employment Details Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* User Summary Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            
            <div 
              className="relative w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-3xl mb-3 shrink-0 border-2 border-primary/20 shadow-inner overflow-hidden cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
              
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/webp" 
              onChange={handleFileChange}
            />

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
              {profile.hasTmt && (
                <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-accent/20 border border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Masa Kontrak
                  </span>
                  <span className="font-bold text-foreground text-right">
                    {profile.tmtStartDate ? format(new Date(profile.tmtStartDate), "dd MMM yyyy", { locale: idLocale }) : "Tidak ditentukan"}
                    {" - "}
                    {profile.tmtEndDate ? format(new Date(profile.tmtEndDate), "dd MMM yyyy", { locale: idLocale }) : "Tidak ditentukan"}
                  </span>
                </div>
              )}
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

        {/* Right Column: Update Biodata & Security Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <UpdateProfileForm profile={profile} />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
