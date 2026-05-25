import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";

const RejectSchema = z.object({
  reason: z.string().min(5, "Alasan penolakan minimal 5 karakter"),
});

/**
 * PUT /api/invoices/[id]/reject
 * Admin only — tolak invoice beserta alasan
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error } = await requireRole("admin");
    if (error) return error;

    const body = await request.json();
    const parsed = RejectSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { project: { select: { title: true } } },
    });

    if (!invoice) return err("Invoice tidak ditemukan", 404);
    if (invoice.status !== "pending") {
      return err(`Invoice tidak bisa ditolak karena status saat ini: ${invoice.status}`, 409);
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: "rejected",
        rejectionReason: parsed.data.reason,
      },
    });

    // Notifikasi ke worker
    await prisma.notification.create({
      data: {
        userId: invoice.workerId,
        type: "invoice_rejected",
        title: "Invoice Ditolak",
        body: `Invoice Anda untuk proyek "${invoice.project.title}" ditolak. Alasan: ${parsed.data.reason}`,
        metadata: { invoiceId: id },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: "REJECT",
        entity: "invoice",
        entityId: id,
        oldValue: { status: "pending" },
        newValue: { status: "rejected", rejectionReason: parsed.data.reason },
      },
    });

    return ok(updated);
  } catch (error) {
    console.error("[PUT /api/invoices/[id]/reject]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
