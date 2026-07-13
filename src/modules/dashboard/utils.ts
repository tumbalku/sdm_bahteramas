import type {
  DashboardChartItem,
  DashboardGroupedChartItem,
  DashboardMonthlyUploadByType,
  DashboardUploadTrendItem,
} from "./types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export interface DashboardUploadRecord {
  uploadedAt: Date;
  documentType: {
    code?: string | null;
    name: string;
  };
}

export function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthLabel(date: Date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

export function getLastSixMonths(referenceDate = new Date()) {
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

export function mapGroupedItems<T extends { _count: { id: number } }>(
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

export function normalizeGenderLabel(gender?: string | null) {
  const normalized = gender?.trim().toUpperCase();
  if (normalized === "L") return "Laki-laki";
  if (normalized === "P") return "Perempuan";
  return "Belum Diisi";
}

export function formatStatusLabel(status: string) {
  if (status === "APPROVED") return "Disetujui";
  if (status === "REJECTED") return "Ditolak";
  return "Menunggu";
}

export function addDays(days: number, referenceDate = new Date()) {
  const date = new Date(referenceDate);
  date.setDate(date.getDate() + days);
  return date;
}

export function buildDocumentUploadCharts(uploads: DashboardUploadRecord[], referenceDate = new Date()) {
  const months = getLastSixMonths(referenceDate);
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

export function calculateAge(birthDate: Date, referenceDate = new Date()): number {
  const age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  const dayDiff = referenceDate.getDate() - birthDate.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return age - 1;
  }
  
  return age;
}

export function getAgeGroup(age: number): string {
  if (age < 20) return "< 20 tahun";
  if (age < 30) return "20-29 tahun";
  if (age < 40) return "30-39 tahun";
  if (age < 50) return "40-49 tahun";
  if (age < 60) return "50-59 tahun";
  return "≥ 60 tahun";
}

export function groupEmployeesByAge(birthDates: Array<{ birthDate: Date | null }>, referenceDate = new Date()): DashboardChartItem[] {
  const ageCounts = new Map<string, number>();
  const ageOrder = ["< 20 tahun", "20-29 tahun", "30-39 tahun", "40-49 tahun", "50-59 tahun", "≥ 60 tahun"];
  
  ageOrder.forEach((group) => ageCounts.set(group, 0));
  
  birthDates.forEach((record) => {
    if (!record.birthDate) return;
    const age = calculateAge(record.birthDate, referenceDate);
    const group = getAgeGroup(age);
    ageCounts.set(group, (ageCounts.get(group) || 0) + 1);
  });
  
  return ageOrder.map((label) => ({ label, value: ageCounts.get(label) || 0 }));
}

export function buildGenderGroupedChart(
  employees: Array<{ gender: string | null; employeeGroupId?: string | null; employmentStatusId?: string | null }>,
  groupNameMap: Map<string, string>,
  groupIdKey: "employeeGroupId" | "employmentStatusId"
): DashboardGroupedChartItem[] {
  const categoryMap = new Map<string, { "Laki-laki": number; Perempuan: number; "Belum Diisi": number }>();

  employees.forEach((emp) => {
    const groupId = groupIdKey === "employeeGroupId" ? emp.employeeGroupId : emp.employmentStatusId;
    const categoryName = groupId ? groupNameMap.get(groupId) || "Belum Diisi" : "Belum Diisi";
    const genderLabel = normalizeGenderLabel(emp.gender);

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, { "Laki-laki": 0, Perempuan: 0, "Belum Diisi": 0 });
    }

    const counts = categoryMap.get(categoryName)!;
    counts[genderLabel as "Laki-laki" | "Perempuan" | "Belum Diisi"] += 1;
  });

  return Array.from(categoryMap.entries())
    .map(([category, counts]) => ({
      category,
      "Laki-laki": counts["Laki-laki"],
      Perempuan: counts.Perempuan,
      "Belum Diisi": counts["Belum Diisi"],
    }))
    .sort((a, b) => {
      const totalA = a["Laki-laki"] + a.Perempuan + a["Belum Diisi"];
      const totalB = b["Laki-laki"] + b.Perempuan + b["Belum Diisi"];
      return totalB - totalA;
    })
    .slice(0, 8);
}
