import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getDocumentByIdService, deleteDocumentService } from "@/modules/documents/service";
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

    return ok(document);
  } catch (error: any) {
    console.error("GET /api/v1/documents/[id] Error:", error);
    const status = error.message.includes("tidak ditemukan")
      ? 404
      : error.message.includes("Akses ditolak")
        ? 403
        : 500;
    return fail(error.message || "Terjadi kesalahan internal server", status);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return fail("Unauthorized", 401);
    }

    const actor = {
      id: session.user.id,
      name: session.user.name || "Unknown",
      role: session.user.role,
    };

    const { id } = await params;
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    await deleteDocumentService(id, actor, ipAddress);

    return ok({ message: "Dokumen berhasil dihapus" });
  } catch (error: any) {
    console.error("DELETE /api/v1/documents/[id] Error:", error);
    const status = error.message.includes("tidak ditemukan")
      ? 404
      : error.message.includes("Akses ditolak") || error.message.includes("Tidak memiliki akses") || error.message.includes("Tidak dapat menghapus")
        ? 403
        : 500;
    return fail(error.message || "Terjadi kesalahan internal server", status);
  }
}
