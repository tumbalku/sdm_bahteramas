import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { canVerifyDocuments } from "@/lib/rbac";
import { getPendingDocumentsService } from "@/modules/verification/service";
import { ok, fail } from "@/lib/api-response";

// Verification API Route
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return fail("Unauthorized", 401);
    }

    if (!canVerifyDocuments(session.user.role)) {
      return fail("Akses ditolak", 403);
    }

    const actor = {
      id: session.user.id,
      role: session.user.role,
    };

    const documents = await getPendingDocumentsService(actor);
    return ok(documents);
  } catch (error: unknown) {
    console.error("GET /api/v1/verification Error:", error);
    return fail((error instanceof Error ? error.message : undefined) || "Terjadi kesalahan internal server", 500);
  }
}
