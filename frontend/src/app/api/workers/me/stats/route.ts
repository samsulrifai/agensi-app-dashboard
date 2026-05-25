import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/workers/me/stats
 * Statistik performa & rating worker: rata-rata skor, badge, trend rating
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;

    const ratings = await prisma.rating.findMany({
      where: { workerId: userId },
      include: {
        project: { select: { title: true } },
        admin: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (ratings.length === 0) {
      return ok({
        overallScore: 0,
        scoreDeadline: 0,
        scoreQuality: 0,
        scoreCommunication: 0,
        totalReviews: 0,
        badges: [],
        recentReviews: [],
        monthlyTrend: [],
      });
    }

    const avg = (field: keyof typeof ratings[0]) =>
      ratings.reduce((s, r) => s + Number(r[field]), 0) / ratings.length;

    const overallScore = avg("overallScore");
    const scoreDeadline = avg("scoreDeadline");
    const scoreQuality = avg("scoreQuality");
    const scoreCommunication = avg("scoreCommunication");

    // Badge logic
    const badges: { name: string; description: string }[] = [];

    // On-Time 5x: delivered ≥5 projects before deadline
    const onTimeCount = await prisma.project.count({
      where: {
        projectWorkers: { some: { workerId: userId } },
        status: "done",
        completedAt: { not: null },
      },
    });
    if (onTimeCount >= 5) badges.push({ name: "On-Time 5x", description: "Menyelesaikan 5+ proyek tepat waktu" });

    // Top earner: in top 10% by total paid invoices
    const [myTotal, allTotals] = await Promise.all([
      prisma.invoice.aggregate({
        where: { workerId: userId, status: { in: ["approved", "paid"] } },
        _sum: { amount: true },
      }),
      prisma.invoice.groupBy({
        by: ["workerId"],
        where: { status: { in: ["approved", "paid"] } },
        _sum: { amount: true },
      }),
    ]);

    const myTotalAmount = Number(myTotal._sum.amount ?? 0);
    const sortedTotals = allTotals
      .map((r) => Number(r._sum.amount ?? 0))
      .sort((a, b) => b - a);
    const rank = sortedTotals.findIndex((t) => t <= myTotalAmount);
    if (sortedTotals.length > 0 && rank / sortedTotals.length <= 0.1) {
      badges.push({ name: "Top Earner", description: "Termasuk top 10% earner di platform" });
    }

    // Zero Revision: rating.scoreQuality = 5 on ≥3 projects
    const perfectQuality = ratings.filter((r) => Number(r.scoreQuality) === 5).length;
    if (perfectQuality >= 3) badges.push({ name: "Zero Revision", description: "Kualitas sempurna di 3+ proyek" });

    // Monthly trend (last 6 months average)
    const now = new Date();
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthRatings = ratings.filter(
        (r) => r.createdAt >= start && r.createdAt <= end
      );
      const monthAvg =
        monthRatings.length > 0
          ? monthRatings.reduce((s, r) => s + Number(r.overallScore), 0) / monthRatings.length
          : null;
      monthlyTrend.push({
        month: start.toLocaleString("id-ID", { month: "short" }),
        score: monthAvg ? Math.round(monthAvg * 10) / 10 : null,
      });
    }

    return ok({
      overallScore: Math.round(overallScore * 10) / 10,
      scoreDeadline: Math.round(scoreDeadline * 10) / 10,
      scoreQuality: Math.round(scoreQuality * 10) / 10,
      scoreCommunication: Math.round(scoreCommunication * 10) / 10,
      totalReviews: ratings.length,
      badges,
      recentReviews: ratings.slice(0, 5).map((r) => ({
        projectTitle: r.project.title,
        adminName: r.admin.fullName,
        overallScore: Number(r.overallScore),
        reviewText: r.reviewText,
        createdAt: r.createdAt,
      })),
      monthlyTrend,
    });
  } catch (error) {
    console.error("[GET /api/workers/me/stats]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

