import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getDocumentByIdService } from "@/modules/documents/service";
import { getContentTypeFromPath, getStorageProvider } from "@/lib/storage";
import { fail } from "@/lib/api-response";

function getDownloadDisposition(contentType: string) {
  if (contentType === "application/pdf" || contentType.startsWith("image/")) {
    return "inline";
  }

  return "attachment";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return fail("Unauthorized", 401);
    }

    const { id } = await params;
    const actor = { id: session.user.id, role: session.user.role };
    const document = await getDocumentByIdService(id, actor);

    const storage = getStorageProvider();
    let storageFile;

    try {
      storageFile = await storage.getFile(document.filePath);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("tidak ditemukan")) {
        return fail("File fisik tidak ditemukan", 404);
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
    console.error("GET /api/v1/documents/[id]/download Error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal server";
    const status = message.includes("tidak ditemukan")
      ? 404
      : message.includes("Akses ditolak")
        ? 403
        : 500;
    return fail(message, status);
  }
}
