import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const START_TIME = Date.now();

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

/**
 * GET /api/health
 * Public — basic health check
 */
export async function GET(_request: NextRequest) {
  const dbStart = Date.now();
  let dbStatus = "connected";
  let dbResponseMs = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbResponseMs = Date.now() - dbStart;
  } catch {
    dbStatus = "error";
    dbResponseMs = Date.now() - dbStart;
  }

  const isHealthy = dbStatus === "connected";
  const uptime = Date.now() - START_TIME;

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: formatUptime(uptime),
      uptimeMs: uptime,
      database: dbStatus,
      databaseResponseMs: dbResponseMs,
      version: process.env.npm_package_version || "1.0.0",
    },
    { status: isHealthy ? 200 : 503 }
  );
}
