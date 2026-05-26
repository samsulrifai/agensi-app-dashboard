import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/workers/me/rating-trend
 * Worker — monthly average rating 6 bulan terakhir untuk chart
 */
export async function GET(_request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;
    const now = new Date();

    // Build 6 bulan terakhir
    const months: { label: string; key: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      months.push({
        key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
        label: start.toLocaleString("id-ID", { month: "short", year: "2-digit" }),
        start,
        end,
      });
    }

    // Ambil semua ratings 6 bulan terakhir sekaligus
    const allRatings = await prisma.rating.findMany({
      where: {
        workerId: userId,
        createdAt: { gte: months[0].start, lte: months[months.length - 1].end },
      },
      select: {
        overallScore: true,
        scoreDeadline: true,
        scoreQuality: true,
        scoreCommunication: true,
        createdAt: true,
      },
    });

    const trend = months.map((month) => {
      const monthRatings = allRatings.filter(
        (r) => r.createdAt >= month.start && r.createdAt <= month.end
      );
      const count = monthRatings.length;
      const avg = (field: keyof typeof monthRatings[0]) =>
        count > 0
          ? Math.round(
              (monthRatings.reduce((s, r) => s + Number(r[field]), 0) / count) * 10
            ) / 10
          : null;

      return {
        month: month.key,
        label: month.label,
        avgOverall: avg("overallScore"),
        avgDeadline: avg("scoreDeadline"),
        avgQuality: avg("scoreQuality"),
        avgCommunication: avg("scoreCommunication"),
        count,
      };
    });

    // Overall stats
    const totalRatings = await prisma.rating.findMany({
      where: { workerId: userId },
      select: { overallScore: true },
    });
    const overallAvg =
      totalRatings.length > 0
        ? Math.round(
            (totalRatings.reduce((s, r) => s + Number(r.overallScore), 0) / totalRatings.length) *
              10
          ) / 10
        : 0;

    return ok({ trend, overallAvg, totalRatings: totalRatings.length });
  } catch (error) {
    console.error("[GET /api/workers/me/rating-trend]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
