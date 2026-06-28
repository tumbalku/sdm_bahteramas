import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getDocumentVerificationHistoryService } from "@/modules/verification/service";
import { findDocumentById } from "@/modules/documents/repository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const document = await findDocumentById(id);

    if (!document) {
      return NextResponse.json({ message: "Dokumen tidak ditemukan" }, { status: 404 });
    }

    // RBAC: EMPLOYEE hanya bisa melihat history dokumen miliknya sendiri
    if (session.user.role === "EMPLOYEE" && document.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const history = await getDocumentVerificationHistoryService(id);
    return NextResponse.json(history);
  } catch (error: any) {
    console.error("GET /api/v1/verification/document/[id] Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
