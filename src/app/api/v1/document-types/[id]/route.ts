import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import {
  deleteDocumentTypeService,
  updateDocumentTypeService,
} from "@/modules/document-types/service";

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
    const data = await updateDocumentTypeService(id, body, user);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengubah jenis dokumen" },
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
    await deleteDocumentTypeService(id, user);

    return NextResponse.json({ success: true, message: "Jenis dokumen berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus jenis dokumen" },
      { status: 400 }
    );
  }
}
