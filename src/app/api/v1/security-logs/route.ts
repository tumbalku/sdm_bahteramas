import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getSecurityLogsService } from "@/modules/security-logs/service";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak. Hanya ADMIN." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const actorId = searchParams.get("actorId") || undefined;
    const eventType = searchParams.get("eventType") || undefined;

    const logs = await getSecurityLogsService({
      startDate,
      endDate,
      actorId,
      eventType,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("GET /api/v1/security-logs Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
