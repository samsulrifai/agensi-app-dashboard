import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-helpers";

/**
 * GET /api/workers/[id]/ratings
 * Public-accessible — return semua rating worker dengan detail proyek + badge system
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const worker = await prisma.user.findUnique({
      where: { id, role: "worker" },
      select: { id: true, fullName: true, avatarUrl: true, skills: true },
    });
    if (!worker) return err("Worker tidak ditemukan", 404);

    const ratings = await prisma.rating.findMany({
      where: { workerId: id },
      include: {
        project: { select: { id: true, title: true, clientName: true, deadline: true, completedAt: true } },
        admin: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const avg = (field: "scoreDeadline" | "scoreQuality" | "scoreCommunication" | "overallScore") =>
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + Number(r[field]), 0) / ratings.length) * 10) / 10
        : 0;

    // Badge system
    const badges: { name: string; icon: string; description: string }[] = [];

    // "On-Time 5x" — proyek selesai sebelum deadline
    const onTimeCount = ratings.filter((r) => {
      if (!r.project.completedAt || !r.project.deadline) return false;
      return new Date(r.project.completedAt) <= new Date(r.project.deadline);
    }).length;
    if (onTimeCount >= 5) {
      badges.push({ name: "On-Time 5x", icon: "⏱️", description: "Menyelesaikan 5+ proyek tepat waktu" });
    }

    // "Zero Revision" — semua rating quality >= 4.5
    const allHighQuality = ratings.length > 0 && ratings.every((r) => Number(r.scoreQuality) >= 4.5);
    if (allHighQuality) {
      badges.push({ name: "Zero Revision", icon: "✨", description: "Semua proyek mendapat kualitas ≥ 4.5" });
    }

    // Total earnings dari invoice approved/paid
    const earningsAgg = await prisma.invoice.aggregate({
      where: { workerId: id, status: { in: ["approved", "paid"] } },
      _sum: { amount: true },
    });
    const totalEarnings = Number(earningsAgg._sum.amount ?? 0);

    return ok({
      worker: { ...worker, totalEarnings },
      summary: {
        totalRatings: ratings.length,
        avgOverall: avg("overallScore"),
        avgDeadline: avg("scoreDeadline"),
        avgQuality: avg("scoreQuality"),
        avgCommunication: avg("scoreCommunication"),
      },
      badges,
      ratings: ratings.map((r) => ({
        id: r.id,
        projectId: r.projectId,
        projectTitle: r.project.title,
        clientName: r.project.clientName,
        adminName: r.admin.fullName,
        scoreDeadline: Number(r.scoreDeadline),
        scoreQuality: Number(r.scoreQuality),
        scoreCommunication: Number(r.scoreCommunication),
        overallScore: Number(r.overallScore),
        reviewText: r.reviewText,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/workers/[id]/ratings]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
