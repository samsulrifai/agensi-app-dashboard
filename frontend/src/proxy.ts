import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — skip
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Baca JWT token langsung — tidak butuh Prisma (Edge Runtime safe)
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // No token — redirect ke login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // Role-based protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/worker/dashboard", request.url));
  }

  if (pathname.startsWith("/worker") && role !== "worker") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Redirect root ke dashboard yang sesuai
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin/dashboard" : "/worker/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
