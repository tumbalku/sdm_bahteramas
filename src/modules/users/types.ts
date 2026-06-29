import { Role } from "@prisma/client";

export interface MasterItemSummary {
  id: string;
  name: string;
}

export interface UserRecord {
  id: string;
  employeeId: string;
  nik?: string | null;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: Role;
  gender?: string | null;
  birthDate?: Date | null;
  academicDegree?: string | null;
  lastEducation?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  phone?: string | null;
  address?: string | null;
  joinDate?: Date | null;
  employmentStatus?: MasterItemSummary | null;
  employeeGroup?: MasterItemSummary | null;
  professionGroup?: MasterItemSummary | null;
  employeePosition?: MasterItemSummary | null;
  employeeRank?: MasterItemSummary | null;
  workplace?: MasterItemSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  employeeId: string;
  nik?: string | null;
  email: string;
  password?: string;
  name: string;
  role: Role;
  gender?: string;
  birthDate?: string;
  academicDegree?: string;
  lastEducation?: string;
  religion?: string;
  maritalStatus?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  employmentStatusId?: string;
  employeeGroupId?: string;
  professionGroupId?: string;
  employeePositionId?: string;
  employeeRankId?: string;
  workplaceId?: string;
}

export interface UpdateUserInput {
  employeeId?: string;
  nik?: string | null;
  email?: string;
  password?: string;
  name?: string;
  role?: Role;
  gender?: string;
  birthDate?: string;
  academicDegree?: string;
  lastEducation?: string;
  religion?: string;
  maritalStatus?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  employmentStatusId?: string;
  employeeGroupId?: string;
  professionGroupId?: string;
  employeePositionId?: string;
  employeeRankId?: string;
  workplaceId?: string;
}

export interface UserFilter {
  search?: string;
  professionGroupId?: string;
  workplaceId?: string;
  employmentStatusId?: string;
  employeeGroupId?: string;
  employeePositionId?: string;
}
