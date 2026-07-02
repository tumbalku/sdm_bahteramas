import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { exportUsersCsvService } from "@/modules/users/service";

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
    const filters = {
      search: searchParams.get("search") || undefined,
      professionGroupId: searchParams.get("professionGroupId") || undefined,
      workplaceId: searchParams.get("workplaceId") || undefined,
      employmentStatusId: searchParams.get("employmentStatusId") || undefined,
      employeeGroupId: searchParams.get("employeeGroupId") || undefined,
      employeePositionId: searchParams.get("employeePositionId") || undefined,
    };

    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const result = await exportUsersCsvService(filters, user, ipAddress);

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
