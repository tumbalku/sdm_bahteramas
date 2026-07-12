import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { canVerifyDocuments } from "@/lib/rbac";
import { approveDocumentService } from "@/modules/verification/service";
import { ok, fail } from "@/lib/api-response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return fail("Unauthorized", 401);
    }

    if (!canVerifyDocuments(session.user.role)) {
      return fail("Akses ditolak", 403);
    }

    const { id } = await params;
    const actor = {
      id: session.user.id,
      name: session.user.name || "Unknown",
      role: session.user.role,
    };
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    await approveDocumentService(id, actor, ipAddress);

    return ok({ message: "Dokumen berhasil disetujui" });
  } catch (error: unknown) {
    console.error("POST /api/v1/verification/[id]/approve Error:", error);
    return fail((error instanceof Error ? error.message : undefined) || "Terjadi kesalahan internal server", 500);
  }
}
