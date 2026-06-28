import { DashboardStatsDto } from "./types";
import { getDashboardStats, getExpiringDocuments, getRecentDocuments } from "./repository";

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
