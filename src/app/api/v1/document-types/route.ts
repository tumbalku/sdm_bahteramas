import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import {
  createDocumentTypeService,
  getAllDocumentTypes,
} from "@/modules/document-types/service";
import { DocumentArchiveCategory } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as DocumentArchiveCategory | undefined;
    const professionGroupId = searchParams.get("professionGroupId") || undefined;

    const data = await getAllDocumentTypes({
      category: category || undefined,
      professionGroupId,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data" },
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
    const data = await createDocumentTypeService(body, user);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat jenis dokumen" },
      { status: 400 }
    );
  }
}
