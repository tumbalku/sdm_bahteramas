import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { canVerifyDocuments } from "@/lib/rbac";
import { approveDocumentService } from "@/modules/verification/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!canVerifyDocuments(session.user.role)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const actor = {
      id: session.user.id,
      name: session.user.name || "Unknown",
      role: session.user.role,
    };
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    await approveDocumentService(id, actor, ipAddress);

    return NextResponse.json({ message: "Dokumen berhasil disetujui" });
  } catch (error: any) {
    console.error("POST /api/v1/verification/[id]/approve Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
