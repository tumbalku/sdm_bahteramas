"use client";

import { useEffect, useState } from "react";
import { UserProfileDto, UpdateProfileInput } from "../types";
import { useUpdateProfile } from "../hooks";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { format } from "date-fns";

interface UpdateProfileFormProps {
  profile: UserProfileDto;
}

export function UpdateProfileForm({ profile }: UpdateProfileFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState(profile.gender || "L");
  const [birthDate, setBirthDate] = useState(
    profile.birthDate ? format(new Date(profile.birthDate), "yyyy-MM-dd") : ""
  );

  useEffect(() => {
    setName(profile.name);
    setGender(profile.gender || "L");
    setBirthDate(profile.birthDate ? format(new Date(profile.birthDate), "yyyy-MM-dd") : "");
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) {
      alert("Nama minimal 3 karakter");
      return;
    }
    
    updateProfile({
      name,
      gender,
      birthDate: birthDate || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        Biodata Profil
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        
        {/* Read-only info fields below for context */}
        <div className="pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
            <span className="block text-xs font-medium text-muted-foreground mb-1">Email Log-in</span>
            <span className="text-sm font-semibold">{profile.email}</span>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
            <span className="block text-xs font-medium text-muted-foreground mb-1">NIP / ID Pegawai</span>
            <span className="text-sm font-mono font-semibold">{profile.employeeId}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={isPending} className="rounded-xl px-6">
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Simpan Biodata
        </Button>
      </div>
    </form>
  );
}
