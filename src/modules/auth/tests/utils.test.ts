import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { buildLoginLookupWhere, INVALID_LOGIN_MESSAGE, toAuthUserSession } from "../utils";

describe("auth utils", () => {
  it("buildLoginLookupWhere membentuk query lookup berdasarkan employeeId atau email", () => {
    expect(buildLoginLookupWhere("admin@smdp.test")).toEqual({
      OR: [{ employeeId: "admin@smdp.test" }, { email: "admin@smdp.test" }],
    });
  });

  it("toAuthUserSession hanya mengembalikan field aman untuk session", () => {
    const user = {
      id: "user-1",
      name: "Admin SMDP",
      email: "admin@smdp.test",
      employeeId: "ADMIN001",
      role: Role.ADMIN,
      passwordHash: "hashed-password",
    };

    expect(toAuthUserSession(user)).toEqual({
      id: "user-1",
      name: "Admin SMDP",
      email: "admin@smdp.test",
      employeeId: "ADMIN001",
      role: Role.ADMIN,
    });
    expect(toAuthUserSession(user)).not.toHaveProperty("passwordHash");
  });

  it("menyediakan pesan login invalid yang sama untuk user tidak ditemukan dan password salah", () => {
    expect(INVALID_LOGIN_MESSAGE).toBe("NIP/Email atau password salah");
  });
});
