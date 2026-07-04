import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isDocumentTypeApplicableToUser } from "@/modules/document-types/service";
import * as repo from "../repository";
import { getDashboardChartsService, getDashboardDataService } from "../service";

vi.mock("@/modules/document-types/service", () => ({
  isDocumentTypeApplicableToUser: vi.fn(),
}));

vi.mock("../repository", () => ({
  countExpiringDocumentsUntil: vi.fn(),
  findDocumentUploadsSince: vi.fn(),
  findLatestMandatoryDashboardDocuments: vi.fn(),
  findMandatoryDashboardDocumentTypes: vi.fn(),
  findMandatoryDashboardEmployees: vi.fn(),
  getDashboardStats: vi.fn(),
  getExpiringDocuments: vi.fn(),
  getRecentDocuments: vi.fn(),
  groupDocumentsByStatus: vi.fn(),
  groupEmployeesByEmployeeGroup: vi.fn(),
  groupEmployeesByEmploymentStatus: vi.fn(),
  groupEmployeesByGender: vi.fn(),
  groupEmployeesByWorkplace: vi.fn(),
}));

describe("dashboard service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-04T00:00:00.000Z"));
    vi.mocked(isDocumentTypeApplicableToUser).mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getDashboardDataService", () => {
    beforeEach(() => {
      vi.mocked(repo.getDashboardStats).mockResolvedValue({
        total: 10,
        pending: 2,
        approved: 7,
        rejected: 1,
      });
      vi.mocked(repo.getExpiringDocuments).mockResolvedValue([{ id: "doc-expiring" }] as never);
      vi.mocked(repo.getRecentDocuments).mockResolvedValue([{ id: "doc-recent" }] as never);
    });

    it("ADMIN dan STAFF melihat statistik keseluruhan", async () => {
      await getDashboardDataService({ id: "admin-1", role: "ADMIN" });
      await getDashboardDataService({ id: "staff-1", role: "STAFF" });

      expect(repo.getDashboardStats).toHaveBeenNthCalledWith(1, undefined);
      expect(repo.getDashboardStats).toHaveBeenNthCalledWith(2, undefined);
      expect(repo.getExpiringDocuments).toHaveBeenNthCalledWith(1, undefined, 30);
      expect(repo.getRecentDocuments).toHaveBeenNthCalledWith(1, undefined);
    });

    it("EMPLOYEE hanya melihat statistik milik sendiri dan mengembalikan DTO", async () => {
      const result = await getDashboardDataService({ id: "employee-1", role: "EMPLOYEE" });

      expect(repo.getDashboardStats).toHaveBeenCalledWith("employee-1");
      expect(repo.getExpiringDocuments).toHaveBeenCalledWith("employee-1", 30);
      expect(repo.getRecentDocuments).toHaveBeenCalledWith("employee-1");
      expect(result).toEqual({
        totalDocuments: 10,
        pendingDocuments: 2,
        approvedDocuments: 7,
        rejectedDocuments: 1,
        expiringCount: 1,
        recentDocuments: [{ id: "doc-recent" }],
        expiringDocuments: [{ id: "doc-expiring" }],
      });
    });

    it("membiarkan error repository bubble", async () => {
      vi.mocked(repo.getDashboardStats).mockRejectedValue(new Error("Stats failed"));

      await expect(getDashboardDataService({ id: "admin-1", role: "ADMIN" })).rejects.toThrow("Stats failed");
    });
  });

  describe("getDashboardChartsService", () => {
    function mockChartRepositories() {
      vi.mocked(repo.groupEmployeesByEmploymentStatus).mockResolvedValue({
        groups: [
          { employmentStatusId: "status-1", _count: { id: 3 } },
          { employmentStatusId: null, _count: { id: 1 } },
        ],
        names: [{ id: "status-1", name: "PNS" }],
      } as never);
      vi.mocked(repo.groupEmployeesByEmployeeGroup).mockResolvedValue({
        groups: [{ employeeGroupId: "group-1", _count: { id: 2 } }],
        names: [{ id: "group-1", name: "PPPK" }],
      } as never);
      vi.mocked(repo.groupEmployeesByGender).mockResolvedValue([
        { gender: "L", _count: { id: 4 } },
        { gender: null, _count: { id: 1 } },
      ] as never);
      vi.mocked(repo.groupEmployeesByWorkplace).mockResolvedValue({
        groups: [{ workplaceId: "workplace-1", _count: { id: 2 } }],
        names: [{ id: "workplace-1", name: "Unit Rawat Inap" }],
      } as never);
      vi.mocked(repo.groupDocumentsByStatus).mockResolvedValue([
        { status: "APPROVED", _count: { id: 5 } },
        { status: "PENDING", _count: { id: 2 } },
      ] as never);
      vi.mocked(repo.findDocumentUploadsSince).mockResolvedValue([
        { uploadedAt: new Date("2026-07-01T00:00:00.000Z"), documentTypeId: "type-1", documentType: { code: "KTP", name: "KTP" } },
      ] as never);
      vi.mocked(repo.findMandatoryDashboardEmployees).mockResolvedValue([
        {
          id: "employee-1",
          employmentStatusId: "status-1",
          employeeGroupId: "group-1",
          professionGroupId: null,
          employeeRankId: null,
          workplaceId: "workplace-1",
        },
        {
          id: "employee-2",
          employmentStatusId: "status-1",
          employeeGroupId: "group-1",
          professionGroupId: null,
          employeeRankId: null,
          workplaceId: "workplace-1",
        },
      ] as never);
      vi.mocked(repo.findMandatoryDashboardDocumentTypes).mockResolvedValue([
        { id: "type-1", code: "KTP", name: "KTP" },
        { id: "type-2", code: "KK", name: "Kartu Keluarga" },
      ] as never);
      vi.mocked(repo.findLatestMandatoryDashboardDocuments).mockResolvedValue([
        { ownerId: "employee-1", documentTypeId: "type-1", uploadedAt: new Date(), updatedAt: new Date() },
      ] as never);
      vi.mocked(repo.countExpiringDocumentsUntil)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3);
    }

    it("menolak akses selain ADMIN dan tidak memanggil repository chart", async () => {
      await expect(getDashboardChartsService({ id: "staff-1", role: "STAFF" })).rejects.toThrow("Akses ditolak. Hanya ADMIN.");
      await expect(getDashboardChartsService({ id: "employee-1", role: "EMPLOYEE" })).rejects.toThrow("Akses ditolak. Hanya ADMIN.");

      expect(repo.groupEmployeesByEmploymentStatus).not.toHaveBeenCalled();
      expect(repo.findDocumentUploadsSince).not.toHaveBeenCalled();
    });

    it("menghasilkan dashboard chart DTO untuk ADMIN", async () => {
      mockChartRepositories();

      const result = await getDashboardChartsService({ id: "admin-1", role: "ADMIN" });

      expect(repo.findDocumentUploadsSince).toHaveBeenCalledWith(new Date(2026, 1, 1));
      expect(repo.countExpiringDocumentsUntil).toHaveBeenNthCalledWith(1, new Date("2026-08-03T00:00:00.000Z"));
      expect(repo.countExpiringDocumentsUntil).toHaveBeenNthCalledWith(2, new Date("2026-09-02T00:00:00.000Z"));
      expect(repo.countExpiringDocumentsUntil).toHaveBeenNthCalledWith(3, new Date("2026-10-02T00:00:00.000Z"));
      expect(result.employeeByEmploymentStatus).toEqual([
        { label: "PNS", value: 3 },
        { label: "Belum Diisi", value: 1 },
      ]);
      expect(result.employeeByGender).toEqual([
        { label: "Laki-laki", value: 4 },
        { label: "Belum Diisi", value: 1 },
      ]);
      expect(result.verificationStatusSummary).toEqual([
        { label: "Disetujui", value: 5 },
        { label: "Menunggu", value: 2 },
      ]);
      expect(result.documentUploadTypeKeys).toEqual(["KTP"]);
      expect(result.expiringDocumentsSummary).toEqual([
        { label: "30 hari", days: 30, value: 1 },
        { label: "60 hari", days: 60, value: 2 },
        { label: "90 hari", days: 90, value: 3 },
      ]);
      expect(result.generatedAt).toBe("2026-07-04T00:00:00.000Z");
    });

    it("menghitung top dokumen wajib yang belum upload sesuai applicability dan existing pair", async () => {
      mockChartRepositories();
      vi.mocked(isDocumentTypeApplicableToUser).mockImplementation((documentType: any) => documentType.id !== "type-2");

      const result = await getDashboardChartsService({ id: "admin-1", role: "ADMIN" });

      expect(repo.findLatestMandatoryDashboardDocuments).toHaveBeenCalledWith(
        ["employee-1", "employee-2"],
        ["type-1", "type-2"],
      );
      expect(result.missingMandatoryDocumentsTop).toEqual([{ label: "KTP", value: 1 }]);
    });

    it("membiarkan error repository bubble", async () => {
      vi.mocked(repo.groupEmployeesByEmploymentStatus).mockRejectedValue(new Error("Chart failed"));

      await expect(getDashboardChartsService({ id: "admin-1", role: "ADMIN" })).rejects.toThrow("Chart failed");
    });
  });
});
