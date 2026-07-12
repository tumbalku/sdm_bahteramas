"use client";

import { useEffect, useState } from "react";
import { UserProfileDto } from "../types";
import { useUpdateProfile } from "../hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form";
import { Loader2, Save, UserCircle2 } from "lucide-react";
import { format } from "date-fns";
import {
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  GENDER_OPTIONS,
  EDUCATION_OPTIONS,
} from "@/lib/constants";

interface UpdateProfileFormProps {
  profile: UserProfileDto;
}

export function UpdateProfileForm({ profile }: UpdateProfileFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const [name, setName] = useState(profile.name);
  const [nik, setNik] = useState(profile.nik || "");
  const [gender, setGender] = useState(profile.gender || "L");
  const [birthPlace, setBirthPlace] = useState(profile.birthPlace || "");
  const [birthDate, setBirthDate] = useState(
    profile.birthDate ? format(new Date(profile.birthDate), "yyyy-MM-dd") : ""
  );
  const [academicDegree, setAcademicDegree] = useState(profile.academicDegree || "");
  const [lastEducation, setLastEducation] = useState(profile.lastEducation || "");
  const [religion, setReligion] = useState(profile.religion || "");
  const [maritalStatus, setMaritalStatus] = useState(profile.maritalStatus || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [address, setAddress] = useState(profile.address || "");

  useEffect(() => {
    setName(profile.name);
    setNik(profile.nik || "");
    setGender(profile.gender || "L");
    setBirthPlace(profile.birthPlace || "");
    setBirthDate(profile.birthDate ? format(new Date(profile.birthDate), "yyyy-MM-dd") : "");
    setAcademicDegree(profile.academicDegree || "");
    setLastEducation(profile.lastEducation || "");
    setReligion(profile.religion || "");
    setMaritalStatus(profile.maritalStatus || "");
    setPhone(profile.phone || "");
    setAddress(profile.address || "");
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) {
      alert("Nama minimal 3 karakter");
      return;
    }
    
    updateProfile({
      name,
      nik: nik || null,
      gender,
      birthPlace: birthPlace || null,
      birthDate: birthDate || null,
      academicDegree: academicDegree || null,
      lastEducation: lastEducation || null,
      religion: religion || null,
      maritalStatus: maritalStatus || null,
      phone: phone || null,
      address: address || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-extrabold mb-4 pb-2 border-b border-border/60 flex items-center gap-2 text-foreground">
        <UserCircle2 className="w-4 h-4 text-primary" />
        Biodata
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 text-xs md:text-sm">
        <FormField label="Nama Lengkap" required>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 text-xs md:text-sm"
            required
          />
        </FormField>

        <FormField label="NIK (Nomor Induk Kependudukan)">
          <Input
            type="text"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            placeholder="16 Digit NIK KTP..."
            className="h-10 text-xs md:text-sm font-mono"
          />
        </FormField>

        <FormField label="Gelar Akademik">
          <Input
            type="text"
            value={academicDegree}
            onChange={(e) => setAcademicDegree(e.target.value)}
            placeholder="Contoh: S.Ked, Sp.B"
            className="h-10 text-xs md:text-sm"
          />
        </FormField>

        <FormField label="Jenis Kelamin">
          <Select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={GENDER_OPTIONS}
            className="h-10 text-xs md:text-sm"
          />
        </FormField>

        <FormField label="Tempat Lahir">
          <Input
            type="text"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="Contoh: Kendari"
            className="h-10 text-xs md:text-sm"
          />
        </FormField>

        <FormField label="Tanggal Lahir">
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="h-10 text-xs md:text-sm"
          />
        </FormField>

        <FormField label="Agama">
          <Select
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            options={RELIGION_OPTIONS}
            placeholder="-- Pilih Agama --"
            className="h-10 text-xs md:text-sm"
          />
        </FormField>

        <FormField label="Status Pernikahan">
          <Select
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            options={MARITAL_STATUS_OPTIONS}
            placeholder="-- Pilih Status Pernikahan --"
            className="h-10 text-xs md:text-sm"
          />
        </FormField>

        <FormField label="Pendidikan Terakhir">
          <Select
            value={lastEducation}
            onChange={(e) => setLastEducation(e.target.value)}
            options={EDUCATION_OPTIONS}
            placeholder="-- Pilih Pendidikan --"
            className="h-10 text-xs md:text-sm"
          />
        </FormField>

        <FormField label="Nomor Telepon / WhatsApp">
          <Input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="081234567890"
            className="h-10 text-xs md:text-sm font-mono"
          />
        </FormField>

        <FormField label="Alamat Lengkap Tempat Tinggal" className="md:col-span-2">
          <Textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten..."
            className="text-xs md:text-sm"
          />
        </FormField>
      </div>

      <div className="mt-5 flex justify-end pt-3 border-t border-border/40">
        <Button type="submit" disabled={isPending} className="rounded-xl px-5 h-9 text-xs font-bold w-full md:w-auto">
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Simpan Profil
        </Button>
      </div>
    </form>
  );
}
