import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/workers/me/projects
 * Proyek aktif worker yang sedang login
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // optional filter

    const projects = await prisma.project.findMany({
      where: {
        projectWorkers: { some: { workerId: userId } },
        ...(status ? { status: status as any } : {}),
      },
      include: {
        tasks: {
          where: { assignedTo: userId },
          include: {
            timeLogs: {
              where: { workerId: userId },
              select: { durationMinutes: true, startedAt: true, endedAt: true },
            },
          },
        },
        _count: { select: { tasks: true } },
        milestones: { select: { id: true, title: true, status: true, dueDate: true } },
      },
      orderBy: { deadline: "asc" },
    });

    const now = new Date();

    const result = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const doneTasks = p.tasks.filter((t) => t.status === "done").length;
      const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      const daysUntilDeadline = Math.ceil(
        (new Date(p.deadline).getTime() - now.getTime()) / 86400000
      );
      const isUrgent = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;

      const totalLoggedMinutes = p.tasks.reduce(
        (sum, t) => sum + t.timeLogs.reduce((s, l) => s + (l.durationMinutes ?? 0), 0),
        0
      );

      return {
        id: p.id,
        title: p.title,
        clientName: p.clientName,
        status: p.status,
        priority: p.priority,
        deadline: p.deadline,
        daysUntilDeadline,
        isUrgent,
        progress,
        totalTasks,
        doneTasks,
        totalLoggedHours: Math.round(totalLoggedMinutes / 60 * 10) / 10,
        tasks: p.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          deadline: t.deadline,
          estimatedHours: Number(t.estimatedHours ?? 0),
          loggedMinutes: t.timeLogs.reduce((s, l) => s + (l.durationMinutes ?? 0), 0),
        })),
        milestones: p.milestones,
      };
    });

    return ok(result);
  } catch (error) {
    console.error("[GET /api/workers/me/projects]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

