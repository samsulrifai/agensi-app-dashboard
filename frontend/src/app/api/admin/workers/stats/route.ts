import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/admin/workers/stats
 * Admin only — ringkasan statistik semua worker
 */
export async function GET(_request: NextRequest) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;

    const [totalActive, totalInactive, allRatings, overloaded] = await Promise.all([
      prisma.user.count({ where: { role: "worker", isActive: true } }),
      prisma.user.count({ where: { role: "worker", isActive: false } }),
      prisma.rating.findMany({ select: { overallScore: true } }),
      // Worker dengan 4+ proyek aktif
      prisma.user.count({
        where: {
          role: "worker",
          projectWorkers: {
            some: {
              project: { status: { notIn: ["done", "archived"] } },
            },
          },
        },
      }),
    ]);

    const avgPlatformRating =
      allRatings.length > 0
        ? Math.round(
            (allRatings.reduce((s, r) => s + Number(r.overallScore), 0) /
              allRatings.length) *
              10
          ) / 10
        : 0;

    return ok({
      totalActive,
      totalInactive,
      totalWorkers: totalActive + totalInactive,
      avgPlatformRating,
      totalRatings: allRatings.length,
      overloadedCount: overloaded,
    });
  } catch (error) {
    console.error("[GET /api/admin/workers/stats]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
