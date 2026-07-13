import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { canManageAllDocuments } from "@/lib/rbac";
import { getContentTypeFromPath, getStorageProvider } from "@/lib/storage";

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

    if (!canManageAllDocuments(session.user.role) && document.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }


    const storage = getStorageProvider();
    let storageFile;

    try {
      storageFile = await storage.getFile(fileName);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("tidak ditemukan")) {
        return NextResponse.json({ message: "File fisik tidak ditemukan" }, { status: 404 });
      }

      throw error;
    }

    let contentType = storageFile.contentType;
    if (contentType === "application/octet-stream") {
      contentType = getContentTypeFromPath(document.fileName);
    }

    return new NextResponse(new Uint8Array(storageFile.buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${getDownloadDisposition(contentType)}; filename="${document.fileName}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });

  } catch (error: unknown) {
    console.error("GET /api/v1/documents/download Error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal server";
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
