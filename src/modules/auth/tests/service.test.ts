import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/security-log";
import { authenticateUser } from "../service";

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/security-log", () => ({
  logActivity: vi.fn(),
}));

const userRecord = {
  id: "user-1",
  name: "Admin SMDP",
  email: "admin@smdp.test",
  employeeId: "ADMIN001",
  passwordHash: "hashed-password",
  role: Role.ADMIN,
};

describe("authenticateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  it("mengembalikan error validasi dan tidak memanggil dependency eksternal ketika input invalid", async () => {
    const result = await authenticateUser({ identifier: "", password: "" }, "127.0.0.1");

    expect(result).toEqual({
      success: false,
      error: "NIP atau Email wajib diisi",
    });
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(logActivity).not.toHaveBeenCalled();
  });

  it("mengembalikan error dan mencatat audit ketika user tidak ditemukan", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const result = await authenticateUser(
      { identifier: "missing@smdp.test", password: "secret123" },
      "127.0.0.1",
    );

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ employeeId: "missing@smdp.test" }, { email: "missing@smdp.test" }],
      },
    });
    expect(result).toEqual({
      success: false,
      error: "NIP/Email atau password salah",
    });
    expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
      actorName: "missing@smdp.test",
      actorRole: "UNKNOWN",
      eventType: "USER_LOGIN_FAILED",
      resource: "/api/v1/auth/login",
      ipAddress: "127.0.0.1",
      status: "failed",
      metadata: { reason: "User not found" },
    }));
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("mengembalikan error dan mencatat audit ketika password salah", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(userRecord as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = await authenticateUser(
      { identifier: "ADMIN001", password: "wrong-password" },
      "127.0.0.1",
    );

    expect(bcrypt.compare).toHaveBeenCalledWith("wrong-password", "hashed-password");
    expect(result).toEqual({
      success: false,
      error: "NIP/Email atau password salah",
    });
    expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
      actorId: "user-1",
      actorName: "Admin SMDP",
      actorRole: Role.ADMIN,
      eventType: "USER_LOGIN_FAILED",
      resource: "/api/v1/auth/login",
      ipAddress: "127.0.0.1",
      status: "failed",
      metadata: { reason: "Invalid password" },
    }));
  });

  it("mengembalikan session user dan mencatat audit ketika login sukses", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(userRecord as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authenticateUser(
      { identifier: "ADMIN001", password: "secret123" },
      "127.0.0.1",
    );

    expect(result).toEqual({
      success: true,
      user: {
        id: "user-1",
        name: "Admin SMDP",
        email: "admin@smdp.test",
        employeeId: "ADMIN001",
        role: Role.ADMIN,
      },
    });
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
      actorId: "user-1",
      actorName: "Admin SMDP",
      actorRole: Role.ADMIN,
      eventType: "USER_LOGIN_SUCCESS",
      resource: "/api/v1/auth/login",
      ipAddress: "127.0.0.1",
      status: "success",
    }));
  });

  it("membiarkan error prisma bubble sesuai behavior saat ini", async () => {
    vi.mocked(prisma.user.findFirst).mockRejectedValue(new Error("Database down"));

    await expect(authenticateUser({ identifier: "ADMIN001", password: "secret123" })).rejects.toThrow("Database down");
  });

  it("membiarkan error bcrypt bubble sesuai behavior saat ini", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(userRecord as never);
    vi.mocked(bcrypt.compare).mockRejectedValue(new Error("Bcrypt failed") as never);

    await expect(authenticateUser({ identifier: "ADMIN001", password: "secret123" })).rejects.toThrow("Bcrypt failed");
  });
});
