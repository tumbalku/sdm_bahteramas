import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getDocumentsSchema } from "@/modules/documents/validation";
import { getDocumentsService } from "@/modules/documents/service";
import { ok, fail } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return fail("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validasi input
    const parseResult = getDocumentsSchema.safeParse(query);
    if (!parseResult.success) {
      // safe to return validation failure message
      return fail("Input tidak valid", 400);
    }

    const actor = {
      id: session.user.id,
      role: session.user.role,
    };

    const documents = await getDocumentsService(parseResult.data, actor);

    return ok(documents);
  } catch (error: unknown) {
    console.error("GET /api/v1/documents Error:", error);
    return fail((error instanceof Error ? error.message : undefined) || "Terjadi kesalahan internal server", 500);
  }
}
