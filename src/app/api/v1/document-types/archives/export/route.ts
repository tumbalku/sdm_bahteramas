import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { exportDocumentArchiveRecapService } from "@/modules/document-types/service";
import { documentArchiveFilterSchema } from "@/modules/document-types/validation";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Membutuhkan role ADMIN." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = documentArchiveFilterSchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Input tidak valid", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const result = await exportDocumentArchiveRecapService(parsed.data, user, ipAddress);

    return new NextResponse(result.content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/v1/document-types/archives/export Error:", error);
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : undefined) || "Gagal mengekspor rekap arsip dokumen" },
      { status: 500 }
    );
  }
}
