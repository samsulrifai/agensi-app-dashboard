import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/workers/me/active-timer
 * Worker — return timer yang sedang aktif (jika ada) agar dashboard bisa tampilkan
 */
export async function GET(_request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;

    const activeLog = await prisma.timeLog.findFirst({
      where: { workerId: userId, endedAt: null },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            project: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!activeLog) {
      return ok({ active: false, timer: null });
    }

    const elapsed = Math.floor((Date.now() - activeLog.startedAt.getTime()) / 1000); // seconds

    return ok({
      active: true,
      timer: {
        timeLogId: activeLog.id,
        taskId: activeLog.taskId,
        taskTitle: activeLog.task.title,
        projectId: activeLog.task.project.id,
        projectTitle: activeLog.task.project.title,
        startedAt: activeLog.startedAt,
        elapsedSeconds: elapsed,
        elapsedFormatted: formatDuration(elapsed),
      },
    });
  } catch (error) {
    console.error("[GET /api/workers/me/active-timer]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
