import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import fs from "fs";
import path from "path";

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

    // Hanya izinkan file yang dimulai dengan "avatar_" untuk mencegah LFI
    if (!fileName.startsWith("avatar_")) {
      return NextResponse.json({ message: "File tidak valid" }, { status: 403 });
    }

    const uploadDir = path.join(process.cwd(), process.env.STORAGE_LOCAL_PATH || "./uploads");
    const filePath = path.join(uploadDir, fileName);

    // Pastikan path tetap berada dalam uploadDir
    if (!filePath.startsWith(uploadDir)) {
       return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: "Foto profil tidak ditemukan" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    let contentType = "image/jpeg";
    if (fileName.endsWith(".png")) contentType = "image/png";
    if (fileName.endsWith(".webp")) contentType = "image/webp";
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200"
      },
    });

  } catch (error: any) {
    console.error("GET /api/v1/profile/avatar/view Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
