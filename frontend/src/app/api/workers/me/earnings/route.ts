import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/workers/me/earnings
 * Ringkasan pendapatan worker: total bulan ini, bulan lalu, breakdown bulanan 6 bulan
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;

    // Total pendapatan (invoices dengan status approved/paid)
    const allInvoices = await prisma.invoice.findMany({
      where: {
        workerId: userId,
        status: { in: ["approved", "paid"] },
      },
      include: { project: { select: { title: true, clientName: true } } },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthTotal = allInvoices
      .filter((inv) => inv.invoiceDate >= startOfMonth)
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    const lastMonthTotal = allInvoices
      .filter(
        (inv) => inv.invoiceDate >= startOfLastMonth && inv.invoiceDate < startOfMonth
      )
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    const deltaPercent =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : 0;

    // Pending payouts
    const pendingInvoices = await prisma.invoice.findMany({
      where: { workerId: userId, status: "pending" },
      select: { amount: true },
    });
    const pendingTotal = pendingInvoices.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0
    );

    // Monthly breakdown last 6 months
    const monthlyData: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = monthStart.toLocaleString("id-ID", { month: "short" });

      const monthTotal = allInvoices
        .filter(
          (inv) => inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd
        )
        .reduce((sum, inv) => sum + Number(inv.amount), 0);

      monthlyData.push({ month: monthLabel, amount: monthTotal });
    }

    // Per project breakdown
    const perProject: Record<string, { projectTitle: string; clientName: string; total: number }> = {};
    for (const inv of allInvoices) {
      const pid = inv.projectId;
      if (!perProject[pid]) {
        perProject[pid] = {
          projectTitle: inv.project.title,
          clientName: inv.project.clientName,
          total: 0,
        };
      }
      perProject[pid].total += Number(inv.amount);
    }

    return ok({
      thisMonthTotal,
      lastMonthTotal,
      deltaPercent: Math.round(deltaPercent * 10) / 10,
      pendingTotal,
      monthlyBreakdown: monthlyData,
      perProjectBreakdown: Object.values(perProject),
    });
  } catch (error) {
    console.error("[GET /api/workers/me/earnings]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

