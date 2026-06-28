import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/security-log";
import { prisma } from "@/lib/prisma";
import {
  findUserProfileById,
  updateUserProfile,
  updateUserPassword,
} from "./repository";
import { ChangePasswordInput, UpdateProfileInput } from "./types";

export async function getProfileService(userId: string) {
  const profile = await findUserProfileById(userId);
  if (!profile) {
    throw new Error("Profil tidak ditemukan");
  }
  
  // Sembunyikan password hash
  const { passwordHash, ...safeProfile } = profile;
  return safeProfile;
}

export async function updateProfileService(
  userId: string,
  input: UpdateProfileInput,
  actor: { id: string; name: string; role: string },
  ipAddress?: string
) {
  const user = await findUserProfileById(userId);
  if (!user) {
    throw new Error("Pengguna tidak ditemukan");
  }

  const updatedUser = await updateUserProfile(userId, {
    name: input.name,
    gender: input.gender,
    birthDate: input.birthDate ? new Date(input.birthDate) : null,
  });

  await logActivity(
    {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: "PROFILE_UPDATED",
      resource: `User:${userId}`,
      ipAddress,
      status: "SUCCESS",
      metadata: { changes: { name: input.name } },
    },
    prisma
  );

  return updatedUser;
}

export async function changePasswordService(
  userId: string,
  input: ChangePasswordInput,
  actor: { id: string; name: string; role: string },
  ipAddress?: string
) {
  const user = await findUserProfileById(userId);
  if (!user) {
    throw new Error("Pengguna tidak ditemukan");
  }

  const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error("Kata sandi saat ini tidak sesuai");
  }

  const newHash = await bcrypt.hash(input.newPassword, 10);
  await updateUserPassword(userId, newHash);

  await logActivity(
    {
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      eventType: "PASSWORD_CHANGED",
      resource: `User:${userId}`,
      ipAddress,
      status: "SUCCESS",
    },
    prisma
  );

  return true;
}
