import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/workers/me/dashboard
 * Worker dashboard summary: earnings, active projects, rating, recent notifications
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      activeProjects,
      monthInvoices,
      lastMonthInvoices,
      pendingInvoices,
      avgRating,
      recentNotifications,
    ] = await Promise.all([
      prisma.project.findMany({
        where: {
          projectWorkers: { some: { workerId: userId } },
          status: { in: ["todo", "in_progress", "review"] },
        },
        include: {
          tasks: {
            where: { assignedTo: userId },
            select: { status: true, deadline: true },
          },
        },
        orderBy: { deadline: "asc" },
        take: 3,
      }),
      prisma.invoice.findMany({
        where: {
          workerId: userId,
          status: { in: ["approved", "paid"] },
          invoiceDate: { gte: startOfMonth },
        },
        select: { amount: true },
      }),
      prisma.invoice.findMany({
        where: {
          workerId: userId,
          status: { in: ["approved", "paid"] },
          invoiceDate: { gte: startOfLastMonth, lt: startOfMonth },
        },
        select: { amount: true },
      }),
      prisma.invoice.findMany({
        where: { workerId: userId, status: "pending" },
        select: { amount: true },
      }),
      prisma.rating.aggregate({
        where: { workerId: userId },
        _avg: { overallScore: true },
        _count: true,
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const thisMonthTotal = monthInvoices.reduce((s, inv) => s + Number(inv.amount), 0);
    const lastMonthTotal = lastMonthInvoices.reduce((s, inv) => s + Number(inv.amount), 0);
    const pendingTotal = pendingInvoices.reduce((s, inv) => s + Number(inv.amount), 0);

    const deltaPercent =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

    const projectsWithProgress = activeProjects.map((p) => {
      const total = p.tasks.length;
      const done = p.tasks.filter((t) => t.status === "done").length;
      const daysLeft = Math.ceil((new Date(p.deadline).getTime() - now.getTime()) / 86400000);
      return {
        id: p.id,
        title: p.title,
        status: p.status,
        deadline: p.deadline,
        daysUntilDeadline: daysLeft,
        isUrgent: daysLeft <= 3 && daysLeft >= 0,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });

    const unreadCount = recentNotifications.filter((n) => !n.isRead).length;

    return ok({
      earnings: {
        thisMonth: thisMonthTotal,
        lastMonth: lastMonthTotal,
        deltaPercent: Math.round(deltaPercent * 10) / 10,
        pending: pendingTotal,
        pendingCount: pendingInvoices.length,
      },
      activeProjectsCount: activeProjects.length,
      nearingDeadlineCount: activeProjects.filter((p) => {
        const d = Math.ceil((new Date(p.deadline).getTime() - now.getTime()) / 86400000);
        return d <= 3 && d >= 0;
      }).length,
      projects: projectsWithProgress,
      rating: {
        overall: avgRating._avg.overallScore
          ? Math.round(Number(avgRating._avg.overallScore) * 10) / 10
          : 0,
        totalReviews: avgRating._count,
      },
      recentNotifications,
      unreadNotifications: unreadCount,
    });
  } catch (error) {
    console.error("[GET /api/workers/me/dashboard]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

