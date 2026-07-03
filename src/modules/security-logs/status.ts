export type SecurityLogStatus = "success" | "failed";

const SUCCESS_VALUES = new Set(["success", "sukses", "berhasil", "ok"]);
const FAILED_VALUES = new Set(["failed", "fail", "failure", "gagal", "error"]);

export function normalizeSecurityLogStatus(status?: string | null): SecurityLogStatus {
  const normalizedStatus = status?.trim().toLowerCase();

  if (!normalizedStatus) {
    return "success";
  }

  if (SUCCESS_VALUES.has(normalizedStatus)) {
    return "success";
  }

  if (FAILED_VALUES.has(normalizedStatus)) {
    return "failed";
  }

  return "success";
}

export function getSecurityLogStatusLabel(status?: string | null) {
  return normalizeSecurityLogStatus(status) === "success" ? "Sukses" : "Gagal";
}
