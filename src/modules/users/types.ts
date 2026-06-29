import { Role } from "@prisma/client";

export interface MasterItemSummary {
  id: string;
  name: string;
}

export interface UserRecord {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: Role;
  gender?: string | null;
  birthDate?: Date | null;
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
  email: string;
  password?: string;
  name: string;
  role: Role;
  gender?: string;
  birthDate?: string;
  employmentStatusId?: string;
  employeeGroupId?: string;
  professionGroupId?: string;
  employeePositionId?: string;
  employeeRankId?: string;
  workplaceId?: string;
}

export interface UpdateUserInput {
  employeeId?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: Role;
  gender?: string;
  birthDate?: string;
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
