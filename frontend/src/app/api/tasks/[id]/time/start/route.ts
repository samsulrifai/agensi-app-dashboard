import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * POST /api/tasks/[id]/time/start
 * Mulai timer pada task
 * Validasi: tidak boleh ada timer aktif di task MANAPUN untuk worker yang sama
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

    // Cek task ada dan worker punya akses
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { select: { id: true, title: true } } },
    });
    if (!task) return err("Task tidak ditemukan", 404);

    // Validasi: tidak boleh ada timer aktif di task manapun (global check)
    const anyActiveTimer = await prisma.timeLog.findFirst({
      where: { workerId: userId, endedAt: null },
      include: { task: { select: { title: true } } },
    });

    if (anyActiveTimer) {
      return err(
        `Timer sudah berjalan untuk task "${anyActiveTimer.task.title}". Hentikan timer tersebut terlebih dahulu.`,
        409
      );
    }

    // Update task status ke in_progress jika masih todo
    if (task.status === "todo") {
      await prisma.task.update({
        where: { id },
        data: { status: "in_progress" },
      });
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        taskId: id,
        workerId: userId,
        startedAt: new Date(),
      },
    });

    return ok({ ...timeLog, taskTitle: task.title, projectTitle: task.project.title }, 201);
  } catch (error) {
    console.error("[POST /api/tasks/[id]/time/start]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
