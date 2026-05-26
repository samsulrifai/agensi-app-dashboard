import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * POST /api/tasks/[id]/time/stop
 * Hentikan timer dan update actual_hours di task (sum seluruh time logs)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;

    // Temukan timer aktif
    const activeLog = await prisma.timeLog.findFirst({
      where: { taskId: id, workerId: userId, endedAt: null },
    });

    if (!activeLog) {
      return err("Tidak ada timer aktif untuk task ini.", 404);
    }

    const endedAt = new Date();
    const durationMinutes = Math.round(
      (endedAt.getTime() - activeLog.startedAt.getTime()) / 60000
    );

    // Update time log
    const updated = await prisma.timeLog.update({
      where: { id: activeLog.id },
      data: { endedAt, durationMinutes },
    });

    // Hitung total actual_hours dari SELURUH time logs task ini (semua worker)
    const totalAgg = await prisma.timeLog.aggregate({
      where: { taskId: id, endedAt: { not: null } },
      _sum: { durationMinutes: true },
    });

    const totalActualHours = (totalAgg._sum.durationMinutes ?? 0) / 60;

    await prisma.task.update({
      where: { id },
      data: { actualHours: totalActualHours },
    });

    return ok({
      ...updated,
      durationMinutes,
      totalActualHours: Math.round(totalActualHours * 100) / 100,
    });
  } catch (error) {
    console.error("[POST /api/tasks/[id]/time/stop]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
