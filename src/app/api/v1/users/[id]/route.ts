import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { deleteUserService, updateUserService, getUserById } from "@/modules/users/service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Membutuhkan role ADMIN." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await getUserById(id);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Data pegawai tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : undefined) || "Gagal mengambil data pegawai" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Membutuhkan role ADMIN." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const data = await updateUserService(id, body, user);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : undefined) || "Gagal meng-update pegawai" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Membutuhkan role ADMIN." },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deleteUserService(id, user);

    return NextResponse.json({ success: true, message: "Pegawai berhasil dihapus" });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : undefined) || "Gagal menghapus pegawai" },
      { status: 400 }
    );
  }
}
