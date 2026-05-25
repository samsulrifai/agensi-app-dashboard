import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

/**
 * PUT /api/invoices/[id]/approve
 * Admin only — setujui invoice
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error } = await requireRole("admin");
    if (error) return error;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { worker: true, project: { select: { title: true } } },
    });

    if (!invoice) return err("Invoice tidak ditemukan", 404);
    if (invoice.status !== "pending") {
      return err(`Invoice tidak bisa di-approve karena status saat ini: ${invoice.status}`, 409);
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: "approved",
        approvedBy: session!.user.id,
        approvedAt: new Date(),
      },
    });

    // Notifikasi ke worker
    await prisma.notification.create({
      data: {
        userId: invoice.workerId,
        type: "invoice_approved",
        title: "Invoice Disetujui! 🎉",
        body: `Invoice Anda sebesar Rp ${Number(invoice.amount).toLocaleString("id-ID")} untuk proyek "${invoice.project.title}" telah disetujui.`,
        metadata: { invoiceId: id },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: "APPROVE",
        entity: "invoice",
        entityId: id,
        oldValue: { status: "pending" },
        newValue: { status: "approved" },
      },
    });

    return ok(updated);
  } catch (error) {
    console.error("[PUT /api/invoices/[id]/approve]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
