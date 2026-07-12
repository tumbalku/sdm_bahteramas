import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { exportUserProfilePdfService } from "@/modules/users/service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Membutuhkan role ADMIN." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const result = await exportUserProfilePdfService(id, user, ipAddress);

    return new NextResponse(result.pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/users/[id]/profile/export-pdf Error:", error);
    const message = error.message || "Gagal mengekspor PDF profil pegawai";
    const status = message.includes("tidak ditemukan") ? 404 : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
