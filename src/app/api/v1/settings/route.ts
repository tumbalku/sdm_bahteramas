import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getSettingsService, updateSettingsService } from "@/modules/settings/service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Akses ditolak. Membutuhkan role ADMIN." }, { status: 403 });
    }

    const settings = await getSettingsService();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("GET /api/v1/settings Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Akses ditolak. Membutuhkan role ADMIN." }, { status: 403 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Body request tidak valid" }, { status: 400 });
    }

    await updateSettingsService(
      body,
      { id: user.id, name: user.name || "Admin", role: user.role },
      request.headers.get("x-forwarded-for") || undefined
    );

    return NextResponse.json({ success: true, message: "Pengaturan berhasil diperbarui" });
  } catch (error: any) {
    console.error("PATCH /api/v1/settings Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
