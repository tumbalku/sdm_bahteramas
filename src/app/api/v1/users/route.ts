import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { createUserService, getAllUsers } from "@/modules/users/service";

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
    const search = searchParams.get("search") || undefined;
    const professionGroupId = searchParams.get("professionGroupId") || undefined;
    const workplaceId = searchParams.get("workplaceId") || undefined;
    const employmentStatusId = searchParams.get("employmentStatusId") || undefined;

    const data = await getAllUsers({
      search,
      professionGroupId,
      workplaceId,
      employmentStatusId,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data pegawai" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Membutuhkan role ADMIN." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = await createUserService(body, user);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat pegawai baru" },
      { status: 400 }
    );
  }
}
