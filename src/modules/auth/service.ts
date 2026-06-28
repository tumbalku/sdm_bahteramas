import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/security-log";
import { LoginCredentials, LoginResult } from "./types";
import { loginSchema } from "./validation";

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

  // Cari user berdasarkan employeeId (NIP) atau email
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ employeeId: identifier }, { email: identifier }],
    },
  });

  if (!user) {
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
      error: "NIP/Email atau password salah",
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
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
      error: "NIP/Email atau password salah",
    };
  }

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
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role,
    },
  };
}
