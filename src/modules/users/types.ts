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
  birthPlace?: string | null;
  birthDate?: Date | null;
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
  gender?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  academicDegree?: string | null;
  lastEducation?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  phone?: string | null;
  address?: string | null;
  joinDate?: string | null;
  hasTmt?: boolean;
  tmtStartDate?: string | null;
  tmtEndDate?: string | null;
  hasOldEmployeeId?: boolean;
  oldEmployeeId?: string | null;
  employmentStatusId?: string | null;
  employeeGroupId?: string | null;
  professionGroupId?: string | null;
  employeePositionId?: string | null;
  employeeRankId?: string | null;
  workplaceId?: string | null;
}

export interface UpdateUserInput {
  employeeId?: string;
  nik?: string | null;
  email?: string;
  password?: string;
  name?: string;
  role?: Role;
  gender?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  academicDegree?: string | null;
  lastEducation?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  phone?: string | null;
  address?: string | null;
  joinDate?: string | null;
  hasTmt?: boolean;
  tmtStartDate?: string | null;
  tmtEndDate?: string | null;
  hasOldEmployeeId?: boolean;
  oldEmployeeId?: string | null;
  employmentStatusId?: string | null;
  employeeGroupId?: string | null;
  professionGroupId?: string | null;
  employeePositionId?: string | null;
  employeeRankId?: string | null;
  workplaceId?: string | null;
}

export interface UserFilter {
  search?: string;
  professionGroupId?: string;
  workplaceId?: string;
  employmentStatusId?: string;
  employeeGroupId?: string;
  employeeRankId?: string;
  employeePositionId?: string;
  tmtStartDate?: string;
  tmtEndDate?: string;
  retirementAgeMin?: number;
  retirementAgeMax?: number;
  maritalStatus?: string;
  lastEducation?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedUsersResult {
  items: UserRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ImportUserError {
  row: number;
  field?: string;
  message: string;
}

export interface ImportUsersResult {
  totalRows: number;
  validRows: number;
  createdCount: number;
  errorCount: number;
  errors: ImportUserError[];
}

export interface MasterCategories {
  employmentStatuses: { id: string; name: string; employeeGroups: { id: string; name: string }[] }[];
  professionGroups: { id: string; name: string; employeePositions: { id: string; name: string }[] }[];
  employeeRanks: { id: string; name: string }[];
  workplaces: { id: string; name: string }[];
}

export interface UserFormState {
  employeeId: string;
  nik: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  gender: string;
  birthPlace: string;
  birthDate: string;
  academicDegree: string;
  lastEducation: string;
  religion: string;
  maritalStatus: string;
  phone: string;
  address: string;
  joinDate: string;
  hasTmt: boolean;
  tmtStartDate: string;
  tmtEndDate: string;
  hasOldEmployeeId: boolean;
  oldEmployeeId: string;
  employmentStatusId: string;
  employeeGroupId: string;
  professionGroupId: string;
  employeePositionId: string;
  employeeRankId: string;
  workplaceId: string;
}
