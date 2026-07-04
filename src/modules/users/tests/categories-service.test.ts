import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";
import { logActivity } from "@/lib/security-log";
import * as repo from "../categories-repository";
import type { AuthUser } from "@/lib/auth-utils";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoriesService,
  updateCategoryService,
} from "../categories-service";

vi.mock("@/lib/security-log", () => ({
  logActivity: vi.fn(),
}));

vi.mock("../categories-repository", () => ({
  findAllCategories: vi.fn(),
  createCategoryItem: vi.fn(),
  updateCategoryItem: vi.fn(),
  deleteCategoryItem: vi.fn(),
}));

const actor: AuthUser = {
  id: "admin-1",
  employeeId: "ADMIN001",
  email: "admin@smdp.test",
  name: "Admin SMDP",
  role: Role.ADMIN,
};

describe("users categories service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logActivity).mockResolvedValue(undefined);
  });

  describe("getCategoriesService", () => {
    it("memanggil repository dan mengembalikan payload kategori", async () => {
      const categories = {
        employmentStatuses: [{ id: "status-1", name: "PNS" }],
        professionGroups: [{ id: "profession-1", name: "Keperawatan" }],
        employeeRanks: [{ id: "rank-1", name: "III/a" }],
        workplaces: [{ id: "workplace-1", name: "Unit Rawat Inap" }],
      };
      vi.mocked(repo.findAllCategories).mockResolvedValue(categories as never);

      const result = await getCategoriesService();

      expect(repo.findAllCategories).toHaveBeenCalledTimes(1);
      expect(result).toBe(categories);
    });
  });

  describe("createCategoryService", () => {
    it("membuat kategori, mengembalikan result, dan mencatat audit ketika actor tersedia", async () => {
      const created = { id: "group-1", name: "PPPK", employmentStatusId: "status-1" };
      vi.mocked(repo.createCategoryItem).mockResolvedValue(created as never);

      const result = await createCategoryService("GROUP", "PPPK", "status-1", actor);

      expect(repo.createCategoryItem).toHaveBeenCalledWith("GROUP", "PPPK", "status-1");
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        eventType: "CATEGORY_CREATED",
        resource: "/api/v1/users/categories",
        status: "success",
        metadata: { type: "GROUP", name: "PPPK", parentId: "status-1" },
      }));
      expect(result).toBe(created);
    });

    it("tidak mencatat audit ketika actor tidak tersedia", async () => {
      const created = { id: "rank-1", name: "III/a" };
      vi.mocked(repo.createCategoryItem).mockResolvedValue(created as never);

      const result = await createCategoryService("RANK", "III/a");

      expect(repo.createCategoryItem).toHaveBeenCalledWith("RANK", "III/a", undefined);
      expect(logActivity).not.toHaveBeenCalled();
      expect(result).toBe(created);
    });

    it("memakai email sebagai actorName ketika actor.name kosong", async () => {
      const created = { id: "workplace-1", name: "Unit Rawat Inap" };
      const actorWithoutName = { ...actor, name: "" };
      vi.mocked(repo.createCategoryItem).mockResolvedValue(created as never);

      await createCategoryService("WORKPLACE", "Unit Rawat Inap", undefined, actorWithoutName);

      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        actorName: "admin@smdp.test",
      }));
    });
  });

  describe("updateCategoryService", () => {
    it("update kategori, mengembalikan result, dan mencatat audit", async () => {
      const updated = { id: "position-1", name: "Perawat Ahli", professionGroupId: "profession-1" };
      vi.mocked(repo.updateCategoryItem).mockResolvedValue(updated as never);

      const result = await updateCategoryService("position-1", "POSITION", "Perawat Ahli", "profession-1", actor);

      expect(repo.updateCategoryItem).toHaveBeenCalledWith("position-1", "POSITION", "Perawat Ahli", "profession-1");
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        actorId: actor.id,
        eventType: "CATEGORY_UPDATED",
        resource: "/api/v1/users/categories/position-1",
        status: "success",
        metadata: { type: "POSITION", name: "Perawat Ahli", parentId: "profession-1" },
      }));
      expect(result).toBe(updated);
    });
  });

  describe("deleteCategoryService", () => {
    it("hapus kategori, mengembalikan result, dan mencatat audit", async () => {
      vi.mocked(repo.deleteCategoryItem).mockResolvedValue(true as never);

      const result = await deleteCategoryService("rank-1", "RANK", actor);

      expect(repo.deleteCategoryItem).toHaveBeenCalledWith("rank-1", "RANK");
      expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({
        actorId: actor.id,
        eventType: "CATEGORY_DELETED",
        resource: "/api/v1/users/categories/rank-1",
        status: "success",
        metadata: { type: "RANK", id: "rank-1" },
      }));
      expect(result).toBe(true);
    });
  });
});
