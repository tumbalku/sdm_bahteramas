"use client";

import { useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  UserPlus,
  ArrowLeft,
  Save,
  User,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { useCreateUser, useUpdateUser, useUser, useMasterCategories } from "../hooks";
import { CreateUserInput, UserFormState } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  GENDER_OPTIONS,
  EDUCATION_OPTIONS,
} from "@/lib/constants";

const ROLE_OPTIONS = [
  { value: "EMPLOYEE", label: "Karyawan" },
  { value: "STAFF", label: "Staf Kepegawaian" },
  { value: "ADMIN", label: "Admin" },
];

const USER_FORM_INITIAL_STATE: UserFormState = {
  employeeId: "",
  nik: "",
  name: "",
  email: "",
  password: "",
  role: "EMPLOYEE",
  gender: "L",
  birthPlace: "",
  birthDate: "",
  academicDegree: "",
  lastEducation: "",
  religion: "",
  maritalStatus: "",
  phone: "",
  address: "",
  joinDate: "",
  hasTmt: false,
  tmtStartDate: "",
  tmtEndDate: "",
  employmentStatusId: "",
  employeeGroupId: "",
  professionGroupId: "",
  employeePositionId: "",
  employeeRankId: "",
  workplaceId: "",
  hasOldEmployeeId: false,
  oldEmployeeId: "",
};

function formReducer(state: UserFormState, patch: Partial<UserFormState>): UserFormState {
  return { ...state, ...patch };
}

function mapUserToFormState(user: NonNullable<ReturnType<typeof useUser>["data"]>): UserFormState {
  return {
    employeeId: user.employeeId || "",
    nik: user.nik || "",
    name: user.name || "",
    email: user.email || "",
    password: "",
    role: user.role || "EMPLOYEE",
    gender: user.gender || "L",
    birthPlace: user.birthPlace || "",
    birthDate: user.birthDate ? format(new Date(user.birthDate), "yyyy-MM-dd") : "",
    academicDegree: user.academicDegree || "",
    lastEducation: user.lastEducation || "",
    religion: user.religion || "",
    maritalStatus: user.maritalStatus || "",
    phone: user.phone || "",
    address: user.address || "",
    joinDate: user.joinDate ? format(new Date(user.joinDate), "yyyy-MM-dd") : "",
    hasTmt: Boolean(user.hasTmt),
    tmtStartDate: user.tmtStartDate ? format(new Date(user.tmtStartDate), "yyyy-MM-dd") : "",
    tmtEndDate: user.tmtEndDate ? format(new Date(user.tmtEndDate), "yyyy-MM-dd") : "",
    employmentStatusId: user.employmentStatus?.id || "",
    employeeGroupId: user.employeeGroup?.id || "",
    professionGroupId: user.professionGroup?.id || "",
    employeePositionId: user.employeePosition?.id || "",
    employeeRankId: user.employeeRank?.id || "",
    workplaceId: user.workplace?.id || "",
    hasOldEmployeeId: Boolean(user.hasOldEmployeeId),
    oldEmployeeId: user.oldEmployeeId || "",
  };
}

interface UserFormViewProps {
  userId?: string;
}

