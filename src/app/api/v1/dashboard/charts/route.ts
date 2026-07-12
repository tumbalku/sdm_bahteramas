import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getDashboardChartsService } from "@/modules/dashboard/service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      return NextResponse.json({ message: "Akses ditolak. Hanya ADMIN dan STAFF." }, { status: 403 });
    }

    const data = await getDashboardChartsService({
      id: session.user.id,
      role: session.user.role,
    });

    return NextResponse.json({ data });
  } catch (error: unknown) {
    console.error("GET /api/v1/dashboard/charts Error:", error);
    return NextResponse.json(
      { message: (error instanceof Error ? error.message : undefined) || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
