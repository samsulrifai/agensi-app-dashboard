import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/admin/projects/stats
 * Admin only — ringkasan statistik semua proyek
 */
export async function GET(_request: NextRequest) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;

    const now = new Date();

    const [byStatus, byPriority, overdue, totalBudget] = await Promise.all([
      // Count by status
      prisma.project.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Count by priority
      prisma.project.groupBy({
        by: ["priority"],
        _count: { id: true },
      }),
      // Overdue: deadline sudah lewat tapi belum done/archived
      prisma.project.count({
        where: {
          deadline: { lt: now },
          status: { notIn: ["done", "archived"] },
        },
      }),
      // Total budget semua proyek aktif
      prisma.project.aggregate({
        where: { status: { notIn: ["archived"] } },
        _sum: { budget: true },
      }),
    ]);

    // Format byStatus into map
    const statusMap: Record<string, number> = {};
    for (const s of byStatus) {
      statusMap[s.status] = s._count.id;
    }

    // Format byPriority into map
    const priorityMap: Record<string, number> = {};
    for (const p of byPriority) {
      priorityMap[p.priority] = p._count.id;
    }

    return ok({
      byStatus: {
        todo: statusMap["todo"] ?? 0,
        in_progress: statusMap["in_progress"] ?? 0,
        review: statusMap["review"] ?? 0,
        done: statusMap["done"] ?? 0,
        archived: statusMap["archived"] ?? 0,
      },
      byPriority: {
        low: priorityMap["low"] ?? 0,
        medium: priorityMap["medium"] ?? 0,
        high: priorityMap["high"] ?? 0,
        critical: priorityMap["critical"] ?? 0,
      },
      overdue,
      totalBudget: Number(totalBudget._sum.budget ?? 0),
      totalActive:
        (statusMap["todo"] ?? 0) +
        (statusMap["in_progress"] ?? 0) +
        (statusMap["review"] ?? 0),
    });
  } catch (error) {
    console.error("[GET /api/admin/projects/stats]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
