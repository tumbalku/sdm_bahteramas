import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { createUserService, getAllUsers } from "@/modules/users/service";
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

    const data = await getAllUsers(parsed.data);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : undefined) || "Gagal mengambil data pegawai" },
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
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : undefined) || "Gagal membuat pegawai baru" },
      { status: 400 }
    );
  }
}
