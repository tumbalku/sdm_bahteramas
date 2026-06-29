import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Akses tidak diizinkan. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!dbUser || !dbUser.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Data pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, dbUser.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Kata sandi yang Anda masukkan salah! Verifikasi identitas gagal." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verifikasi kata sandi dan identitas pengguna berhasil.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan saat memverifikasi kata sandi." },
      { status: 500 }
    );
  }
}
