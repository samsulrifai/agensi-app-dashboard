import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/tasks/[id]/time-logs
 * Auth — return semua time logs untuk task tertentu
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error } = await getAuthSession();
    if (error) return error;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { id: true, title: true, estimatedHours: true, actualHours: true },
    });
    if (!task) return err("Task tidak ditemukan", 404);

    const logs = await prisma.timeLog.findMany({
      where: { taskId: id },
      include: {
        worker: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    const totalMinutes = logs
      .filter((l) => l.durationMinutes)
      .reduce((s, l) => s + (l.durationMinutes ?? 0), 0);

    return ok({
      task: {
        id: task.id,
        title: task.title,
        estimatedHours: task.estimatedHours ? Number(task.estimatedHours) : null,
        actualHours: task.actualHours ? Number(task.actualHours) : null,
      },
      logs: logs.map((l) => ({
        id: l.id,
        worker: l.worker,
        startedAt: l.startedAt,
        endedAt: l.endedAt,
        durationMinutes: l.durationMinutes,
        notes: l.notes,
        isActive: !l.endedAt,
      })),
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    });
  } catch (error) {
    console.error("[GET /api/tasks/[id]/time-logs]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
