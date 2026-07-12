import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { getRequiredEnv } from "@/lib/env";

export async function proxyMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public path yang tidak memerlukan login & middleware interception
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/v1/auth/verify-password") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: getRequiredEnv("NEXTAUTH_SECRET"),
  });

  // Jika mencoba mengakses API route yang butuh auth tapi belum login
  if (pathname.startsWith("/api/v1")) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Jika mencoba mengakses halaman terproteksi tanpa login -> redirect ke /login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
