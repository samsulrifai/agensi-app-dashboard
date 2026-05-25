import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole, ok, err, paginate } from "@/lib/api-helpers";

/**
 * GET /api/projects
 * Admin: semua proyek
 * Worker: proyek yang di-assign
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const role = (session!.user as any).role;
    const userId = session!.user.id;

    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      ...(role === "worker" ? { projectWorkers: { some: { workerId: userId } } } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { clientName: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          admin: { select: { fullName: true } },
          projectWorkers: {
            include: { worker: { select: { id: true, fullName: true, avatarUrl: true } } },
          },
          _count: { select: { tasks: true } },
          tasks: { select: { status: true } },
        },
        orderBy: { deadline: "asc" },
        ...paginate(page, limit),
      }),
      prisma.project.count({ where }),
    ]);

    const result = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const doneTasks = p.tasks.filter((t) => t.status === "done").length;
      const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
      const now = new Date();
      const daysUntilDeadline = Math.ceil(
        (new Date(p.deadline).getTime() - now.getTime()) / 86400000
      );

      return {
        id: p.id,
        title: p.title,
        clientName: p.clientName,
        description: p.description,
        budget: Number(p.budget),
        status: p.status,
        priority: p.priority,
        deadline: p.deadline,
        daysUntilDeadline,
        isUrgent: daysUntilDeadline <= 3 && daysUntilDeadline >= 0,
        progress,
        adminName: p.admin.fullName,
        workers: p.projectWorkers.map((pw) => ({
          id: pw.worker.id,
          fullName: pw.worker.fullName,
          avatarUrl: pw.worker.avatarUrl,
          roleInProject: pw.roleInProject,
        })),
        taskCount: p._count.tasks,
      };
    });

    return ok({ projects: result, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

const CreateProjectSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  clientName: z.string().min(1, "Nama klien wajib diisi"),
  budget: z.number().positive("Budget harus positif"),
  status: z.enum(["todo", "in_progress", "review", "done", "archived"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  deadline: z.string().transform((s) => new Date(s)),
  workers: z.array(z.object({
    workerId: z.string(),
    roleInProject: z.string().optional(),
  })).optional(),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    assignedTo: z.string().optional(),
    deadline: z.string().optional().transform((s) => s ? new Date(s) : undefined),
    estimatedHours: z.number().optional(),
  })).optional(),
  milestones: z.array(z.object({
    title: z.string(),
    dueDate: z.string().transform((s) => new Date(s)),
    amount: z.number().optional(),
  })).optional(),
});

/**
 * POST /api/projects
 * Admin only — buat proyek baru
 */
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole("admin");
    if (error) return error;

    const body = await request.json();
    const parsed = CreateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message, 422);
    }

    const { workers, tasks, milestones, deadline, ...projectData } = parsed.data;

    // Validasi deadline
    if (deadline <= new Date()) {
      // warning but allow (PRD: tampilkan warning)
    }

    const project = await prisma.project.create({
      data: {
        ...projectData,
        budget: projectData.budget,
        deadline,
        adminId: session!.user.id,
        projectWorkers: workers
          ? {
              create: workers.map((w) => ({
                workerId: w.workerId,
                roleInProject: w.roleInProject,
              })),
            }
          : undefined,
        tasks: tasks
          ? {
              create: tasks.map((t) => ({
                title: t.title,
                description: t.description,
                assignedTo: t.assignedTo,
                deadline: t.deadline,
                estimatedHours: t.estimatedHours,
              })),
            }
          : undefined,
        milestones: milestones
          ? {
              create: milestones.map((m) => ({
                title: m.title,
                dueDate: m.dueDate,
                amount: m.amount,
              })),
            }
          : undefined,
      },
      include: {
        projectWorkers: { include: { worker: { select: { id: true, fullName: true, email: true } } } },
        tasks: true,
        milestones: true,
      },
    });

    // Kirim notifikasi ke semua worker yang di-assign
    if (project.projectWorkers.length > 0) {
      await prisma.notification.createMany({
        data: project.projectWorkers.map((pw) => ({
          userId: pw.workerId,
          type: "project_assigned" as const,
          title: `Proyek Baru: ${project.title}`,
          body: `Anda telah ditugaskan ke proyek "${project.title}" dari klien ${project.clientName}.`,
          metadata: { projectId: project.id },
        })),
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: "CREATE",
        entity: "project",
        entityId: project.id,
        newValue: { title: project.title, clientName: project.clientName },
      },
    });

    return ok(project, 201);
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

