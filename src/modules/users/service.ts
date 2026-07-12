import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/security-log";
import type { AuthUser } from "@/lib/auth-utils";
import * as repo from "./repository";
import type { CreateUserInput, UpdateUserInput, UserFilter, UserRecord } from "./types";
import { createUserSchema, updateUserSchema } from "./validation";

export { getUsersImportTemplateCsv, importUsersCsvService } from "./import-service";
export {
  exportOwnUserProfilePdfService,
  exportUserDocumentsCsvService,
  exportUserProfilePdfService,
  exportUsersCsvService,
} from "./export-service";

export async function getAllUsers(filters?: UserFilter): Promise<UserRecord[]> {
  return repo.findManyUsers(filters);
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  return repo.findUserById(id);
}

export async function createUserService(
  input: CreateUserInput,
  actor: AuthUser
): Promise<UserRecord> {
  const validated = createUserSchema.parse(input);

  // Cek keunikan NIP (employeeId)
  const existingEmployeeId = await repo.findUserByEmployeeId(validated.employeeId);
  if (existingEmployeeId) {
    throw new Error(`NIP '${validated.employeeId}' sudah terdaftar`);
  }

  // Cek keunikan email
  const existingEmail = await repo.findUserByEmail(validated.email);
  if (existingEmail) {
    throw new Error(`Email '${validated.email}' sudah terdaftar`);
  }

  const rawPassword = validated.password || "Pegawai123!";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const result = await repo.createUser({
    ...validated,
    passwordHash,
  });

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "USER_CREATED",
    resource: `/api/v1/users/${result.id}`,
    status: "success",
    metadata: {
      employeeId: result.employeeId,
      name: result.name,
      role: result.role,
      hasTmt: result.hasTmt,
      tmtStartDate: result.tmtStartDate,
      tmtEndDate: result.tmtEndDate,
      hasOldEmployeeId: result.hasOldEmployeeId,
      oldEmployeeId: result.oldEmployeeId,
    },
  });

  return result;
}

export async function updateUserService(
  id: string,
  input: UpdateUserInput,
  actor: AuthUser
): Promise<UserRecord> {
  const validated = updateUserSchema.parse(input);

  const existing = await repo.findUserById(id);
  if (!existing) {
    throw new Error("Pegawai tidak ditemukan");
  }

  if (validated.employeeId && validated.employeeId !== existing.employeeId) {
    const existingEmployeeId = await repo.findUserByEmployeeId(validated.employeeId);
    if (existingEmployeeId) {
      throw new Error(`NIP '${validated.employeeId}' sudah terdaftar`);
    }
  }

  if (validated.email && validated.email !== existing.email) {
    const existingEmail = await repo.findUserByEmail(validated.email);
    if (existingEmail) {
      throw new Error(`Email '${validated.email}' sudah terdaftar`);
    }
  }

  let passwordHash: string | undefined;
  if (validated.password) {
    passwordHash = await bcrypt.hash(validated.password, 10);
  }

  const result = await repo.updateUser(id, {
    ...validated,
    ...(passwordHash && { passwordHash }),
  });

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "USER_UPDATED",
    resource: `/api/v1/users/${id}`,
    status: "success",
    metadata: {
      employeeId: result.employeeId,
      name: result.name,
      hasTmt: result.hasTmt,
      tmtStartDate: result.tmtStartDate,
      tmtEndDate: result.tmtEndDate,
      hasOldEmployeeId: result.hasOldEmployeeId,
      oldEmployeeId: result.oldEmployeeId,
    },
  });

  return result;
}

export async function deleteUserService(
  id: string,
  actor: AuthUser
): Promise<boolean> {
  if (id === actor.id) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri");
  }

  const existing = await repo.findUserById(id);
  if (!existing) {
    throw new Error("Pegawai tidak ditemukan");
  }

  await repo.deleteUser(id);

  await logActivity({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    eventType: "USER_DELETED",
    resource: `/api/v1/users/${id}`,
    status: "success",
    metadata: { employeeId: existing.employeeId, name: existing.name },
  });

  return true;
}
