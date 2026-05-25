import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

const StatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "review", "done", "archived"]),
});

/**
 * PUT /api/projects/[id]/status
 * Update status proyek
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
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return err("Proyek tidak ditemukan", 404);

    const updated = await prisma.project.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.status === "done" ? { completedAt: new Date() } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: "UPDATE_STATUS",
        entity: "project",
        entityId: id,
        oldValue: { status: project.status },
        newValue: { status: parsed.data.status },
      },
    });

    return ok(updated);
  } catch (error) {
    console.error("[PUT /api/projects/[id]/status]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
