import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/admin/workers/badges
 * Admin — compute badge assignments untuk semua workers bulan ini
 * Badges: "Top Earner", "On-Time 5x", "Zero Revision"
 */
export async function GET(_request: NextRequest) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Top Earner: worker dengan total invoice approved/paid bulan ini tertinggi
    const monthlyEarnings = await prisma.invoice.groupBy({
      by: ["workerId"],
      where: {
        status: { in: ["approved", "paid"] },
        approvedAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 1,
    });

    const topEarnerId = monthlyEarnings[0]?.workerId;

    // On-Time 5x: hitung per worker
    const workers = await prisma.user.findMany({
      where: { role: "worker", isActive: true },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        workerRatings: {
          select: {
            scoreQuality: true,
            project: { select: { completedAt: true, deadline: true } },
          },
        },
      },
    });

    const badgeMap: Record<string, string[]> = {};

    for (const w of workers) {
      const badges: string[] = [];

      // Top Earner
      if (w.id === topEarnerId) badges.push("Top Earner 🏆");

      // On-Time 5x
      const onTimeCount = w.workerRatings.filter((r) => {
        if (!r.project.completedAt) return false;
        return new Date(r.project.completedAt) <= new Date(r.project.deadline);
      }).length;
      if (onTimeCount >= 5) badges.push("On-Time 5x ⏱️");

      // Zero Revision (all quality >= 4.5)
      if (
        w.workerRatings.length > 0 &&
        w.workerRatings.every((r) => Number(r.scoreQuality) >= 4.5)
      ) {
        badges.push("Zero Revision ✨");
      }

      if (badges.length > 0) {
        badgeMap[w.id] = badges;
      }
    }

    const result = workers
      .filter((w) => badgeMap[w.id])
      .map((w) => ({
        id: w.id,
        fullName: w.fullName,
        avatarUrl: w.avatarUrl,
        badges: badgeMap[w.id],
      }));

    return ok({ badges: result, computedAt: new Date() });
  } catch (error) {
    console.error("[GET /api/admin/workers/badges]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
