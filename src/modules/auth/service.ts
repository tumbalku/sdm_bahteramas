import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/security-log";
import { LoginCredentials, LoginResult } from "./types";
import { buildLoginLookupWhere, INVALID_LOGIN_MESSAGE, toAuthUserSession } from "./utils";
import { loginSchema } from "./validation";
import {
  pruneLoginAttempts,
  recordLoginFailure,
  clearLoginFailures,
  LOGIN_MAX_FAILED_ATTEMPTS,
} from "./login-rate-limit";

export async function authenticateUser(
  credentials: LoginCredentials,
  ipAddress?: string
): Promise<LoginResult> {
  // Validasi Zod
  const validation = loginSchema.safeParse(credentials);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Input tidak valid",
    };
  }

  const { identifier, password } = validation.data;
  const now = Date.now();

  // Rate Limiting check
  const attempts = pruneLoginAttempts(identifier, now);
  if (attempts.length >= LOGIN_MAX_FAILED_ATTEMPTS) {
    await logActivity({
      actorName: identifier,
      actorRole: "UNKNOWN",
      eventType: "USER_LOGIN_FAILED",
      resource: "/api/v1/auth/login",
      ipAddress,
      status: "failed",
      metadata: { reason: "Rate limited due to too many failed attempts" },
    });

    return {
      success: false,
      error: "Terlalu banyak percobaan gagal. Silakan coba lagi setelah 10 menit.",
    };
  }

  // Cari user berdasarkan employeeId (NIP) atau email
  const user = await prisma.user.findFirst({
    where: buildLoginLookupWhere(identifier),
  });

  if (!user) {
    recordLoginFailure(identifier, now);
    await logActivity({
      actorName: identifier,
      actorRole: "UNKNOWN",
      eventType: "USER_LOGIN_FAILED",
      resource: "/api/v1/auth/login",
      ipAddress,
      status: "failed",
      metadata: { reason: "User not found" },
    });

    return {
      success: false,
      error: INVALID_LOGIN_MESSAGE,
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    recordLoginFailure(identifier, now);
    await logActivity({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      eventType: "USER_LOGIN_FAILED",
      resource: "/api/v1/auth/login",
      ipAddress,
      status: "failed",
      metadata: { reason: "Invalid password" },
    });

    return {
      success: false,
      error: INVALID_LOGIN_MESSAGE,
    };
  }

  // Clear failed attempts upon successful login
  clearLoginFailures(identifier);

  // Log sukses
  await logActivity({
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
    eventType: "USER_LOGIN_SUCCESS",
    resource: "/api/v1/auth/login",
    ipAddress,
    status: "success",
  });

  return {
    success: true,
    user: toAuthUserSession(user),
  };
}
