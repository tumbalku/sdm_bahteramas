import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json({ message: "Parameter file wajib diisi" }, { status: 400 });
    }

    // Cari metadata dokumen di database untuk cek RBAC
    const document = await prisma.documentRecord.findFirst({
      where: { filePath: fileName },
    });

    if (!document) {
      return NextResponse.json({ message: "Dokumen tidak ditemukan" }, { status: 404 });
    }

    // RBAC: EMPLOYEE hanya bisa mengunduh dokumennya sendiri
    if (session.user.role === "EMPLOYEE" && document.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    // Karena saat ini pakai LocalStorageProvider, kita baca dari ./uploads
    const uploadDir = path.join(process.cwd(), process.env.STORAGE_LOCAL_PATH || "./uploads");
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: "File fisik tidak ditemukan" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Tentukan Content-Type dasar, idealnya ini menggunakan package seperti mime-types
    let contentType = "application/octet-stream";
    if (fileName.endsWith(".pdf")) contentType = "application/pdf";
    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
    if (fileName.endsWith(".png")) contentType = "image/png";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${document.fileName}"`, // inline agar bisa di-preview di browser
      },
    });

  } catch (error: any) {
    console.error("GET /api/v1/documents/download Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
