import { Metadata } from "next";
import { requireRole } from "@/lib/auth-utils";
import { UserFormView } from "@/modules/users/components/UserFormView";

export const metadata: Metadata = {
  title: "Edit Data Pegawai | SIMDP",
  description: "Ubah data pegawai dan kualifikasi kepegawaian",
};

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireRole(["ADMIN"]);
  const { id } = await params;

  return (
    <div className="page-container">
      <UserFormView userId={id} />
    </div>
  );
}
