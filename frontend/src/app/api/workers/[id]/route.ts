import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/workers/[id]
 * Admin only — detail worker + stats + history proyek
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await requireRole("admin");
    if (error) return error;

    const worker = await prisma.user.findUnique({
      where: { id, role: "worker" },
      include: {
        projectWorkers: {
          include: {
            project: { select: { id: true, title: true, clientName: true, status: true, deadline: true } },
          },
        },
        workerRatings: {
          include: {
            admin: { select: { fullName: true } },
            project: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        workerInvoices: {
          select: { id: true, amount: true, status: true, invoiceDate: true },
          orderBy: { invoiceDate: "desc" },
          take: 10,
        },
      },
    });

    if (!worker) return err("Worker tidak ditemukan", 404);

    const avgRating =
      worker.workerRatings.length > 0
        ? worker.workerRatings.reduce((s, r) => s + Number(r.overallScore), 0) /
          worker.workerRatings.length
        : 0;

    const totalEarned = worker.workerInvoices
      .filter((inv) => ["approved", "paid"].includes(inv.status))
      .reduce((s, inv) => s + Number(inv.amount), 0);

    return ok({
      id: worker.id,
      fullName: worker.fullName,
      email: worker.email,
      avatarUrl: worker.avatarUrl,
      skills: worker.skills,
      phone: worker.phone,
      isActive: worker.isActive,
      createdAt: worker.createdAt,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: worker.workerRatings.length,
      totalEarned,
      projects: worker.projectWorkers.map((pw) => pw.project),
      ratings: worker.workerRatings,
      recentInvoices: worker.workerInvoices,
    });
  } catch (error) {
    console.error("[GET /api/workers/[id]]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
