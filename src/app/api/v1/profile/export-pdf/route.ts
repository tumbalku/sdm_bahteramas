import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { exportProfilePdfService } from "@/modules/profile/service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const result = await exportProfilePdfService(user, ipAddress);

    return new NextResponse(result.pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/profile/export-pdf Error:", error);
    const message = error.message || "Gagal mengekspor PDF profil";
    const status = message.includes("tidak ditemukan") ? 404 : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
