import { describe, expect, it } from "vitest";
import { loginSchema } from "../validation";

describe("loginSchema", () => {
  it("menerima identifier berupa email dan password terisi", () => {
    const result = loginSchema.safeParse({
      identifier: "admin@smdp.test",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });

  it("menerima identifier berupa NIP/employeeId dan password terisi", () => {
    const result = loginSchema.safeParse({
      identifier: "198501012010011001",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });

  it("menolak identifier kosong dengan pesan yang sesuai", () => {
    const result = loginSchema.safeParse({
      identifier: "",
      password: "secret123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.identifier).toContain("NIP atau Email wajib diisi");
    }
  });

  it("menolak password kosong dengan pesan yang sesuai", () => {
    const result = loginSchema.safeParse({
      identifier: "admin@smdp.test",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain("Password wajib diisi");
    }
  });

  it("tidak mewajibkan format email karena identifier dapat berupa NIP", () => {
    const result = loginSchema.safeParse({
      identifier: "bukan-email-tapi-identifier",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });
});
