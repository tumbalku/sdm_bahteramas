import type { Role } from "@prisma/client";

export const EMPLOYEE_CAPABLE_ROLES = ["ADMIN", "STAFF", "EMPLOYEE"] as const satisfies readonly Role[];
export const VERIFICATION_CAPABLE_ROLES = ["ADMIN", "STAFF"] as const satisfies readonly Role[];
export const ADMIN_CAPABLE_ROLES = ["ADMIN"] as const satisfies readonly Role[];

type RoleLike = Role | string | null | undefined;

export function hasCapability(role: RoleLike, allowedRoles: readonly string[]) {
  return Boolean(role && allowedRoles.includes(role));
}

export function canManageOwnDocuments(role: RoleLike) {
  return hasCapability(role, EMPLOYEE_CAPABLE_ROLES);
}

export function canVerifyDocuments(role: RoleLike) {
  return hasCapability(role, VERIFICATION_CAPABLE_ROLES);
}

export function canManageUsers(role: RoleLike) {
  return hasCapability(role, ADMIN_CAPABLE_ROLES);
}

export function canManageAllDocuments(role: RoleLike) {
  return hasCapability(role, ADMIN_CAPABLE_ROLES);
}
