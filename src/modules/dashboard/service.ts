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
  groupEmployeesByRank,
  groupEmployeesByPosition,
  groupEmployeesByProfessionGroup,
  groupEmployeesByEducation,
  groupEmployeesByReligion,
  groupEmployeesByMaritalStatus,
  getEmployeeBirthDates,
  groupDocumentsByArchiveCategory,
  getDocumentTypesForArchiveGrouping,
  groupEmployeesByGenderAndEmployeeGroup,
  groupEmployeesByGenderAndEmploymentStatus,
} from "./repository";
import { DashboardChartItem, DashboardChartsDto } from "./types";
import {
  addDays,
  buildDocumentUploadCharts,
  formatStatusLabel,
  getLastSixMonths,
  mapGroupedItems,
  normalizeGenderLabel,
  groupEmployeesByAge,
  buildGenderGroupedChart,
} from "./utils";

export async function getDashboardDataService(user: { id: string; role: string }): Promise<DashboardStatsDto> {
  // Semua role melihat personal dashboard yang sama (user-scoped)
  const ownerId = user.id;

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
  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    throw new Error("Akses ditolak. Hanya ADMIN dan STAFF.");
  }

  const months = getLastSixMonths();
  const since = months[0].start;

  const [
    employmentStatusResult,
    employeeGroupResult,
    genderGroups,
    workplaceResult,
    rankResult,
    positionResult,
    professionGroupResult,
    educationGroups,
    religionGroups,
    maritalStatusGroups,
    birthDates,
    documentStatusGroups,
    uploads,
    missingMandatoryDocumentsTop,
    expiring30,
    expiring60,
    expiring90,
    documentsByType,
    documentTypes,
    genderByEmployeeGroupData,
    genderByEmploymentStatusData,
  ] = await Promise.all([
    groupEmployeesByEmploymentStatus(),
    groupEmployeesByEmployeeGroup(),
    groupEmployeesByGender(),
    groupEmployeesByWorkplace(),
    groupEmployeesByRank(),
    groupEmployeesByPosition(),
    groupEmployeesByProfessionGroup(),
    groupEmployeesByEducation(),
    groupEmployeesByReligion(),
    groupEmployeesByMaritalStatus(),
    getEmployeeBirthDates(),
    groupDocumentsByStatus(),
    findDocumentUploadsSince(since),
    buildMissingMandatoryDocumentsTop(),
    countExpiringDocumentsUntil(addDays(30)),
    countExpiringDocumentsUntil(addDays(60)),
    countExpiringDocumentsUntil(addDays(90)),
    groupDocumentsByArchiveCategory(),
    getDocumentTypesForArchiveGrouping(),
    groupEmployeesByGenderAndEmployeeGroup(),
    groupEmployeesByGenderAndEmploymentStatus(),
  ]);

  const employmentStatusNames = new Map(employmentStatusResult.names.map((item) => [item.id, item.name]));
  const employeeGroupNames = new Map(employeeGroupResult.names.map((item) => [item.id, item.name]));
  const workplaceNames = new Map(workplaceResult.names.map((item) => [item.id, item.name]));
  const rankNames = new Map(rankResult.names.map((item) => [item.id, item.name]));
  const positionNames = new Map(positionResult.names.map((item) => [item.id, item.name]));
  const professionGroupNames = new Map(professionGroupResult.names.map((item) => [item.id, item.name]));
  const uploadCharts = buildDocumentUploadCharts(uploads);

  // Group documents by archive category
  const archiveCategoryMap = new Map<string, string>();
  documentTypes.forEach((dt) => {
    archiveCategoryMap.set(dt.id, dt.archiveCategory);
  });

  const archiveCategoryCounts = new Map<string, number>();
  documentsByType.forEach((group) => {
    const category = archiveCategoryMap.get(group.documentTypeId) || "LAINNYA";
    archiveCategoryCounts.set(category, (archiveCategoryCounts.get(category) || 0) + group._count.id);
  });

  const documentsByArchiveCategory: DashboardChartItem[] = [
    { label: "UTAMA", value: archiveCategoryCounts.get("UTAMA") || 0 },
    { label: "KONDISIONAL", value: archiveCategoryCounts.get("KONDISIONAL") || 0 },
    { label: "PROFESI", value: archiveCategoryCounts.get("PROFESI") || 0 },
  ];

  return {
    employeeByEmploymentStatus: mapGroupedItems(
      employmentStatusResult.groups,
      (group) => (group.employmentStatusId ? employmentStatusNames.get(group.employmentStatusId) || "Belum Diisi" : "Belum Diisi")
    ),
    employeeByEmployeeGroup: mapGroupedItems(
      employeeGroupResult.groups,
      (group) => (group.employeeGroupId ? employeeGroupNames.get(group.employeeGroupId) || "Belum Diisi" : "Belum Diisi"),
      10
    ),
    employeeByGender: mapGroupedItems(genderGroups, (group) => normalizeGenderLabel(group.gender)),
    employeeByWorkplace: mapGroupedItems(
      workplaceResult.groups,
      (group) => (group.workplaceId ? workplaceNames.get(group.workplaceId) || "Belum Diisi" : "Belum Diisi"),
      10
    ),
    employeeByRank: mapGroupedItems(
      rankResult.groups,
      (group) => (group.employeeRankId ? rankNames.get(group.employeeRankId) || "Belum Diisi" : "Belum Diisi"),
      10
    ),
    employeeByPosition: mapGroupedItems(
      positionResult.groups,
      (group) => (group.employeePositionId ? positionNames.get(group.employeePositionId) || "Belum Diisi" : "Belum Diisi"),
      10
    ),
    employeeByProfessionGroup: mapGroupedItems(
      professionGroupResult.groups,
      (group) => (group.professionGroupId ? professionGroupNames.get(group.professionGroupId) || "Belum Diisi" : "Belum Diisi")
    ),
    employeeByEducation: mapGroupedItems(educationGroups, (group) => group.lastEducation || "Belum Diisi"),
    employeeByReligion: mapGroupedItems(religionGroups, (group) => group.religion || "Belum Diisi"),
    employeeByMaritalStatus: mapGroupedItems(maritalStatusGroups, (group) => group.maritalStatus || "Belum Diisi"),
    employeeByAgeGroup: groupEmployeesByAge(birthDates),
    employeeByGenderAndEmployeeGroup: buildGenderGroupedChart(
      genderByEmployeeGroupData.employees as any,
      genderByEmployeeGroupData.groupNameMap,
      "employeeGroupId"
    ),
    employeeByGenderAndEmploymentStatus: buildGenderGroupedChart(
      genderByEmploymentStatusData.employees as any,
      genderByEmploymentStatusData.statusNameMap,
      "employmentStatusId"
    ),
    documentsByArchiveCategory,
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
