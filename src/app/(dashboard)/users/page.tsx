import { requireRole } from "@/lib/auth-utils";
import { UsersView } from "@/modules/users/components/UsersView";

export default async function UsersPage() {
  // Hanya role ADMIN yang boleh mengakses Halaman Manajemen Pegawai
  await requireRole(["ADMIN"]);

  return <UsersView />;
}
