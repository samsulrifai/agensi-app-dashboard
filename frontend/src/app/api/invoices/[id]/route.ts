import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/invoices/[id]
 * Auth — detail invoice dengan info lengkap
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;
    const role = (session!.user as any).role;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        worker: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            phone: true,
            skills: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            clientName: true,
            budget: true,
            status: true,
            deadline: true,
          },
        },
        approver: { select: { id: true, fullName: true } },
      },
    });

    if (!invoice) return err("Invoice tidak ditemukan", 404);

    // Worker hanya bisa lihat invoice miliknya
    if (role === "worker" && invoice.workerId !== userId) {
      return err("Akses ditolak", 403);
    }

    // Hitung sisa budget proyek
    const projectInvoices = await prisma.invoice.aggregate({
      where: {
        projectId: invoice.projectId,
        status: { in: ["pending", "approved", "paid"] },
        id: { not: id }, // exclude invoice ini sendiri
      },
      _sum: { amount: true },
    });
    const otherTotal = Number(projectInvoices._sum.amount ?? 0);
    const projectBudget = Number(invoice.project.budget);
    const remainingBudget = projectBudget - otherTotal;
    const exceedsBudget = Number(invoice.amount) > remainingBudget;

    return ok({
      ...invoice,
      amount: Number(invoice.amount),
      project: {
        ...invoice.project,
        budget: projectBudget,
      },
      budgetInfo: {
        projectBudget,
        otherInvoicesTotal: otherTotal,
        remainingBudget,
        exceedsBudget,
      },
    });
  } catch (error) {
    console.error("[GET /api/invoices/[id]]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
