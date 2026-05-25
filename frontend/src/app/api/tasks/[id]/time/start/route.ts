import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * POST /api/tasks/[id]/time/start
 * Mulai timer pada task
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

    // Cek apakah ada timer yang masih aktif untuk task ini
    const activeLog = await prisma.timeLog.findFirst({
      where: { taskId: id, workerId: userId, endedAt: null },
    });

    if (activeLog) {
      return err("Timer sudah berjalan untuk task ini. Hentikan timer terlebih dahulu.", 409);
    }

    // Update task status ke in_progress
    await prisma.task.update({
      where: { id },
      data: { status: "in_progress" },
    });

    const timeLog = await prisma.timeLog.create({
      data: {
        taskId: id,
        workerId: userId,
        startedAt: new Date(),
      },
    });

    return ok(timeLog, 201);
  } catch (error) {
    console.error("[POST /api/tasks/[id]/time/start]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
