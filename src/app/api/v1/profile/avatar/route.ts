import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getStorageProvider } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import path from "path";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file || typeof file === "string") {
      return NextResponse.json({ message: "File wajib diunggah" }, { status: 400 });
    }

    // Validasi file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "Format file tidak didukung" }, { status: 400 });
    }

    const maxSizeKb = parseInt(process.env.MAX_AVATAR_UPLOAD_SIZE_KB || "200", 10);
    const MAX_SIZE = maxSizeKb * 1024;
    
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: `Ukuran file terlalu besar (maksimal ${maxSizeKb}KB)` }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true }
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload file via StorageProvider
    const storage = getStorageProvider();
    
    const ext = path.extname(file.name) || ".jpg";
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const safeFileName = `avatar_${session.user.id}_${timestamp}${ext}`;

    const savedFileName = await storage.uploadFile(buffer, safeFileName);
    const fileUrl = `/api/v1/profile/avatar/view?file=${savedFileName}`;

    // Hapus file avatar lama
    if (currentUser?.avatarUrl) {
      try {
        // Asumsi URL format: /api/v1/profile/avatar/view?file=avatar_XXX.jpg
        const url = new URL(currentUser.avatarUrl, "http://localhost");
        const oldFile = url.searchParams.get("file");
        if (oldFile) {
          await storage.deleteFile(oldFile);
        }
      } catch (e) {
        console.error("Gagal menghapus avatar lama:", e);
      }
    }

    // Simpan ke DB
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: fileUrl },
    });

    return NextResponse.json({
      message: "Avatar berhasil diperbarui",
      data: { avatarUrl: fileUrl }
    }, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/v1/profile/avatar Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
