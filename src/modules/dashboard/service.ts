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
import {
  DashboardChartItem,
  DashboardChartsDto,
  DashboardMonthlyUploadByType,
  DashboardUploadTrendItem,
} from "./types";

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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

function getLastSixMonths(referenceDate = new Date()) {
  const months: { key: string; label: string; start: Date }[] = [];
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 5, 1);

  for (let index = 0; index < 6; index += 1) {
    const month = new Date(start.getFullYear(), start.getMonth() + index, 1);
    months.push({
      key: getMonthKey(month),
      label: getMonthLabel(month),
      start: month,
    });
  }

  return months;
}

function mapGroupedItems<T extends { _count: { id: number } }>(
  groups: T[],
  getLabel: (group: T) => string,
  limit?: number
): DashboardChartItem[] {
  const items = groups
    .map((group) => ({
      label: getLabel(group),
      value: group._count.id,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  if (!limit || items.length <= limit) {
    return items;
  }

  const visible = items.slice(0, limit);
  const otherTotal = items.slice(limit).reduce((sum, item) => sum + item.value, 0);

  return otherTotal > 0 ? [...visible, { label: "Lainnya", value: otherTotal }] : visible;
}

function normalizeGenderLabel(gender?: string | null) {
  const normalized = gender?.trim().toUpperCase();
  if (normalized === "L") return "Laki-laki";
  if (normalized === "P") return "Perempuan";
  return "Belum Diisi";
}

function formatStatusLabel(status: string) {
  if (status === "APPROVED") return "Disetujui";
  if (status === "REJECTED") return "Ditolak";
  return "Menunggu";
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function buildDocumentUploadCharts(uploads: Awaited<ReturnType<typeof findDocumentUploadsSince>>) {
  const months = getLastSixMonths();
  const monthKeySet = new Set(months.map((month) => month.key));
  const countsByType = new Map<string, number>();

  uploads.forEach((upload) => {
    const key = upload.documentType.code || upload.documentType.name;
    countsByType.set(key, (countsByType.get(key) || 0) + 1);
  });

  const topTypeKeys = [...countsByType.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([key]) => key);
  const topTypeSet = new Set(topTypeKeys);
  const hasOther = [...countsByType.keys()].some((key) => !topTypeSet.has(key));
  const chartKeys = hasOther ? [...topTypeKeys, "Lainnya"] : topTypeKeys;

  const uploadsByMonth = new Map<string, Record<string, number>>();
  const uploadTrendMap = new Map<string, number>();

  months.forEach((month) => {
    uploadsByMonth.set(month.key, {});
    uploadTrendMap.set(month.key, 0);
  });

  uploads.forEach((upload) => {
    const monthKey = getMonthKey(upload.uploadedAt);
    if (!monthKeySet.has(monthKey)) return;

    const rawTypeKey = upload.documentType.code || upload.documentType.name;
    const typeKey = topTypeSet.has(rawTypeKey) ? rawTypeKey : "Lainnya";
    const monthValues = uploadsByMonth.get(monthKey) || {};

    monthValues[typeKey] = (monthValues[typeKey] || 0) + 1;
    uploadsByMonth.set(monthKey, monthValues);
    uploadTrendMap.set(monthKey, (uploadTrendMap.get(monthKey) || 0) + 1);
  });

  const byType: DashboardMonthlyUploadByType[] = months.map((month) => {
    const values = uploadsByMonth.get(month.key) || {};
    const row: DashboardMonthlyUploadByType = { month: month.label };

    chartKeys.forEach((key) => {
      row[key] = values[key] || 0;
    });

    return row;
  });

  const trend: DashboardUploadTrendItem[] = months.map((month) => ({
    month: month.label,
    total: uploadTrendMap.get(month.key) || 0,
  }));

  return { byType, trend, chartKeys };
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
