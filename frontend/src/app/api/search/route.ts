import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/search?q=keyword&scope=projects,tasks,workers
 * Auth — full-text search menggunakan PostgreSQL ILIKE
 * Optimized: limit 5 per scope, cepat < 200ms
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const scopeParam = searchParams.get("scope") || "projects,tasks,workers";

    if (!q || q.length < 2) {
      return ok({ projects: [], tasks: [], workers: [], query: q });
    }

    const scopes = scopeParam.split(",").map((s) => s.trim());
    const role = (session!.user as any).role;
    const userId = session!.user.id;
    const LIMIT = 5;

    const [projects, tasks, workers] = await Promise.all([
      // Projects
      scopes.includes("projects")
        ? prisma.project.findMany({
            where: {
              ...(role === "worker"
                ? { projectWorkers: { some: { workerId: userId } } }
                : {}),
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { clientName: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              title: true,
              clientName: true,
              status: true,
              priority: true,
              deadline: true,
            },
            take: LIMIT,
            orderBy: { updatedAt: "desc" },
          })
        : [],

      // Tasks
      scopes.includes("tasks")
        ? prisma.task.findMany({
            where: {
              ...(role === "worker" ? { assignedTo: userId } : {}),
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              title: true,
              status: true,
              deadline: true,
              projectId: true,
              project: { select: { title: true } },
            },
            take: LIMIT,
            orderBy: { updatedAt: "desc" },
          })
        : [],

      // Workers (admin only)
      scopes.includes("workers") && role === "admin"
        ? prisma.user.findMany({
            where: {
              role: "worker",
              OR: [
                { fullName: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              isActive: true,
              skills: true,
            },
            take: LIMIT,
          })
        : [],
    ]);

    return ok({
      query: q,
      projects,
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        deadline: t.deadline,
        projectId: t.projectId,
        projectTitle: t.project.title,
      })),
      workers,
      totalResults: projects.length + tasks.length + workers.length,
    });
  } catch (error) {
    console.error("[GET /api/search]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
