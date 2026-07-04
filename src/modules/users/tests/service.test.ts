import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { logActivity } from "@/lib/security-log";
import { isDocumentTypeApplicableToUser } from "@/modules/document-types/service";
import * as repo from "../repository";
import type { AuthUser } from "@/lib/auth-utils";
import type { UserRecord } from "../types";
import {
  createUserService,
  deleteUserService,
  exportUserDocumentsCsvService,
  exportUsersCsvService,
  getUsersImportTemplateCsv,
  importUsersCsvService,
  updateUserService,
} from "../service";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
}));

vi.mock("@/lib/security-log", () => ({
  logActivity: vi.fn(),
}));

vi.mock("@/modules/document-types/service", () => ({
  isDocumentTypeApplicableToUser: vi.fn(),
}));

vi.mock("../repository", () => ({
  findManyUsers: vi.fn(),
  findUserByEmployeeId: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  findUserImportReferenceData: vi.fn(),
  findUsersByUniqueFields: vi.fn(),
  createUsersBulk: vi.fn(),
  findUserDocumentExportSource: vi.fn(),
}));

const actor: AuthUser = {
  id: "admin-1",
  employeeId: "ADMIN001",
  email: "admin@smdp.test",
  name: "Admin SMDP",
  role: Role.ADMIN,
};

function makeUser(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id: "user-1",
    employeeId: "198501012010011001",
    nik: "7471010101900001",
    email: "pegawai@smdp.test",
    name: "Budi Santoso",
    avatarUrl: null,
    role: Role.EMPLOYEE,
    gender: "L",
    birthDate: null,
    academicDegree: null,
    lastEducation: null,
    religion: null,
    maritalStatus: null,
    phone: null,
    address: null,
    joinDate: null,
    hasTmt: false,
    tmtStartDate: null,
    tmtEndDate: null,
    employmentStatus: null,
    employeeGroup: null,
    professionGroup: null,
    employeePosition: null,
    employeeRank: null,
    workplace: null,
    createdAt: new Date("2026-07-04T00:00:00.000Z"),
    updatedAt: new Date("2026-07-04T00:00:00.000Z"),
    ...overrides,
  };
}

const validCreateInput = {
  employeeId: "198501012010011001",
  email: "pegawai@smdp.test",
  password: "secret123",
  name: "Budi Santoso",
  role: Role.EMPLOYEE,
  hasTmt: false,
};

