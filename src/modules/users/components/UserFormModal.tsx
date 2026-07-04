"use client";

import { useEffect, useState } from "react";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form";
import { X, Loader2 } from "lucide-react";
import { CreateUserInput, UserRecord } from "../types";
import { format } from "date-fns";
import {
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  GENDER_OPTIONS,
  EDUCATION_OPTIONS,
} from "@/lib/constants";

const ROLE_OPTIONS = [
  { value: "EMPLOYEE", label: "EMPLOYEE (Pegawai)" },
  { value: "STAFF", label: "STAFF (Verifikator)" },
  { value: "ADMIN", label: "ADMIN (Administrator)" },
];

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserInput) => void;
  isLoading: boolean;
  initialData?: UserRecord | null;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: UserFormModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [nik, setNik] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [gender, setGender] = useState("L");
  const [birthDate, setBirthDate] = useState("");
  const [academicDegree, setAcademicDegree] = useState("");
  const [lastEducation, setLastEducation] = useState("");
  const [religion, setReligion] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hasTmt, setHasTmt] = useState(false);
  const [tmtStartDate, setTmtStartDate] = useState("");
  const [tmtEndDate, setTmtEndDate] = useState("");

  useEffect(() => {
    if (initialData) {
      setEmployeeId(initialData.employeeId);
      setNik(initialData.nik || "");
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
      setGender(initialData.gender || "L");
      setBirthDate(initialData.birthDate ? format(new Date(initialData.birthDate), "yyyy-MM-dd") : "");
      setAcademicDegree(initialData.academicDegree || "");
      setLastEducation(initialData.lastEducation || "");
      setReligion(initialData.religion || "");
      setMaritalStatus(initialData.maritalStatus || "");
      setPhone(initialData.phone || "");
      setAddress(initialData.address || "");
      setHasTmt(Boolean(initialData.hasTmt));
      setTmtStartDate(initialData.tmtStartDate ? format(new Date(initialData.tmtStartDate), "yyyy-MM-dd") : "");
      setTmtEndDate(initialData.tmtEndDate ? format(new Date(initialData.tmtEndDate), "yyyy-MM-dd") : "");
      setPassword("");
    } else {
      setEmployeeId("");
      setNik("");
      setName("");
      setEmail("");
      setPassword("");
      setRole("EMPLOYEE");
      setGender("L");
      setBirthDate("");
      setAcademicDegree("");
      setLastEducation("");
      setReligion("");
      setMaritalStatus("");
      setPhone("");
      setAddress("");
      setHasTmt(false);
      setTmtStartDate("");
      setTmtEndDate("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateUserInput = {
      employeeId,
      nik: nik || undefined,
      name,
      email,
      role,
      gender,
      birthDate: birthDate || undefined,
      academicDegree: academicDegree || undefined,
      lastEducation: lastEducation || undefined,
      religion: religion || undefined,
      maritalStatus: maritalStatus || undefined,
      phone: phone || undefined,
      address: address || undefined,
      hasTmt,
      tmtStartDate: hasTmt ? tmtStartDate || null : null,
      tmtEndDate: hasTmt ? tmtEndDate || null : null,
    };
    if (password) {
      data.password = password;
    } else if (!initialData) {
      data.password = "Pegawai123!";
    }
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="font-bold text-lg text-foreground">
            {initialData ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="NIP / NIK" required>
              <Input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Contoh: 19900101..."
                className="font-mono"
                required
              />
            </FormField>
            <FormField label="NIK KTP (16 Digit)">
              <Input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 Digit NIK..."
                className="font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nama Lengkap" required>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap..."
                required
              />
            </FormField>
            <FormField label="Role Sistem">
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                options={ROLE_OPTIONS}
                className="font-semibold"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email Log-in" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pegawai@domain.com"
                required
              />
            </FormField>
            <FormField label="Gelar Akademik">
              <Input
                type="text"
                value={academicDegree}
                onChange={(e) => setAcademicDegree(e.target.value)}
                placeholder="Contoh: S.Ked, Sp.B"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Jenis Kelamin">
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={GENDER_OPTIONS}
              />
            </FormField>
            <FormField label="Agama">
              <Select
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                options={RELIGION_OPTIONS}
                placeholder="-- Pilih Agama --"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status Pernikahan">
              <Select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                options={MARITAL_STATUS_OPTIONS}
                placeholder="-- Pilih Status --"
              />
            </FormField>
            <FormField label="Pendidikan Terakhir">
              <Select
                value={lastEducation}
                onChange={(e) => setLastEducation(e.target.value)}
                options={EDUCATION_OPTIONS}
                placeholder="-- Pilih Pendidikan --"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tanggal Lahir">
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </FormField>
            <FormField label="Nomor Telepon">
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="font-mono"
              />
            </FormField>
          </div>

          <div>
            <FormField label={initialData ? "Sandi Baru (Opsional)" : "Kata Sandi"}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={initialData ? "Biarkan kosong jika tidak diubah" : "Default: Pegawai123!"}
              />
            </FormField>
          </div>

          <FormField label="Alamat Lengkap">
            <Textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat domisili lengkap..."
            />
          </FormField>

          <div className="rounded-xl border border-border/60 bg-accent/20 p-4 space-y-4">
            <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={hasTmt}
                onChange={(e) => {
                  setHasTmt(e.target.checked);
                  if (!e.target.checked) {
                    setTmtStartDate("");
                    setTmtEndDate("");
                  }
                }}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Pegawai memiliki data TMT
            </label>

            {hasTmt && (
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Mulai TMT / Kontrak">
                  <Input
                    type="date"
                    value={tmtStartDate}
                    onChange={(e) => setTmtStartDate(e.target.value)}
                  />
                </FormField>
                <FormField label="Akhir TMT / Kontrak (Opsional)">
                  <Input
                    type="date"
                    value={tmtEndDate}
                    onChange={(e) => setTmtEndDate(e.target.value)}
                  />
                </FormField>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl px-6">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Pegawai"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
