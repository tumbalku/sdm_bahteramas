import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { canVerifyDocuments } from "@/lib/rbac";
import { getDocumentVerificationHistoryService } from "@/modules/verification/service";
import { getDocumentByIdService } from "@/modules/documents/service";
import { ok, fail } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return fail("Unauthorized", 401);
    }

    const { id } = await params;
    const actor = { id: session.user.id, role: session.user.role };
    const document = await getDocumentByIdService(id, actor);

    if (!canVerifyDocuments(session.user.role) && document.ownerId !== session.user.id) {
      return fail("Akses ditolak", 403);
    }

    const history = await getDocumentVerificationHistoryService(id);
    return ok(history);
  } catch (error: unknown) {
    console.error("GET /api/v1/verification/document/[id] Error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal server";
    const status = message.includes("tidak ditemukan")
      ? 404
      : message.includes("Akses ditolak")
        ? 403
        : 500;
    return fail(message, status);
  }
}
