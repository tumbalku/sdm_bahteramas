import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import path from "path";
import { getContentTypeFromPath, getStorageProvider } from "@/lib/storage";

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

    // Hanya izinkan nama file aman yang valid (misal: NIP_profile.jpg atau avatar_XXX.jpg)
    if (path.basename(fileName) !== fileName || (!fileName.includes("_profile.") && !fileName.startsWith("avatar_"))) {
      return NextResponse.json({ message: "File tidak valid" }, { status: 403 });
    }

    const storage = getStorageProvider();
    let storageFile;

    try {
      storageFile = await storage.getFile(fileName);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("tidak ditemukan")) {
        return NextResponse.json({ message: "Foto profil tidak ditemukan" }, { status: 404 });
      }

      throw error;
    }

    const contentType = storageFile.contentType === "application/octet-stream"
      ? getContentTypeFromPath(fileName)
      : storageFile.contentType;
    
    return new NextResponse(new Uint8Array(storageFile.buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200"
      },
    });

  } catch (error: unknown) {
    console.error("GET /api/v1/profile/avatar/view Error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal server";
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
