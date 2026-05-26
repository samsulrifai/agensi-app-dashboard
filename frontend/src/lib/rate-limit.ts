/**
 * src/lib/rate-limit.ts
 * In-memory rate limiter (Edge/Node compatible)
 * 
 * Rules:
 *   - Auth endpoints: 20 req/min per IP
 *   - Search: 30 req/min per user
 *   - General API: 100 req/min per user
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Global map — persists between requests in same Node process
const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export type RateLimitPreset = "auth" | "search" | "general";

const PRESETS: Record<RateLimitPreset, { limit: number; windowMs: number }> = {
  auth: { limit: 20, windowMs: 60_000 },
  search: { limit: 30, windowMs: 60_000 },
  general: { limit: 100, windowMs: 60_000 },
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
  retryAfterSeconds: number;
}

/**
 * Check and increment rate limit for a given key
 * @param key - unique identifier (e.g. `${ip}:auth` or `${userId}:general`)
 * @param preset - rule preset
 */
export function checkRateLimit(key: string, preset: RateLimitPreset): RateLimitResult {
  const { limit, windowMs } = PRESETS[preset];
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { success: true, limit, remaining: limit - 1, resetAt: entry.resetAt, retryAfterSeconds: 0 };
  }

  entry.count++;
  store.set(key, entry);

  const remaining = Math.max(0, limit - entry.count);
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);

  return {
    success: entry.count <= limit,
    limit,
    remaining,
    resetAt: entry.resetAt,
    retryAfterSeconds,
  };
}

/**
 * Helper: get IP from Next.js request headers
 */
export function getRequestIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Apply rate limit and return a 429 response if exceeded
 * Returns null if allowed, NextResponse if blocked
 */
import { NextResponse } from "next/server";

export function applyRateLimit(
  key: string,
  preset: RateLimitPreset
): NextResponse | null {
  const result = checkRateLimit(key, preset);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Terlalu banyak permintaan. Coba lagi nanti.",
        retryAfterSeconds: result.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfterSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}
