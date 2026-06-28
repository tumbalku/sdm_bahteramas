import { requireRole } from "@/lib/auth-utils";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cek apakah user login dengan salah satu role valid
  const user = await requireRole(["ADMIN", "STAFF", "EMPLOYEE"]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar userName={user.name} userRole={user.role} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
