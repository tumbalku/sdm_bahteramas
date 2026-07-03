import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { getDocumentArchiveRecapService } from "@/modules/document-types/service";
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

    const recap = await getDocumentArchiveRecapService(parsed.data);
    return NextResponse.json({ success: true, data: recap });
  } catch (error: any) {
    console.error("GET /api/v1/document-types/archives Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil rekap arsip dokumen" },
      { status: 500 }
    );
  }
}