export function UserFormView({ userId }: UserFormViewProps) {
  const router = useRouter();
  const isEditMode = Boolean(userId);

  const { data: existingUser, isLoading: isLoadingUser } = useUser(userId || "");
  const { data: categories, isLoading: isLoadingCategories } = useMasterCategories();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [form, dispatch] = useReducer(formReducer, USER_FORM_INITIAL_STATE);

  // Isi form dari data server saat mode edit
  useEffect(() => {
    if (isEditMode && existingUser) {
      dispatch(mapUserToFormState(existingUser));
    }
  }, [isEditMode, existingUser]);

  const availableGroups =
    categories?.employmentStatuses.find((s) => s.id === form.employmentStatusId)?.employeeGroups || [];

  const availablePositions =
    categories?.professionGroups.find((p) => p.id === form.professionGroupId)?.employeePositions || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.employeeId || !form.name || !form.email) {
      toast.error("NIP, Nama, dan Email wajib diisi!");
      return;
    }

    const payload: any = {
      employeeId: form.employeeId,
      nik: form.nik || null,
      name: form.name,
      email: form.email,
      role: form.role,
      gender: form.gender,
      birthPlace: form.birthPlace || null,
      birthDate: form.birthDate || null,
      academicDegree: form.academicDegree || null,
      lastEducation: form.lastEducation || null,
      religion: form.religion || null,
      maritalStatus: form.maritalStatus || null,
      phone: form.phone || null,
      address: form.address || null,
      joinDate: form.joinDate || null,
      hasTmt: form.hasTmt,
      tmtStartDate: form.hasTmt ? form.tmtStartDate || null : null,
      tmtEndDate: form.hasTmt ? form.tmtEndDate || null : null,
      employmentStatusId: form.employmentStatusId || null,
      employeeGroupId: form.employeeGroupId || null,
      professionGroupId: form.professionGroupId || null,
      employeePositionId: form.employeePositionId || null,
      employeeRankId: form.employeeRankId || null,
      workplaceId: form.workplaceId || null,
      hasOldEmployeeId: form.hasOldEmployeeId,
      oldEmployeeId: form.hasOldEmployeeId ? form.oldEmployeeId || null : null,
    };

    if (form.password) {
      payload.password = form.password;
    }

    if (isEditMode && userId) {
      updateMutation.mutate(
        { id: userId, input: payload },
        {
          onSuccess: () => {
            router.push("/users");
          },
        }
      );
    } else {
      if (!form.password) {
        payload.password = "Pegawai123!";
      }
      createMutation.mutate(payload as CreateUserInput, {
        onSuccess: () => {
          router.push("/users");
        },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingUser) {
    return (
      <div className="page-container space-y-6 animate-fade-in max-w-5xl pb-8">
        <CardSkeleton count={3} gridClassName="grid grid-cols-1 gap-6" />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6 animate-fade-in pb-8">
      <PageHeader
        icon={UserPlus}
        title={isEditMode ? "Edit Pegawai" : "Tambah Pegawai"}
        description={
          isEditMode
            ? "Perbarui informasi profil, biodata, serta kualifikasi kepegawaian pengguna"
            : "Tambahkan akun dan data kualifikasi pegawai baru ke dalam sistem"
        }
        action={
          <Link href="/users">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl">
        {/* Section 1: Kredensial Akses & Akun */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">1. Kredensial Akses & Identitas Otentikasi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="NIP / NRK (Nomor Induk Pegawai)" required>
              <Input
                type="text"
                value={form.employeeId}
                onChange={(e) => dispatch({ employeeId: e.target.value })}
                placeholder="Contoh: 199001012015011001"
                className="font-mono"
                required
              />
            </FormField>

            <FormField label="NIK (Nomor Induk Kependudukan / KTP)">
              <Input
                type="text"
                value={form.nik}
                onChange={(e) => dispatch({ nik: e.target.value })}
                placeholder="16 Digit NIK KTP..."
                className="font-mono"
              />
            </FormField>

            <div className="md:col-span-2 rounded-xl border border-border/60 bg-accent/20 p-4 space-y-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasOldEmployeeId}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      dispatch({ hasOldEmployeeId: false, oldEmployeeId: "" });
                    } else {
                      dispatch({ hasOldEmployeeId: true });
                    }
                  }}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Pegawai memiliki NIP Lama
              </label>

              {form.hasOldEmployeeId && (
                <FormField label="NIP Lama" required>
                  <Input
                    type="text"
                    value={form.oldEmployeeId}
                    onChange={(e) => dispatch({ oldEmployeeId: e.target.value })}
                    placeholder="Contoh: 1900010100000000"
                    className="font-mono"
                    required
                  />
                </FormField>
              )}
            </div>

            <FormField label="Nama Lengkap (Tanpa Gelar)" required>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => dispatch({ name: e.target.value })}
                placeholder="Nama sesuai KTP / Dokumen Resmi"
                required
              />
            </FormField>

            <FormField label="Alamat Email Aktif" required>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => dispatch({ email: e.target.value })}
                placeholder="pegawai@rsudbahteramas.go.id"
                required
              />
            </FormField>

            <FormField label="Role Hak Akses" required>
              <Select
                value={form.role}
                onChange={(e) => dispatch({ role: e.target.value as Role })}
                options={ROLE_OPTIONS}
              />
            </FormField>

            <FormField label={isEditMode ? "Kata Sandi Baru (Kosongkan jika tidak diganti)" : "Kata Sandi (Default: Pegawai123!)"}>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => dispatch({ password: e.target.value })}
                placeholder={isEditMode ? "Isi hanya jika ingin mengubah kata sandi..." : "Kosongkan untuk menggunakan sandi default (Pegawai123!)"}
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Biodata Tambahan Pegawai */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">2. Biodata & Informasi Pribadi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Gelar Akademik">
              <Input
                type="text"
                value={form.academicDegree}
                onChange={(e) => dispatch({ academicDegree: e.target.value })}
                placeholder="Contoh: S.Kep., Ns. / Sp.B"
              />
            </FormField>

            <FormField label="Tempat Lahir">
              <Input
                type="text"
                value={form.birthPlace}
                onChange={(e) => dispatch({ birthPlace: e.target.value })}
                placeholder="Contoh: Kendari"
              />
            </FormField>

            <FormField label="Tanggal Lahir">
              <Input
                type="date"
                value={form.birthDate}
                onChange={(e) => dispatch({ birthDate: e.target.value })}
              />
            </FormField>

            <FormField label="Jenis Kelamin">
              <Select
                value={form.gender}
                onChange={(e) => dispatch({ gender: e.target.value })}
                options={GENDER_OPTIONS}
              />
            </FormField>

            <FormField label="Agama">
              <Select
                value={form.religion}
                onChange={(e) => dispatch({ religion: e.target.value })}
                options={RELIGION_OPTIONS}
                placeholder="-- Pilih Agama --"
              />
            </FormField>

            <FormField label="Status Pernikahan">
              <Select
                value={form.maritalStatus}
                onChange={(e) => dispatch({ maritalStatus: e.target.value })}
                options={MARITAL_STATUS_OPTIONS}
                placeholder="-- Pilih Status Pernikahan --"
              />
            </FormField>

            <FormField label="Tanggal Masuk Kerja">
              <Input
                type="date"
                value={form.joinDate}
                onChange={(e) => dispatch({ joinDate: e.target.value })}
              />
            </FormField>

            <div className="md:col-span-2 rounded-xl border border-border/60 bg-accent/20 p-4 space-y-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={form.hasTmt}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      dispatch({ hasTmt: false, tmtStartDate: "", tmtEndDate: "" });
                    } else {
                      dispatch({ hasTmt: true });
                    }
                  }}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Pegawai memiliki data TMT
              </label>

              {form.hasTmt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Mulai TMT / Kontrak">
                    <Input
                      type="date"
                      value={form.tmtStartDate}
                      onChange={(e) => dispatch({ tmtStartDate: e.target.value })}
                    />
                  </FormField>

                  <FormField label="Akhir TMT / Kontrak (Opsional)">
                    <Input
                      type="date"
                      value={form.tmtEndDate}
                      onChange={(e) => dispatch({ tmtEndDate: e.target.value })}
                    />
                  </FormField>
                </div>
              )}
            </div>

            <FormField label="Pendidikan Terakhir">
              <Select
                value={form.lastEducation}
                onChange={(e) => dispatch({ lastEducation: e.target.value })}
                options={EDUCATION_OPTIONS}
                placeholder="-- Pilih Pendidikan Terakhir --"
              />
            </FormField>

            <FormField label="Nomor Telepon / WhatsApp">
              <Input
                type="text"
                value={form.phone}
                onChange={(e) => dispatch({ phone: e.target.value })}
                placeholder="081234567890"
                className="font-mono"
              />
            </FormField>

            <FormField label="Alamat Lengkap" className="md:col-span-2">
              <Textarea
                rows={3}
                value={form.address}
                onChange={(e) => dispatch({ address: e.target.value })}
                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten..."
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Kategori & Kualifikasi Kepegawaian */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">3. Data Kepegawaian</h3>
          </div>

          {isLoadingCategories ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat daftar kategori...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Status Kepegawaian">
                <Select
                  value={form.employmentStatusId}
                  onChange={(e) => {
                    dispatch({ employmentStatusId: e.target.value, employeeGroupId: "" });
                  }}
                  options={categories?.employmentStatuses.map((s) => ({ value: s.id, label: s.name }))}
                  placeholder="-- Pilih Status Kepegawaian --"
                />
              </FormField>

              <FormField label="Jenis Kepegawaian (Sub-Status)">
                <Select
                  value={form.employeeGroupId}
                  onChange={(e) => dispatch({ employeeGroupId: e.target.value })}
                  disabled={!form.employmentStatusId || availableGroups.length === 0}
                  options={availableGroups.map((g) => ({ value: g.id, label: g.name }))}
                  placeholder="-- Pilih Jenis Kepegawaian --"
                />
              </FormField>

              <FormField label="Kelompok Profesi">
                <Select
                  value={form.professionGroupId}
                  onChange={(e) => {
                    dispatch({ professionGroupId: e.target.value, employeePositionId: "" });
                  }}
                  options={categories?.professionGroups.map((p) => ({ value: p.id, label: p.name }))}
                  placeholder="-- Pilih Profesi (e.g. Medis, Administrasi) --"
                />
              </FormField>

              <FormField label="Jabatan (Sub-Profesi)">
                <Select
                  value={form.employeePositionId}
                  onChange={(e) => dispatch({ employeePositionId: e.target.value })}
                  disabled={!form.professionGroupId || availablePositions.length === 0}
                  options={availablePositions.map((pos) => ({ value: pos.id, label: pos.name }))}
                  placeholder="-- Pilih Jabatan --"
                />
              </FormField>

              <FormField label="Pangkat / Golongan">
                <Select
                  value={form.employeeRankId}
                  onChange={(e) => dispatch({ employeeRankId: e.target.value })}
                  options={categories?.employeeRanks.map((r) => ({ value: r.id, label: r.name }))}
                  placeholder="-- Pilih Pangkat --"
                />
              </FormField>

              <FormField label="Tempat / Unit Tugas">
                <Select
                  value={form.workplaceId}
                  onChange={(e) => dispatch({ workplaceId: e.target.value })}
                  options={categories?.workplaces.map((w) => ({ value: w.id, label: w.name }))}
                  placeholder="-- Pilih Tempat Tugas --"
                />
              </FormField>
            </div>
          )}
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/users">
            <Button type="button" variant="outline" className="rounded-xl px-5">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="rounded-xl px-6">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Menyimpan..." : "Menambahkan..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Simpan Perubahan" : "Simpan Pegawai"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
