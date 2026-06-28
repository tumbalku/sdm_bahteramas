import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { changePasswordService } from "@/modules/profile/service";
import { changePasswordSchema } from "@/modules/profile/validation";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = changePasswordSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Input tidak valid", errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const actor = {
      id: session.user.id,
      name: session.user.name || "Unknown",
      role: session.user.role,
    };
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    await changePasswordService(session.user.id, parseResult.data, actor, ipAddress);

    return NextResponse.json({ message: "Kata sandi berhasil diperbarui" });
  } catch (error: any) {
    console.error("PUT /api/v1/profile/password Error:", error);
    
    // Status 400 bila kata sandi tidak cocok
    const status = error.message.includes("tidak sesuai") ? 400 : 500;
    
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status }
    );
  }
}
