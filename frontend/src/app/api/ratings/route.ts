import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

const RatingSchema = z.object({
  workerId: z.string().uuid("Worker ID tidak valid"),
  projectId: z.string().uuid("Project ID tidak valid"),
  scoreDeadline: z.number().min(1).max(5),
  scoreQuality: z.number().min(1).max(5),
  scoreCommunication: z.number().min(1).max(5),
  reviewText: z.string().optional(),
});

/**
 * POST /api/ratings
 * Admin only — submit rating untuk worker setelah proyek selesai
 */
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole("admin");
    if (error) return error;

    const body = await request.json();
    const parsed = RatingSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const { workerId, projectId, scoreDeadline, scoreQuality, scoreCommunication, reviewText } =
      parsed.data;

    // Validasi proyek harus done
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, status: true, adminId: true },
    });
    if (!project) return err("Proyek tidak ditemukan", 404);
    if (project.status !== "done") {
      return err("Rating hanya bisa diberikan untuk proyek yang sudah selesai (status: done)", 422);
    }

    // Validasi worker terlibat di proyek
    const membership = await prisma.projectWorker.findUnique({
      where: { projectId_workerId: { projectId, workerId } },
    });
    if (!membership) return err("Worker tidak terlibat dalam proyek ini", 422);

    // Validasi satu rating per worker per proyek
    const existing = await prisma.rating.findFirst({
      where: { workerId, projectId },
    });
    if (existing) return err("Rating untuk worker ini di proyek ini sudah ada", 409);

    // Hitung overallScore: deadline*0.4 + quality*0.4 + communication*0.2
    const overallScore =
      Math.round(
        (scoreDeadline * 0.4 + scoreQuality * 0.4 + scoreCommunication * 0.2) * 100
      ) / 100;

    const rating = await prisma.rating.create({
      data: {
        workerId,
        adminId: session!.user.id,
        projectId,
        scoreDeadline,
        scoreQuality,
        scoreCommunication,
        overallScore,
        reviewText,
      },
      include: {
        worker: { select: { fullName: true } },
        project: { select: { title: true } },
      },
    });

    // Notifikasi ke worker
    await prisma.notification.create({
      data: {
        userId: workerId,
        type: "rating_received",
        title: "Rating Baru Diterima ⭐",
        body: `Anda mendapat rating ${overallScore.toFixed(1)}/5 untuk proyek "${project.title}".`,
        metadata: { ratingId: rating.id, projectId },
      },
    });

    return ok(rating, 201);
  } catch (error) {
    console.error("[POST /api/ratings]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

/**
 * GET /api/ratings
 * Admin only — list semua ratings (filter by workerId)
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("workerId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;

    const ratings = await prisma.rating.findMany({
      where: {
        ...(workerId ? { workerId } : {}),
        ...(projectId ? { projectId } : {}),
      },
      include: {
        worker: { select: { id: true, fullName: true, avatarUrl: true } },
        project: { select: { id: true, title: true } },
        admin: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(
      ratings.map((r) => ({
        ...r,
        scoreDeadline: Number(r.scoreDeadline),
        scoreQuality: Number(r.scoreQuality),
        scoreCommunication: Number(r.scoreCommunication),
        overallScore: Number(r.overallScore),
      }))
    );
  } catch (error) {
    console.error("[GET /api/ratings]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
