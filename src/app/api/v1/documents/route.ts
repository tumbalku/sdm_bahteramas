import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getDocumentsSchema } from "@/modules/documents/validation";
import { getDocumentsService } from "@/modules/documents/service";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validasi input
    const parseResult = getDocumentsSchema.safeParse(query);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Input tidak valid", errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const actor = {
      id: session.user.id,
      role: session.user.role,
    };

    const documents = await getDocumentsService(parseResult.data, actor);

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error("GET /api/v1/documents Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
