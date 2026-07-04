import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { createUserSchema, updateUserSchema } from "../validation";

const validCreateUserInput = {
  employeeId: "198501012010011001",
  email: "pegawai@smdp.test",
  password: "secret123",
  name: "Budi Santoso",
  role: Role.EMPLOYEE,
  hasTmt: false,
};

describe("createUserSchema", () => {
  it("menerima data user baru yang valid", () => {
    const result = createUserSchema.safeParse(validCreateUserInput);

    expect(result.success).toBe(true);
  });

  it("menolak email yang tidak valid", () => {
    const result = createUserSchema.safeParse({
      ...validCreateUserInput,
      email: "email-tidak-valid",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain("Format email tidak valid");
    }
  });

  it("menolak employeeId kurang dari 3 karakter", () => {
    const result = createUserSchema.safeParse({
      ...validCreateUserInput,
      employeeId: "12",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.employeeId).toContain("NIP / ID Pegawai minimal 3 karakter");
    }
  });

  it("menolak nama kurang dari 2 karakter", () => {
    const result = createUserSchema.safeParse({
      ...validCreateUserInput,
      name: "A",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain("Nama lengkap minimal 2 karakter");
    }
  });

  it("menolak password kurang dari 6 karakter ketika diisi", () => {
    const result = createUserSchema.safeParse({
      ...validCreateUserInput,
      password: "12345",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain("Password minimal 6 karakter");
    }
  });

  it("menerima password kosong sebagai input opsional", () => {
    const result = createUserSchema.safeParse({
      ...validCreateUserInput,
      password: "",
    });

    expect(result.success).toBe(true);
  });

  it("menerima TMT valid ketika hasTmt true", () => {
    const result = createUserSchema.safeParse({
      ...validCreateUserInput,
      hasTmt: true,
      tmtStartDate: "2026-07-01",
      tmtEndDate: "2026-12-31",
    });

    expect(result.success).toBe(true);
  });

  it("menerima TMT tanpa tanggal akhir sebagai pegawai tetap", () => {
    const result = createUserSchema.safeParse({
      ...validCreateUserInput,
      hasTmt: true,
      tmtStartDate: "2026-07-01",
      tmtEndDate: null,
    });

    expect(result.success).toBe(true);
  });

  it("menolak TMT akhir yang lebih awal dari TMT mulai", () => {
    const result = createUserSchema.safeParse({
      ...validCreateUserInput,
      hasTmt: true,
      tmtStartDate: "2026-07-01",
      tmtEndDate: "2026-06-30",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.tmtEndDate).toContain(
        "Tanggal akhir TMT tidak boleh lebih awal dari tanggal mulai TMT",
      );
    }
  });

  it("menolak format tanggal TMT yang tidak valid ketika kedua tanggal diisi", () => {
    const result = createUserSchema.safeParse({
      ...validCreateUserInput,
      hasTmt: true,
      tmtStartDate: "tanggal-salah",
      tmtEndDate: "2026-12-31",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.tmtStartDate).toContain("Tanggal mulai TMT tidak valid");
    }
  });
});

describe("updateUserSchema", () => {
  it("menerima payload partial", () => {
    const result = updateUserSchema.safeParse({ name: "Nama Baru" });

    expect(result.success).toBe(true);
  });

  it("menerima payload kosong", () => {
    const result = updateUserSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("tetap menjalankan validasi TMT ketika hasTmt true", () => {
    const result = updateUserSchema.safeParse({
      hasTmt: true,
      tmtStartDate: "2026-07-01",
      tmtEndDate: "2026-06-30",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.tmtEndDate).toContain(
        "Tanggal akhir TMT tidak boleh lebih awal dari tanggal mulai TMT",
      );
    }
  });
});
