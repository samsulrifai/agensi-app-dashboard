import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type ApiRole = "worker" | "admin";

// Standard error codes
export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "SERVICE_UNAVAILABLE";

const STATUS_TO_CODE: Record<number, ErrorCode> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  429: "RATE_LIMITED",
  500: "SERVER_ERROR",
  503: "SERVICE_UNAVAILABLE",
};

/**
 * Get the authenticated session or return 401
 */
export async function getAuthSession() {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      ),
    };
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
        {
          success: false,
          error: {
            message: `Access denied. Required role: ${requiredRole}`,
            code: "FORBIDDEN",
          },
        },
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
 * Standard error response with error code
 */
export function err(message: string, status = 400, code?: ErrorCode) {
  const errorCode = code ?? STATUS_TO_CODE[status] ?? "SERVER_ERROR";
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: errorCode,
      },
    },
    { status }
  );
}

/**
 * Paginate helper
 */
export function paginate(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

/**
 * Safe number parse with fallback
 */
export function parseIntParam(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}
