import { DashboardStatsDto } from "./types";
import { isDocumentTypeApplicableToUser } from "@/modules/document-types/service";
import {
  countExpiringDocumentsUntil,
  findDocumentUploadsSince,
  findLatestMandatoryDashboardDocuments,
  findMandatoryDashboardDocumentTypes,
  findMandatoryDashboardEmployees,
  getDashboardStats,
  getExpiringDocuments,
  getRecentDocuments,
  groupDocumentsByStatus,
  groupEmployeesByEmployeeGroup,
  groupEmployeesByEmploymentStatus,
  groupEmployeesByGender,
  groupEmployeesByWorkplace,
} from "./repository";
import { DashboardChartItem, DashboardChartsDto } from "./types";
import {
  addDays,
  buildDocumentUploadCharts,
  formatStatusLabel,
  getLastSixMonths,
  mapGroupedItems,
  normalizeGenderLabel,
} from "./utils";

export async function getDashboardDataService(user: { id: string; role: string }): Promise<DashboardStatsDto> {
  // Hanya ADMIN dan STAFF yang melihat metrik keseluruhan (seluruh pegawai)
  // EMPLOYEE hanya melihat metrik miliknya sendiri
  const ownerId = (user.role === "ADMIN" || user.role === "STAFF") ? undefined : user.id;

  const [stats, expiringDocs, recentDocs] = await Promise.all([
    getDashboardStats(ownerId),
    getExpiringDocuments(ownerId, 30), // Ambang batas 30 hari
    getRecentDocuments(ownerId),
  ]);

  return {
    totalDocuments: stats.total,
    pendingDocuments: stats.pending,
    approvedDocuments: stats.approved,
    rejectedDocuments: stats.rejected,
    expiringCount: expiringDocs.length,
    recentDocuments: recentDocs as any, // Cast to DTO
    expiringDocuments: expiringDocs as any, // Cast to DTO
  };
}

async function buildMissingMandatoryDocumentsTop(): Promise<DashboardChartItem[]> {
  const [employees, documentTypes] = await Promise.all([
    findMandatoryDashboardEmployees(),
    findMandatoryDashboardDocumentTypes(),
  ]);

  const documents = await findLatestMandatoryDashboardDocuments(
    employees.map((employee) => employee.id),
    documentTypes.map((documentType) => documentType.id)
  );

  const existingPairs = new Set<string>();
  documents.forEach((document) => {
    existingPairs.add(`${document.ownerId}:${document.documentTypeId}`);
  });

  const missingCounts = new Map<string, { label: string; value: number }>();

  employees.forEach((employee) => {
    documentTypes.forEach((documentType) => {
      if (!isDocumentTypeApplicableToUser(documentType as any, employee)) return;

      const pairKey = `${employee.id}:${documentType.id}`;
      if (existingPairs.has(pairKey)) return;

      const label = documentType.code || documentType.name;
      const existing = missingCounts.get(documentType.id);
      missingCounts.set(documentType.id, {
        label,
        value: (existing?.value || 0) + 1,
      });
    });
  });

  return [...missingCounts.values()]
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 10);
}

export async function getDashboardChartsService(user: { id: string; role: string }): Promise<DashboardChartsDto> {
  if (user.role !== "ADMIN") {
    throw new Error("Akses ditolak. Hanya ADMIN.");
  }

  const months = getLastSixMonths();
  const since = months[0].start;

  const [
    employmentStatusResult,
    employeeGroupResult,
    genderGroups,
    workplaceResult,
    documentStatusGroups,
    uploads,
    missingMandatoryDocumentsTop,
    expiring30,
    expiring60,
    expiring90,
  ] = await Promise.all([
    groupEmployeesByEmploymentStatus(),
    groupEmployeesByEmployeeGroup(),
    groupEmployeesByGender(),
    groupEmployeesByWorkplace(),
    groupDocumentsByStatus(),
    findDocumentUploadsSince(since),
    buildMissingMandatoryDocumentsTop(),
    countExpiringDocumentsUntil(addDays(30)),
    countExpiringDocumentsUntil(addDays(60)),
    countExpiringDocumentsUntil(addDays(90)),
  ]);

  const employmentStatusNames = new Map(employmentStatusResult.names.map((item) => [item.id, item.name]));
  const employeeGroupNames = new Map(employeeGroupResult.names.map((item) => [item.id, item.name]));
  const workplaceNames = new Map(workplaceResult.names.map((item) => [item.id, item.name]));
  const uploadCharts = buildDocumentUploadCharts(uploads);

  return {
    employeeByEmploymentStatus: mapGroupedItems(
      employmentStatusResult.groups,
      (group) => group.employmentStatusId ? employmentStatusNames.get(group.employmentStatusId) || "Belum Diisi" : "Belum Diisi"
    ),
    employeeByEmployeeGroup: mapGroupedItems(
      employeeGroupResult.groups,
      (group) => group.employeeGroupId ? employeeGroupNames.get(group.employeeGroupId) || "Belum Diisi" : "Belum Diisi",
      10
    ),
    employeeByGender: mapGroupedItems(genderGroups, (group) => normalizeGenderLabel(group.gender)),
    employeeByWorkplace: mapGroupedItems(
      workplaceResult.groups,
      (group) => group.workplaceId ? workplaceNames.get(group.workplaceId) || "Belum Diisi" : "Belum Diisi",
      10
    ),
    documentUploadsByTypeLastSixMonths: uploadCharts.byType,
    documentUploadTypeKeys: uploadCharts.chartKeys,
    monthlyUploadTrend: uploadCharts.trend,
    verificationStatusSummary: mapGroupedItems(documentStatusGroups, (group) => formatStatusLabel(group.status)),
    missingMandatoryDocumentsTop,
    expiringDocumentsSummary: [
      { label: "30 hari", days: 30, value: expiring30 },
      { label: "60 hari", days: 60, value: expiring60 },
      { label: "90 hari", days: 90, value: expiring90 },
    ],
    generatedAt: new Date().toISOString(),
  };
}
