import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/reports/financial
 * Admin only — laporan keuangan dengan breakdown
 * Query params:
 *   - months: 1 | 3 | 6 | 12 (default: 6)
 *   - period: 1m | 3m | 6m | 1y | custom (legacy support)
 *   - startDate, endDate: untuk custom period
 *   - workerId: filter by worker
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;

    const { searchParams } = new URL(request.url);

    // Support both ?months=N (new) and ?period=Nm (legacy)
    const monthsParam = searchParams.get("months");
    const period = searchParams.get("period") || "6m";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");
    const workerIdFilter = searchParams.get("workerId") || undefined;

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (monthsParam) {
      const months = parseInt(monthsParam) || 6;
      startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    } else if (period === "custom" && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      const periodMap: Record<string, number> = {
        "1m": 1, "3m": 3, "6m": 6, "1y": 12,
      };
      const months = periodMap[period] || 6;
      startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    }

    const invoiceWhere: any = {
      invoiceDate: { gte: startDate, lte: endDate },
      status: { in: ["approved", "paid"] },
      ...(workerIdFilter ? { workerId: workerIdFilter } : {}),
    };

    // Semua invoice dalam periode (approved + paid)
    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
      include: {
        worker: { select: { id: true, fullName: true } },
        project: { select: { id: true, title: true, clientName: true, budget: true } },
      },
    });

    // Pending invoices (all time)
    const pendingInvoices = await prisma.invoice.findMany({
      where: { status: "pending" },
      select: { amount: true },
    });

    // Summary totals per status (untuk filter waktu)
    const [allPaid, allApproved, allPending, allRejected] = await Promise.all([
      prisma.invoice.aggregate({
        where: { status: "paid", invoiceDate: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { status: "approved", invoiceDate: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { status: "pending" },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { status: "rejected", invoiceDate: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
    ]);

    // Monthly breakdown — iterate bulan dari startDate
    const monthDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (30 * 86400000)
    );
    const monthly: { month: string; label: string; total: number; invoiceCount: number }[] = [];

    for (let i = 0; i < Math.min(monthDiff, 12); i++) {
      const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0, 23, 59, 59);
      if (monthStart > endDate) break;

      const monthInvoices = invoices.filter(
        (inv) => inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd
      );

      const label = monthStart.toLocaleString("id-ID", { month: "short", year: "numeric" });
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;

      monthly.push({
        month: monthKey,
        label,
        total: monthInvoices.reduce((s, inv) => s + Number(inv.amount), 0),
        invoiceCount: monthInvoices.length,
      });
    }

    // Per project breakdown
    const projectMap: Record<string, {
      projectId: string; projectTitle: string; clientName: string;
      budget: number; paidOut: number; margin: number;
    }> = {};
    for (const inv of invoices) {
      const pid = inv.projectId;
      if (!projectMap[pid]) {
        projectMap[pid] = {
          projectId: pid,
          projectTitle: inv.project.title,
          clientName: inv.project.clientName,
          budget: Number(inv.project.budget),
          paidOut: 0,
          margin: 0,
        };
      }
      projectMap[pid].paidOut += Number(inv.amount);
    }
    for (const p of Object.values(projectMap)) {
      p.margin = p.budget > 0 ? Math.round(((p.budget - p.paidOut) / p.budget) * 100) : 0;
    }

    // Per worker breakdown
    const workerMap: Record<string, { workerId: string; workerName: string; totalPayout: number; invoiceCount: number }> = {};
    for (const inv of invoices) {
      const wid = inv.workerId;
      if (!workerMap[wid]) {
        workerMap[wid] = { workerId: wid, workerName: inv.worker.fullName, totalPayout: 0, invoiceCount: 0 };
      }
      workerMap[wid].totalPayout += Number(inv.amount);
      workerMap[wid].invoiceCount++;
    }

    // Per client breakdown
    const clientMap: Record<string, { clientName: string; totalPayout: number; projectCount: number }> = {};
    for (const inv of invoices) {
      const cn = inv.project.clientName;
      if (!clientMap[cn]) {
        clientMap[cn] = { clientName: cn, totalPayout: 0, projectCount: 0 };
      }
      clientMap[cn].totalPayout += Number(inv.amount);
    }
    // Count unique projects per client
    for (const pid of Object.keys(projectMap)) {
      const cn = projectMap[pid].clientName;
      if (clientMap[cn]) clientMap[cn].projectCount++;
    }

    // Projects completed in period
    const projectsCompleted = await prisma.project.count({
      where: {
        status: "done",
        completedAt: { gte: startDate, lte: endDate },
      },
    });

    // Total revenue = sum of project budgets that have paid invoices in period
    const totalRevenue = Object.values(projectMap).reduce((s, p) => s + p.budget, 0);
    const totalPayout = Number(allPaid._sum.amount ?? 0) + Number(allApproved._sum.amount ?? 0);
    const margin = totalRevenue > 0 ? Math.round(((totalRevenue - totalPayout) / totalRevenue) * 100) : 0;

    // monthlyTrend format (requested by Task 2)
    const monthlyTrend = monthly.map((m) => ({
      month: m.month,
      label: m.label,
      revenue: m.total, // proxy: use payout as revenue (no separate revenue tracking)
      payout: m.total,
      invoiceCount: m.invoiceCount,
    }));

    return ok({
      period: { start: startDate, end: endDate },
      summary: {
        totalRevenue,
        totalPayout,
        margin,
        projectsCompleted,
        totalPaid: Number(allPaid._sum.amount ?? 0),
        totalApproved: Number(allApproved._sum.amount ?? 0),
        totalPending: Number(allPending._sum.amount ?? 0),
        totalRejected: Number(allRejected._sum.amount ?? 0),
        totalInvoices: invoices.length,
        pendingCount: pendingInvoices.length,
      },
      // Primary keys (used by frontend)
      monthly,
      monthlyTrend,
      byProject: Object.values(projectMap).sort((a, b) => b.paidOut - a.paidOut),
      byWorker: Object.values(workerMap).sort((a, b) => b.totalPayout - a.totalPayout),
      byClient: Object.values(clientMap).sort((a, b) => b.totalPayout - a.totalPayout),
      // Task 2 required keys
      breakdownByProject: Object.values(projectMap).sort((a, b) => b.paidOut - a.paidOut),
      breakdownByWorker: Object.values(workerMap).sort((a, b) => b.totalPayout - a.totalPayout),
      breakdownByClient: Object.values(clientMap).sort((a, b) => b.totalPayout - a.totalPayout),
      // Legacy keys for backward compat
      monthlyBreakdown: monthly,
      perProjectBreakdown: Object.values(projectMap),
      perWorkerBreakdown: Object.values(workerMap).sort((a, b) => b.totalPayout - a.totalPayout),
    });

  } catch (error) {
    console.error("[GET /api/reports/financial]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
