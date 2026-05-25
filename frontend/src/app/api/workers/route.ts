import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/workers
 * Admin only — direktori semua worker dengan workload, rating
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await requireRole("admin");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const isActive = searchParams.get("isActive");

    const workers = await prisma.user.findMany({
      where: {
        role: "worker",
        ...(isActive !== null ? { isActive: isActive === "true" } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        projectWorkers: {
          where: {
            project: {
              status: { notIn: ["done", "archived"] },
            },
          },
          include: { project: { select: { id: true, title: true, status: true } } },
        },
        workerRatings: {
          select: { overallScore: true },
        },
      },
      orderBy: { fullName: "asc" },
    });

    const result = workers.map((w) => {
      const activeProjects = w.projectWorkers.length;
      const avgRating =
        w.workerRatings.length > 0
          ? w.workerRatings.reduce((s, r) => s + Number(r.overallScore), 0) / w.workerRatings.length
          : 0;

      return {
        id: w.id,
        fullName: w.fullName,
        email: w.email,
        avatarUrl: w.avatarUrl,
        skills: w.skills,
        isActive: w.isActive,
        phone: w.phone,
        activeProjects,
        isOverloaded: activeProjects >= 4, // PRD: alert jika > N proyek aktif
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: w.workerRatings.length,
        currentProjects: w.projectWorkers.map((pw) => ({
          id: pw.project.id,
          title: pw.project.title,
          status: pw.project.status,
        })),
      };
    });

    return ok(result);
  } catch (error) {
    console.error("[GET /api/workers]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

