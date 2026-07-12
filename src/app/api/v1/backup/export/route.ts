import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { generateDatabaseSqlDumpStream } from "@/modules/backup/service";
import { format } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Akses ditolak. Hanya ADMIN yang dapat mengunduh backup database." }, { status: 403 });
    }

    const actor = {
      id: session.user.id,
      name: session.user.name || "Administrator",
      role: session.user.role,
    };

    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const dateFormatted = format(new Date(), "yyyyMMdd_HHmmss");
    const filename = `smdp_backup_${dateFormatted}.sql`;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of generateDatabaseSqlDumpStream(actor, ipAddress)) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          console.error("Backup stream generation error:", err);
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/v1/backup/export Error:", error);
    const message = error instanceof Error ? error.message : "Gagal menghasilkan backup database";
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
