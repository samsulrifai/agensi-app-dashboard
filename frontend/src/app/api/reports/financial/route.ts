import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/reports/financial
 * Admin only — laporan keuangan dengan breakdown
 * Query params: period (1m | 3m | 6m | 1y | custom), startDate, endDate
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "6m";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (period === "custom" && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      const periodMap: Record<string, number> = {
        "1m": 1,
        "3m": 3,
        "6m": 6,
        "1y": 12,
      };
      const months = periodMap[period] || 6;
      startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    }

    // Total revenue: sum semua invoice approved/paid dalam periode
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: { gte: startDate, lte: endDate },
        status: { in: ["approved", "paid"] },
      },
      include: {
        worker: { select: { id: true, fullName: true } },
        project: { select: { id: true, title: true, clientName: true, budget: true } },
      },
    });

    const totalPayout = invoices.reduce((s, inv) => s + Number(inv.amount), 0);

    // Revenue per project (budget yang sudah ada invoice approved)
    const projectMap: Record<string, {
      projectTitle: string;
      clientName: string;
      budget: number;
      paidOut: number;
      margin: number;
    }> = {};

    for (const inv of invoices) {
      const pid = inv.projectId;
      if (!projectMap[pid]) {
        projectMap[pid] = {
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
      p.margin = ((p.budget - p.paidOut) / p.budget) * 100;
    }

    // Monthly breakdown
    const monthCount = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (30 * 86400000)
    );
    const monthlyData: { month: string; payout: number; invoiceCount: number }[] = [];

    for (let i = 0; i < Math.min(monthCount, 12); i++) {
      const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0);
      if (monthStart > endDate) break;

      const monthInvoices = invoices.filter(
        (inv) => inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd
      );

      monthlyData.push({
        month: monthStart.toLocaleString("id-ID", { month: "short", year: "2-digit" }),
        payout: monthInvoices.reduce((s, inv) => s + Number(inv.amount), 0),
        invoiceCount: monthInvoices.length,
      });
    }

    // Per worker breakdown
    const workerMap: Record<string, { workerName: string; totalPayout: number }> = {};
    for (const inv of invoices) {
      const wid = inv.workerId;
      if (!workerMap[wid]) {
        workerMap[wid] = { workerName: inv.worker.fullName, totalPayout: 0 };
      }
      workerMap[wid].totalPayout += Number(inv.amount);
    }

    // Pending invoices
    const pendingInvoices = await prisma.invoice.findMany({
      where: { status: "pending" },
      include: {
        worker: { select: { fullName: true } },
        project: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({
      period: { start: startDate, end: endDate },
      summary: {
        totalPayout,
        totalInvoices: invoices.length,
        pendingCount: pendingInvoices.length,
        pendingAmount: pendingInvoices.reduce((s, inv) => s + Number(inv.amount), 0),
      },
      monthlyBreakdown: monthlyData,
      perProjectBreakdown: Object.values(projectMap),
      perWorkerBreakdown: Object.values(workerMap).sort((a, b) => b.totalPayout - a.totalPayout),
      pendingInvoices: pendingInvoices.map((inv) => ({
        id: inv.id,
        workerName: inv.worker.fullName,
        projectTitle: inv.project.title,
        amount: Number(inv.amount),
        invoiceDate: inv.invoiceDate,
      })),
    });
  } catch (error) {
    console.error("[GET /api/reports/financial]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

