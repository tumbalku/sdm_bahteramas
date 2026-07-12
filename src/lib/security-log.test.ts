import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { logActivity } from "./security-log";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    securityLog: {
      create: vi.fn(),
    },
  },
}));

describe("Security Log Helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should write security log to database for USER_LOGIN_SUCCESS", async () => {
    await logActivity({
      actorId: "user-1",
      actorName: "Test User",
      actorRole: "EMPLOYEE",
      eventType: "USER_LOGIN_SUCCESS",
      resource: "/api/v1/auth/login",
      ipAddress: "127.0.0.1",
      status: "success",
    });

    expect(prisma.securityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "user-1",
        actorName: "Test User",
        actorRole: "EMPLOYEE",
        eventType: "USER_LOGIN_SUCCESS",
        status: "success",
      }),
    });
  });

  it("should write security log to database for USER_LOGIN_FAILED", async () => {
    await logActivity({
      actorName: "unknown-user",
      actorRole: "UNKNOWN",
      eventType: "USER_LOGIN_FAILED",
      resource: "/api/v1/auth/login",
      ipAddress: "127.0.0.1",
      status: "failed",
    });

    expect(prisma.securityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorName: "unknown-user",
        actorRole: "UNKNOWN",
        eventType: "USER_LOGIN_FAILED",
        status: "failed",
      }),
    });
  });

  it("should NOT write security log to database for USER_LOGIN (excluded event type)", async () => {
    await logActivity({
      actorName: "Test User",
      actorRole: "EMPLOYEE",
      eventType: "USER_LOGIN",
      resource: "/api/v1/auth/login",
      status: "success",
    });

    expect(prisma.securityLog.create).not.toHaveBeenCalled();
  });
});
