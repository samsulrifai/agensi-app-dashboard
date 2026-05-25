import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/admin/dashboard/stats
 * Statistik ringkasan untuk admin dashboard KPI cards
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      activeProjects,
      totalWorkers,
      monthlyInvoices,
      lastMonthInvoices,
      pendingInvoicesCount,
      overdueProjects,
    ] = await Promise.all([
      prisma.project.count({ where: { status: { in: ["todo", "in_progress", "review"] } } }),
      prisma.user.count({ where: { role: "worker", isActive: true } }),
      prisma.invoice.findMany({
        where: { status: { in: ["approved", "paid"] }, invoiceDate: { gte: startOfMonth } },
        select: { amount: true },
      }),
      prisma.invoice.findMany({
        where: {
          status: { in: ["approved", "paid"] },
          invoiceDate: { gte: startOfLastMonth, lt: startOfMonth },
        },
        select: { amount: true },
      }),
      prisma.invoice.count({ where: { status: "pending" } }),
      prisma.project.count({
        where: {
          status: { in: ["todo", "in_progress", "review"] },
          deadline: { lt: now },
        },
      }),
    ]);

    const totalPayoutMTD = monthlyInvoices.reduce((s, inv) => s + Number(inv.amount), 0);
    const totalPayoutLastMonth = lastMonthInvoices.reduce((s, inv) => s + Number(inv.amount), 0);
    const deltaPercent =
      totalPayoutLastMonth > 0
        ? ((totalPayoutMTD - totalPayoutLastMonth) / totalPayoutLastMonth) * 100
        : 0;

    // Pending invoices total amount
    const pendingInvoices = await prisma.invoice.findMany({
      where: { status: "pending" },
      select: { amount: true },
    });
    const pendingAmount = pendingInvoices.reduce((s, inv) => s + Number(inv.amount), 0);

    return ok({
      activeProjects,
      totalWorkers,
      totalPayoutMTD,
      deltaPercent: Math.round(deltaPercent * 10) / 10,
      pendingInvoicesCount,
      pendingAmount,
      overdueProjects,
    });
  } catch (error) {
    console.error("[GET /api/admin/dashboard/stats]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

