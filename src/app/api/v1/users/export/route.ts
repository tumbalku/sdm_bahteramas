import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { exportUsersCsvService } from "@/modules/users/service";
import { userFilterSchema } from "@/modules/users/validation";

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
    const parsed = userFilterSchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Input tidak valid", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const result = await exportUsersCsvService(parsed.data, user, ipAddress);

    return new NextResponse(result.csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengekspor data pegawai" },
      { status: 500 }
    );
  }
}
