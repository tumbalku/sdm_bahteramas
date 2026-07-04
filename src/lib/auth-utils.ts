import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth-options";

export {
  ADMIN_CAPABLE_ROLES,
  EMPLOYEE_CAPABLE_ROLES,
  VERIFICATION_CAPABLE_ROLES,
  canManageAllDocuments,
  canManageOwnDocuments,
  canManageUsers,
  canVerifyDocuments,
  hasCapability,
} from "@/lib/rbac";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: Role;
}

/**
 * Mengambil data user yang sedang login di server component / API route
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session.user as AuthUser;
  } catch (error) {
    // Menangani error jika ada cookie terenkripsi lama / tidak valid di browser
    console.warn("⚠️ Invalid or expired session cookie detected:", error);
    return null;
  }
}

/**
 * Cek apakah user memiliki salah satu role yang diizinkan
 */
export function hasRole(user: AuthUser | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Memastikan user login dan memiliki role yang diizinkan.
 * Jika tidak login -> redirect ke /login
 * Jika role tidak sesuai -> redirect ke /dashboard atau throw error 403
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasRole(user, allowedRoles)) {
    redirect("/dashboard");
  }

  return user;
}
