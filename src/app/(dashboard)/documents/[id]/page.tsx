import { requireRole } from "@/lib/auth-utils";
import { DocumentDetailView } from "@/modules/documents/components/DocumentDetailView";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "STAFF", "EMPLOYEE"]);
  const { id } = await params;

  return <DocumentDetailView documentId={id} />;
}
