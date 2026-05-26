import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { randomUUID } from "crypto";

// Routes yang tidak butuh auth
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/health",
  "/health",
  "/_next",
  "/favicon",
  "/public",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate Request ID untuk setiap request (debugging)
  const requestId = randomUUID().slice(0, 8);

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Request-ID",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
        "X-Request-ID": requestId,
      },
    });
  }

  // Public routes — skip auth check
  if (isPublicPath(pathname)) {
    const res = NextResponse.next();
    res.headers.set("X-Request-ID", requestId);
    return res;
  }

  // Baca JWT token langsung — Edge Runtime safe (tidak butuh Prisma)
  // NextAuth v5 uses "authjs" cookie prefix, not "next-auth"
  const isSecure = request.url.startsWith("https://");
  const cookieName = isSecure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
  
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName,
  });

  // No token — redirect ke login atau return 401 untuk API
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401, headers: { "X-Request-ID": requestId } }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  // Role-based protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden", code: "FORBIDDEN" } },
        { status: 403, headers: { "X-Request-ID": requestId } }
      );
    }
    return NextResponse.redirect(new URL("/worker/dashboard", request.url));
  }

  if (pathname.startsWith("/worker") && role !== "worker") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden", code: "FORBIDDEN" } },
        { status: 403, headers: { "X-Request-ID": requestId } }
      );
    }
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Redirect root ke dashboard yang sesuai
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(
        role === "admin" ? "/admin/dashboard" : "/worker/dashboard",
        request.url
      )
    );
  }

  // Pass through dengan Request ID header
  const res = NextResponse.next();
  res.headers.set("X-Request-ID", requestId);
  return res;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
