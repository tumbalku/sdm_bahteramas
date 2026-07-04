import type { Role } from "@prisma/client";

export const INVALID_LOGIN_MESSAGE = "NIP/Email atau password salah";

export interface AuthUserRecord {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: Role;
}

export function buildLoginLookupWhere(identifier: string) {
  return {
    OR: [{ employeeId: identifier }, { email: identifier }],
  };
}

export function toAuthUserSession(user: AuthUserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    employeeId: user.employeeId,
    role: user.role,
  };
}
