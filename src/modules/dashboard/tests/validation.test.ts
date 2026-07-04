import { describe, expect, it } from "vitest";
import { dashboardChartsUserSchema, dashboardUserSchema } from "../validation";

describe("dashboardUserSchema", () => {
  it("menerima role ADMIN, STAFF, dan EMPLOYEE", () => {
    ["ADMIN", "STAFF", "EMPLOYEE"].forEach((role) => {
      const result = dashboardUserSchema.safeParse({ id: "user-1", role });

      expect(result.success).toBe(true);
    });
  });

  it("menolak id kosong", () => {
    const result = dashboardUserSchema.safeParse({ id: "", role: "ADMIN" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.id).toContain("User ID wajib diisi");
    }
  });

  it("menolak role kosong atau tidak dikenal", () => {
    const emptyRole = dashboardUserSchema.safeParse({ id: "user-1", role: "" });
    const unknownRole = dashboardUserSchema.safeParse({ id: "user-1", role: "MANAGER" });

    expect(emptyRole.success).toBe(false);
    expect(unknownRole.success).toBe(false);
    if (!unknownRole.success) {
      expect(unknownRole.error.flatten().fieldErrors.role).toContain("Role dashboard tidak valid");
    }
  });
});

describe("dashboardChartsUserSchema", () => {
  it("menerima role ADMIN", () => {
    const result = dashboardChartsUserSchema.safeParse({ id: "admin-1", role: "ADMIN" });

    expect(result.success).toBe(true);
  });

  it("menolak role STAFF dan EMPLOYEE", () => {
    ["STAFF", "EMPLOYEE"].forEach((role) => {
      const result = dashboardChartsUserSchema.safeParse({ id: "user-1", role });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.role).toContain("Akses ditolak. Hanya ADMIN.");
      }
    });
  });
});
