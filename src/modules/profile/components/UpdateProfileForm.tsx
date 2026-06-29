"use client";

import { useEffect, useState } from "react";
import { UserProfileDto, UpdateProfileInput } from "../types";
import { useUpdateProfile } from "../hooks";
import { Button } from "@/components/ui/button";
import { Loader2, Save, UserCircle2 } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-extrabold mb-3 flex items-center gap-2 text-foreground">
        <UserCircle2 className="w-4 h-4 text-primary" />
        Biodata Profil
      </h3>

      <div className="space-y-3 flex-1 text-xs md:text-sm">
        <div>
          <label className="block font-semibold mb-1 text-foreground">Nama Lengkap <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 text-foreground">Jenis Kelamin</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer font-medium"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-foreground">Tanggal Lahir</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end pt-3 border-t border-border/40">
        <Button type="submit" disabled={isPending} className="rounded-xl px-5 h-9 text-xs font-bold w-full md:w-auto">
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Simpan Biodata
        </Button>
      </div>
    </form>
  );
}
