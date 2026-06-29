import { requireRole } from "@/lib/auth-utils";
import { DashboardLayoutClient } from "@/components/DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cek apakah user login dengan salah satu role valid
  const user = await requireRole(["ADMIN", "STAFF", "EMPLOYEE"]);

  return (
    <DashboardLayoutClient user={{ id: user.id, name: user.name, email: user.email, role: user.role }}>
      {children}
    </DashboardLayoutClient>
  );
}
