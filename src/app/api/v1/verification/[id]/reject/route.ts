import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { canVerifyDocuments } from "@/lib/rbac";
import { rejectDocumentService } from "@/modules/verification/service";
import { rejectDocumentSchema } from "@/modules/verification/validation";
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
    const body = await request.json();

    const parseResult = rejectDocumentSchema.safeParse(body);
    if (!parseResult.success) {
      return fail("Input tidak valid", 400);
    }

    const actor = {
      id: session.user.id,
      name: session.user.name || "Unknown",
      role: session.user.role,
    };
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    await rejectDocumentService(id, parseResult.data.reviewNote, actor, ipAddress);

    return ok({ message: "Dokumen ditolak" });
  } catch (error: unknown) {
    console.error("POST /api/v1/verification/[id]/reject Error:", error);
    return fail((error instanceof Error ? error.message : undefined) || "Terjadi kesalahan internal server", 500);
  }
}
