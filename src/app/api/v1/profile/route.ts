import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getProfileService, updateProfileService } from "@/modules/profile/service";
import { updateProfileSchema } from "@/modules/profile/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileService(session.user.id);
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("GET /api/v1/profile Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = updateProfileSchema.safeParse(body);
    
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

    const updated = await updateProfileService(session.user.id, parseResult.data, actor, ipAddress);

    return NextResponse.json({ message: "Profil berhasil diperbarui", data: updated });
  } catch (error: any) {
    console.error("PUT /api/v1/profile Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
