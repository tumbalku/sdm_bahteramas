import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/v1/auth/verify-password/route";
import { failedPasswordVerifyAttempts } from "@/modules/auth/verify-password-rate-limit";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/security-log";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth-utils", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/security-log", () => ({
  logActivity: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe("verify-password API Route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    failedPasswordVerifyAttempts.clear();
  });

  const createRequest = (body: any) => {
    return new NextRequest("http://localhost/api/v1/auth/verify-password", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "x-forwarded-for": "192.168.1.1",
      },
    });
  };

  it("should return 401 if user is not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const req = createRequest({ password: "password123" });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Silakan login terlebih dahulu");
  });

  it("should return 400 if password is not provided", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      employeeId: "123",
      role: "EMPLOYEE",
    });
    const req = createRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Kata sandi wajib diisi");
  });

  it("should verify successfully with correct password", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      employeeId: "123",
      role: "EMPLOYEE",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      passwordHash: "hashed-pass",
    } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

    const req = createRequest({ password: "correct-pass" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "PASSWORD_VERIFY_SUCCESS",
        status: "success",
      })
    );
  });

  it("should fail and log failure with incorrect password", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      employeeId: "123",
      role: "EMPLOYEE",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      passwordHash: "hashed-pass",
    } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

    const req = createRequest({ password: "wrong-pass" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "PASSWORD_VERIFY_FAILED",
        status: "failed",
      })
    );
  });

  it("should rate limit after 5 failed attempts within 10 minutes", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      employeeId: "123",
      role: "EMPLOYEE",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      passwordHash: "hashed-pass",
    } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const req = createRequest({ password: "wrong-pass" });
      const res = await POST(req);
      expect(res.status).toBe(400);
    }

    expect(failedPasswordVerifyAttempts.get("user-1")?.length).toBe(5);

    // The 6th attempt should return 429
    const req = createRequest({ password: "any-pass" });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Terlalu banyak percobaan gagal");
    expect(logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "PASSWORD_VERIFY_RATE_LIMITED",
        status: "failed",
      })
    );
  });

  it("should clear failed attempts after successful verification", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      employeeId: "123",
      role: "EMPLOYEE",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      passwordHash: "hashed-pass",
    } as any);
    
    // Simulate 2 failed attempts
    vi.mocked(bcrypt.compare).mockResolvedValue(false as any);
    for (let i = 0; i < 2; i++) {
      const req = createRequest({ password: "wrong-pass" });
      await POST(req);
    }
    expect(failedPasswordVerifyAttempts.get("user-1")?.length).toBe(2);

    // Simulate successful attempt
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);
    const reqSuccess = createRequest({ password: "correct-pass" });
    const resSuccess = await POST(reqSuccess);
    expect(resSuccess.status).toBe(200);
    
    // Verify list is cleared
    expect(failedPasswordVerifyAttempts.get("user-1")).toBeUndefined();
  });
});
