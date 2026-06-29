import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { getPendingDocumentsService } from "@/modules/verification/service";

// Verification API Route
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const documents = await getPendingDocumentsService();
    return NextResponse.json(documents);
  } catch (error: any) {
    console.error("GET /api/v1/verification Error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
