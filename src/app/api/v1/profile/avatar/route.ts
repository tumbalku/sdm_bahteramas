import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getStorageProvider } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import path from "path";
import { getSystemSetting } from "@/lib/system-settings";

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

    const maxSizeKbStr = await getSystemSetting("MAX_AVATAR_UPLOAD_SIZE_KB", "200");
    const maxSizeKb = parseInt(maxSizeKbStr, 10);
    const MAX_SIZE = maxSizeKb * 1024;
    
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: `Ukuran file terlalu besar (maksimal ${maxSizeKb}KB)` }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, employeeId: true, avatarUrl: true }
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload file via StorageProvider
    const storage = getStorageProvider();
    
    const ext = path.extname(file.name) || ".jpg";
    const identifier = currentUser?.employeeId || currentUser?.id || userId;
    const safeFileName = `${identifier}_profile${ext}`;

    // Hapus file avatar lama jika ada dan beda nama file
    if (currentUser?.avatarUrl) {
      try {
        const url = new URL(currentUser.avatarUrl, "http://localhost");
        const oldFile = url.searchParams.get("file");
        if (oldFile && oldFile !== safeFileName) {
          await storage.deleteFile(oldFile);
        }
      } catch (e) {
        console.error("Gagal menghapus avatar lama:", e);
      }
    }

    const savedFileName = await storage.uploadFile(buffer, safeFileName);
    const fileUrl = `/api/v1/profile/avatar/view?file=${savedFileName}`;

    // Simpan ke DB
    await prisma.user.update({
      where: { id: userId },
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
