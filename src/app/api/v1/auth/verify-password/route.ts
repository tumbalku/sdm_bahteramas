import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/security-log";
import { ok, fail } from "@/lib/api-response";
import {
  clearPasswordVerifyFailures,
  PASSWORD_VERIFY_MAX_FAILED_ATTEMPTS,
  prunePasswordVerifyAttempts,
  recordPasswordVerifyFailure,
} from "@/modules/auth/verify-password-rate-limit";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return fail("Akses tidak diizinkan. Silakan login terlebih dahulu.", 401);
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userId = currentUser.id;

    // Prune old entries
    const now = Date.now();
    const attempts = prunePasswordVerifyAttempts(userId, now);

    if (attempts.length >= PASSWORD_VERIFY_MAX_FAILED_ATTEMPTS) {
      await logActivity({
        actorId: currentUser.id,
        actorName: currentUser.name || "Unknown",
        actorRole: currentUser.role,
        eventType: "PASSWORD_VERIFY_RATE_LIMITED",
        resource: "/api/v1/auth/verify-password",
        ipAddress,
        status: "failed",
        metadata: { userId, count: attempts.length }
      });

      return fail("Terlalu banyak percobaan gagal. Silakan coba lagi setelah 10 menit.", 429);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return fail("Format request tidak valid.", 400);
    }
    const { password } = body;

    if (!password) {
      return fail("Kata sandi wajib diisi.", 400);
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser || !dbUser.passwordHash) {
      // Record failure attempt
      recordPasswordVerifyFailure(userId, now);

      await logActivity({
        actorId: currentUser.id,
        actorName: currentUser.name || "Unknown",
        actorRole: currentUser.role,
        eventType: "PASSWORD_VERIFY_FAILED",
        resource: "/api/v1/auth/verify-password",
        ipAddress,
        status: "failed",
        metadata: { userId, reason: "User data not found or no password hash" }
      });

      return fail("Kata sandi yang Anda masukkan salah! Verifikasi identitas gagal.", 400);
    }

    const isMatch = await bcrypt.compare(password, dbUser.passwordHash);
    if (!isMatch) {
      // Record failure attempt
      recordPasswordVerifyFailure(userId, now);

      await logActivity({
        actorId: currentUser.id,
        actorName: currentUser.name || "Unknown",
        actorRole: currentUser.role,
        eventType: "PASSWORD_VERIFY_FAILED",
        resource: "/api/v1/auth/verify-password",
        ipAddress,
        status: "failed",
        metadata: { userId, reason: "Invalid password matching" }
      });

      return fail("Kata sandi yang Anda masukkan salah! Verifikasi identitas gagal.", 400);
    }

    // Success: clear failed attempts
    clearPasswordVerifyFailures(userId);

    await logActivity({
      actorId: currentUser.id,
      actorName: currentUser.name || "Unknown",
      actorRole: currentUser.role,
      eventType: "PASSWORD_VERIFY_SUCCESS",
      resource: "/api/v1/auth/verify-password",
      ipAddress,
      status: "success",
      metadata: { userId }
    });

    return ok({
      message: "Verifikasi kata sandi dan identitas pengguna berhasil.",
    });
  } catch (error: any) {
    return fail(error.message || "Terjadi kesalahan saat memverifikasi kata sandi.", 500);
  }
}
