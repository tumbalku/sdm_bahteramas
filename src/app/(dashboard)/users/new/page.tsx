import { Metadata } from "next";
import { requireRole } from "@/lib/auth-utils";
import { UserFormView } from "@/modules/users/components/UserFormView";

export const metadata: Metadata = {
  title: "Tambah Pegawai Baru | SIMDP",
  description: "Tambahkan data pegawai baru dan kualifikasi kepegawaian",
};

export default async function NewUserPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="page-container">
      <UserFormView />
    </div>
  );
}
