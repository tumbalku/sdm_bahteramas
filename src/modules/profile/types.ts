import { Role } from "@prisma/client";

export interface UserProfileDto {
  id: string;
  employeeId: string;
  nik?: string | null;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  gender: string | null;
  birthPlace?: string | null;
  birthDate: Date | null;
  academicDegree?: string | null;
  lastEducation?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  phone?: string | null;
  address?: string | null;
  joinDate?: Date | null;
  hasTmt: boolean;
  tmtStartDate?: Date | null;
  tmtEndDate?: Date | null;
  hasOldEmployeeId: boolean;
  oldEmployeeId?: string | null;
  employmentStatus?: { id: string; name: string } | null;
  employeeGroup?: { id: string; name: string } | null;
  professionGroup?: { id: string; name: string } | null;
  employeePosition?: { id: string; name: string } | null;
  employeeRank?: { id: string; name: string } | null;
  workplace?: { id: string; name: string } | null;
}

export interface UpdateProfileInput {
  name: string;
  nik?: string | null;
  gender?: string;
  birthPlace?: string | null;
  birthDate?: string | null;
  academicDegree?: string | null;
  lastEducation?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
