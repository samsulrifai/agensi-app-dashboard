import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
  deadline: z.string().optional().transform((s) => s ? new Date(s) : undefined),
  estimatedHours: z.number().optional(),
});

/**
 * GET /api/tasks/[id]
 * Detail task
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
      include: {
        worker: { select: { id: true, fullName: true, avatarUrl: true } },
        project: { select: { id: true, title: true, clientName: true } },
        timeLogs: { orderBy: { startedAt: "desc" } },
        attachments: true,
      },
    });

    if (!task) return err("Task tidak ditemukan", 404);
    return ok(task);
  } catch (error) {
    console.error("[GET /api/tasks/[id]]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

/**
 * PUT /api/tasks/[id]
 * Update task (status, title, dll)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error } = await getAuthSession();
    if (error) return error;

    const body = await request.json();
    const parsed = UpdateTaskSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return err("Task tidak ditemukan", 404);

    const updated = await prisma.task.update({
      where: { id },
      data: parsed.data,
    });

    return ok(updated);
  } catch (error) {
    console.error("[PUT /api/tasks/[id]]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
