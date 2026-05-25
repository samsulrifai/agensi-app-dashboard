import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * POST /api/tasks/[id]/time/stop
 * Hentikan timer pada task
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

    // Temukan timer yang aktif
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

    const updated = await prisma.timeLog.update({
      where: { id: activeLog.id },
      data: { endedAt, durationMinutes },
    });

    // Update actual_hours di task
    const totalMinutes = await prisma.timeLog.aggregate({
      where: { taskId: id, workerId: userId, endedAt: { not: null } },
      _sum: { durationMinutes: true },
    });

    await prisma.task.update({
      where: { id },
      data: {
        actualHours: (totalMinutes._sum.durationMinutes ?? 0) / 60,
      },
    });

    return ok({ ...updated, durationMinutes });
  } catch (error) {
    console.error("[POST /api/tasks/[id]/time/stop]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
