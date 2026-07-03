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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak. Hanya ADMIN." }, { status: 403 });
    }

    const data = await getDashboardChartsService({
      id: session.user.id,
      role: session.user.role,
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("GET /api/v1/dashboard/charts Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
