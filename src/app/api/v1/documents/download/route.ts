import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

function getContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

function getDownloadDisposition(contentType: string) {
  if (contentType === "application/pdf" || contentType.startsWith("image/")) {
    return "inline";
  }

  return "attachment";
}

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

    let fileBuffer: Buffer;
    let contentType = getContentType(fileName);
    if (contentType === "application/octet-stream") {
      contentType = getContentType(document.fileName);
    }

    const uploadDir = path.resolve(process.cwd(), process.env.STORAGE_LOCAL_PATH || "./uploads");
    const filePath = path.resolve(uploadDir, fileName);

    if (!filePath.startsWith(uploadDir + path.sep)) {
      return NextResponse.json({ message: "Path file tidak valid" }, { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: "File fisik tidak ditemukan" }, { status: 404 });
    }

    fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${getDownloadDisposition(contentType)}; filename="${document.fileName}"`,
        "X-Content-Type-Options": "nosniff",
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
