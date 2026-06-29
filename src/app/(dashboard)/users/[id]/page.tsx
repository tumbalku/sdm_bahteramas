import { requireRole } from "@/lib/auth-utils";
import { UserDetailView } from "@/modules/users/components/UserDetailView";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;

  return <UserDetailView userId={id} />;
}