describe("users service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
    vi.mocked(logActivity).mockResolvedValue(undefined);
    vi.mocked(isDocumentTypeApplicableToUser).mockReturnValue(true);
  });

  describe("createUserService", () => {
    it("menolak employeeId yang sudah terdaftar", async () => {
      vi.mocked(repo.findUserByEmployeeId).mockResolvedValue({ id: "existing" } as never);

      await expect(createUserService(validCreateInput, actor)).rejects.toThrow(
        "NIP '198501012010011001' sudah terdaftar",
      );
      expect(repo.createUser).not.toHaveBeenCalled();
    });

    it("menolak email yang sudah terdaftar", async () => {
      vi.mocked(repo.findUserByEmployeeId).mockResolvedValue(null);
      vi.mocked(repo.findUserByEmail).mockResolvedValue({ id: "existing" } as never);

      await expect(createUserService(validCreateInput, actor)).rejects.toThrow(
        "Email 'pegawai@smdp.test' sudah terdaftar",
      );
      expect(repo.createUser).not.toHaveBeenCalled();
    });

    it("hash password, membuat user, dan mencatat audit", async () => {
      const createdUser = makeUser();
      vi.mocked(repo.findUserByEmployeeId).mockResolvedValue(null);
      vi.mocked(repo.findUserByEmail).mockResolvedValue(null);
      vi.mocked(repo.createUser).mockResolvedValue(createdUser);

      const result = await createUserService(validCreateInput, actor);

      expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
      expect(repo.createUser).toHaveBeenCalledWith(expect.objectContaining({
        employeeId: "198501012010011001",
        passwordHash: "hashed-password",
      }));
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        actorId: actor.id,
        eventType: "USER_CREATED",
        status: "success",
      }));
      expect(result).toBe(createdUser);
    });

    it("memakai password default ketika password kosong", async () => {
      vi.mocked(repo.findUserByEmployeeId).mockResolvedValue(null);
      vi.mocked(repo.findUserByEmail).mockResolvedValue(null);
      vi.mocked(repo.createUser).mockResolvedValue(makeUser());

      await createUserService({ ...validCreateInput, password: "" }, actor);

      expect(bcrypt.hash).toHaveBeenCalledWith("Pegawai123!", 10);
    });
  });

  describe("updateUserService", () => {
    it("melempar error jika user target tidak ditemukan", async () => {
      vi.mocked(repo.findUserById).mockResolvedValue(null);

      await expect(updateUserService("missing-user", { name: "Nama Baru" }, actor)).rejects.toThrow(
        "Pegawai tidak ditemukan",
      );
    });

    it("menolak perubahan employeeId jika NIP baru sudah dipakai", async () => {
      vi.mocked(repo.findUserById).mockResolvedValue(makeUser());
      vi.mocked(repo.findUserByEmployeeId).mockResolvedValue({ id: "other-user" } as never);

      await expect(updateUserService("user-1", { employeeId: "199901012026011001" }, actor)).rejects.toThrow(
        "NIP '199901012026011001' sudah terdaftar",
      );
    });

    it("menolak perubahan email jika email baru sudah dipakai", async () => {
      vi.mocked(repo.findUserById).mockResolvedValue(makeUser());
      vi.mocked(repo.findUserByEmail).mockResolvedValue({ id: "other-user" } as never);

      await expect(updateUserService("user-1", { email: "lain@smdp.test" }, actor)).rejects.toThrow(
        "Email 'lain@smdp.test' sudah terdaftar",
      );
    });

    it("update user tanpa hash password ketika password tidak dikirim", async () => {
      const updatedUser = makeUser({ name: "Nama Baru" });
      vi.mocked(repo.findUserById).mockResolvedValue(makeUser());
      vi.mocked(repo.updateUser).mockResolvedValue(updatedUser);

      const result = await updateUserService("user-1", { name: "Nama Baru" }, actor);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repo.updateUser).toHaveBeenCalledWith("user-1", { name: "Nama Baru" });
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        eventType: "USER_UPDATED",
        status: "success",
      }));
      expect(result).toBe(updatedUser);
    });

    it("hash password ketika password dikirim", async () => {
      vi.mocked(repo.findUserById).mockResolvedValue(makeUser());
      vi.mocked(repo.updateUser).mockResolvedValue(makeUser());

      await updateUserService("user-1", { password: "newpass123" }, actor);

      expect(bcrypt.hash).toHaveBeenCalledWith("newpass123", 10);
      expect(repo.updateUser).toHaveBeenCalledWith("user-1", expect.objectContaining({
        passwordHash: "hashed-password",
      }));
    });
  });

  describe("deleteUserService", () => {
    it("menolak user menghapus akun sendiri", async () => {
      await expect(deleteUserService(actor.id, actor)).rejects.toThrow("Anda tidak dapat menghapus akun Anda sendiri");
    });

    it("melempar error jika user target tidak ditemukan", async () => {
      vi.mocked(repo.findUserById).mockResolvedValue(null);

      await expect(deleteUserService("missing-user", actor)).rejects.toThrow("Pegawai tidak ditemukan");
    });

    it("menghapus user valid, mencatat audit, dan mengembalikan true", async () => {
      vi.mocked(repo.findUserById).mockResolvedValue(makeUser());
      vi.mocked(repo.deleteUser).mockResolvedValue(true);

      const result = await deleteUserService("user-1", actor);

      expect(repo.deleteUser).toHaveBeenCalledWith("user-1");
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        eventType: "USER_DELETED",
        status: "success",
      }));
      expect(result).toBe(true);
    });
  });

  describe("csv services", () => {
    it("getUsersImportTemplateCsv menghasilkan header import", () => {
      const csv = getUsersImportTemplateCsv();

      expect(csv.split("\n")[0]).toContain("employeeId,nik,email,password,name,role");
    });

    it("importUsersCsvService mengembalikan error ketika header tidak lengkap", async () => {
      const result = await importUsersCsvService("employeeId,email\n123,pegawai@smdp.test", actor);

      expect(result.errorCount).toBe(1);
      expect(result.errors[0].message).toContain("Header CSV tidak lengkap");
      expect(repo.createUsersBulk).not.toHaveBeenCalled();
    });

    it("importUsersCsvService mengembalikan error ketika CSV tidak memiliki data pegawai", async () => {
      const header = getUsersImportTemplateCsv().split("\n")[0];

      const result = await importUsersCsvService(header, actor);

      expect(result).toMatchObject({
        totalRows: 0,
        validRows: 0,
        createdCount: 0,
        errorCount: 1,
      });
      expect(result.errors[0].message).toBe("CSV tidak memiliki data pegawai");
    });

    it("exportUsersCsvService menghasilkan CSV dan audit DATA_EXPORTED", async () => {
      vi.mocked(repo.findManyUsers).mockResolvedValue([
        makeUser({
          employmentStatus: { id: "status-1", name: "PNS" },
          createdAt: new Date("2026-07-04T00:00:00.000Z"),
        }),
      ]);

      const result = await exportUsersCsvService({ search: "Budi" }, actor, "127.0.0.1");

      expect(result.csv).toContain("employeeId,nik,email");
      expect(result.csv).toContain("198501012010011001");
      expect(result.fileName).toMatch(/^smdp-users-\d{8}-\d{4}\.csv$/);
      expect(result.rowCount).toBe(1);
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        eventType: "DATA_EXPORTED",
        resource: "/api/v1/users/export",
        ipAddress: "127.0.0.1",
        status: "success",
      }));
    });

    it("exportUserDocumentsCsvService melempar error ketika pegawai tidak ditemukan", async () => {
      vi.mocked(repo.findUserDocumentExportSource).mockResolvedValue({
        user: null,
        documentTypes: [],
        documents: [],
      });

      await expect(exportUserDocumentsCsvService("missing-user", actor)).rejects.toThrow("Pegawai tidak ditemukan");
    });
  });
});
