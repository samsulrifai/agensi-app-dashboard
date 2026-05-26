import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-helpers";
import { cache } from "@/lib/cache";
import { supabaseConfigured } from "@/lib/supabase";

const START_TIME = Date.now();

/**
 * GET /api/health/detailed
 * Admin only — comprehensive health status
 */
export async function GET(request: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const [dbCheck, countChecks] = await Promise.allSettled([
    // DB ping
    (async () => {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      return Date.now() - start;
    })(),
    // Entity counts
    Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.invoice.count({ where: { status: "pending" } }),
      prisma.notification.count({ where: { isRead: false } }),
    ]),
  ]);

  const dbResponseMs = dbCheck.status === "fulfilled" ? dbCheck.value : -1;
  const dbStatus = dbCheck.status === "fulfilled" ? "connected" : "error";
  const [userCount, projectCount, pendingInvoices, unreadNotifs] =
    countChecks.status === "fulfilled" ? countChecks.value : [0, 0, 0, 0];

  // Memory usage (Node.js only)
  const mem = process.memoryUsage ? process.memoryUsage() : null;

  return NextResponse.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Date.now() - START_TIME,
    database: {
      status: dbStatus,
      responseMs: dbResponseMs,
      entities: { users: userCount, projects: projectCount },
      pendingInvoices,
      unreadNotifications: unreadNotifs,
    },
    storage: {
      supabase: supabaseConfigured ? "configured" : "not_configured",
    },
    cache: {
      entries: cache.size(),
    },
    memory: mem
      ? {
          rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(mem.external / 1024 / 1024)}MB`,
        }
      : null,
    environment: process.env.NODE_ENV,
  });
}
