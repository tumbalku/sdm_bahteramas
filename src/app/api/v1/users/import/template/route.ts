import { NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { getUsersImportTemplateCsv } from "@/modules/users/service";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Membutuhkan role ADMIN." },
        { status: 403 }
      );
    }

    const csv = getUsersImportTemplateCsv();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="smdp-users-import-template.csv"',
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : undefined) || "Gagal membuat template import" },
      { status: 500 }
    );
  }
}
