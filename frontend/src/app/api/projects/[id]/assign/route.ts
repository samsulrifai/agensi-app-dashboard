import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";
import { broadcastToMany } from "@/lib/supabase-realtime";
import { invalidateDashboard, invalidateWorkers } from "@/lib/cache";

const AssignSchema = z.object({
  workers: z.array(z.object({
    workerId: z.string().uuid(),
    roleInProject: z.string().optional(),
  })).min(1, "Minimal 1 worker"),
});

/**
 * POST /api/projects/[id]/assign
 * Admin only — assign worker(s) ke proyek
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error } = await requireRole("admin");
    if (error) return error;

    const body = await request.json();
    const parsed = AssignSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return err("Proyek tidak ditemukan", 404);

    // Upsert project_workers
    const results = await Promise.allSettled(
      parsed.data.workers.map((w) =>
        prisma.projectWorker.upsert({
          where: { projectId_workerId: { projectId: id, workerId: w.workerId } },
          create: { projectId: id, workerId: w.workerId, roleInProject: w.roleInProject },
          update: { roleInProject: w.roleInProject },
        })
      )
    );

    // Notify newly assigned workers + broadcast
    const newWorkers = parsed.data.workers;
    const notifData = newWorkers.map((w) => ({
      userId: w.workerId,
      type: "project_assigned" as const,
      title: `Anda di-assign ke proyek: ${project.title}`,
      body: `Admin menugaskan Anda ke proyek "${project.title}" dari klien ${project.clientName}.`,
      metadata: { projectId: project.id },
    }));

    await prisma.notification.createMany({ data: notifData, skipDuplicates: true });

    // Realtime broadcast ke semua worker yang di-assign
    broadcastToMany(
      newWorkers.map((w) => w.workerId),
      {
        type: "project_assigned",
        title: `Proyek Baru: ${project.title}`,
        body: `Anda ditugaskan ke proyek "${project.title}" dari klien ${project.clientName}.`,
        metadata: { projectId: project.id },
      }
    ).catch(console.error);

    invalidateDashboard();
    invalidateWorkers();

    return ok({ assigned: newWorkers.length });
  } catch (error) {
    console.error("[POST /api/projects/[id]/assign]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
