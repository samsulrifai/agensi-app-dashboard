import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/projects/[id]
 * Detail proyek beserta tasks, workers, milestones
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;
    const role = (session!.user as any).role;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
        projectWorkers: {
          include: {
            worker: { select: { id: true, fullName: true, avatarUrl: true, email: true, skills: true } },
          },
        },
        tasks: {
          include: {
            worker: { select: { id: true, fullName: true, avatarUrl: true } },
            timeLogs: {
              select: { id: true, startedAt: true, endedAt: true, durationMinutes: true, workerId: true },
              orderBy: { startedAt: "desc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        milestones: { orderBy: { dueDate: "asc" } },
        invoices: {
          where: role === "worker" ? { workerId: userId } : {},
          select: { id: true, amount: true, status: true, invoiceDate: true },
        },
        _count: { select: { tasks: true, attachments: true } },
      },
    });

    if (!project) return err("Proyek tidak ditemukan", 404);

    // Worker hanya bisa lihat proyek yang di-assign ke mereka
    if (role === "worker") {
      const isMember = project.projectWorkers.some((pw) => pw.workerId === userId);
      if (!isMember) return err("Akses ditolak", 403);
    }

    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter((t) => t.status === "done").length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return ok({ ...project, progress });
  } catch (error) {
    console.error("[GET /api/projects/[id]]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
