import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { findDocumentById } from "@/modules/documents/repository";
import { deleteDocumentService } from "@/modules/documents/service";

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

    // RBAC: EMPLOYEE hanya bisa melihat dokumennya sendiri
    if (session.user.role === "EMPLOYEE" && document.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    return NextResponse.json(document);
  } catch (error: any) {
    console.error("GET /api/v1/documents/[id] Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const actor = {
      id: session.user.id,
      name: session.user.name || "Unknown",
      role: session.user.role,
    };
    
    const { id } = await params;
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    await deleteDocumentService(id, actor, ipAddress);

    return NextResponse.json({ message: "Dokumen berhasil dihapus" });
  } catch (error: any) {
    console.error("DELETE /api/v1/documents/[id] Error:", error);
    const status = error.message.includes("tidak ditemukan") ? 404 : 403;
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status }
    );
  }
}
