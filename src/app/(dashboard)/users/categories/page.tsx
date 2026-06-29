import { Metadata } from "next";
import { requireRole } from "@/lib/auth-utils";
import { CategoriesView } from "@/modules/users/components/CategoriesView";

export const metadata: Metadata = {
  title: "Master Kategori Pegawai | SIMDP",
  description: "Kelola status kepegawaian, kelompok profesi, jabatan, dan tempat tugas",
};

export default async function UserCategoriesPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="page-container">
      <CategoriesView />
    </div>
  );
}
