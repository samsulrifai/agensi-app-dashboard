import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type ApiRole = "worker" | "admin";

/**
 * Get the authenticated session or return 401
 */
export async function getAuthSession() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

/**
 * Assert that the current user has the required role
 */
export async function requireRole(requiredRole: ApiRole) {
  const { session, error } = await getAuthSession();
  if (error) return { session: null, error };

  const userRole = (session!.user as any).role;
  if (userRole !== requiredRole) {
    return {
      session: null,
      error: NextResponse.json(
        { error: `Akses ditolak. Dibutuhkan role: ${requiredRole}` },
        { status: 403 }
      ),
    };
  }
  return { session, error: null };
}

/**
 * Standard success response
 */
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standard error response
 */
export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Paginate helper
 */
export function paginate(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}
