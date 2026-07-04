import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { canVerifyDocuments } from "@/lib/rbac";
import { rejectDocumentService } from "@/modules/verification/service";
import { rejectDocumentSchema } from "@/modules/verification/validation";

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
    const body = await request.json();

    const parseResult = rejectDocumentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Input tidak valid", errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const actor = {
      id: session.user.id,
      name: session.user.name || "Unknown",
      role: session.user.role,
    };
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    await rejectDocumentService(id, parseResult.data.reviewNote, actor, ipAddress);

    return NextResponse.json({ message: "Dokumen ditolak" });
  } catch (error: any) {
    console.error("POST /api/v1/verification/[id]/reject Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
