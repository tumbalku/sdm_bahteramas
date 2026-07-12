import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import { importUsersCsvService } from "@/modules/users/service";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Membutuhkan role ADMIN." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "File CSV wajib diunggah" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { success: false, error: "Format file harus CSV" },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const result = await importUsersCsvService(csvText, user, ipAddress);

    return NextResponse.json({ success: result.errorCount === 0, data: result });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : undefined) || "Gagal mengimport pegawai" },
      { status: 400 }
    );
  }
}
