import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";
import { sendEmail } from "@/lib/resend";
import { broadcastNotification } from "@/lib/supabase-realtime";
import { invalidateDashboard, invalidateReports } from "@/lib/cache";

/**
 * PUT /api/invoices/[id]/approve
 * Admin only — setujui invoice + audit log + email notifikasi
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
      include: {
        worker: { select: { id: true, fullName: true, email: true } },
        project: { select: { id: true, title: true, clientName: true, budget: true } },
      },
    });

    if (!invoice) return err("Invoice tidak ditemukan", 404);
    if (invoice.status !== "pending") {
      return err(`Invoice tidak bisa di-approve karena status saat ini: ${invoice.status}`, 409);
    }

    // Validasi: nominal tidak melebihi sisa budget proyek
    const otherInvoices = await prisma.invoice.aggregate({
      where: {
        projectId: invoice.projectId,
        status: { in: ["approved", "paid"] },
        id: { not: id },
      },
      _sum: { amount: true },
    });
    const otherTotal = Number(otherInvoices._sum.amount ?? 0);
    const remaining = Number(invoice.project.budget) - otherTotal;
    if (Number(invoice.amount) > remaining) {
      console.warn(`[Approve] Invoice Rp${Number(invoice.amount)} melebihi sisa budget Rp${remaining}`);
      // PRD: tampilkan warning tapi masih bisa approve
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: "approved",
        approvedBy: session!.user.id,
        approvedAt: new Date(),
      },
    });

    // Notifikasi in-app
    const notification = await prisma.notification.create({
      data: {
        userId: invoice.workerId,
        type: "invoice_approved",
        title: "Invoice Disetujui! 🎉",
        body: `Invoice Anda sebesar Rp ${Number(invoice.amount).toLocaleString("id-ID")} untuk proyek "${invoice.project.title}" telah disetujui.`,
        metadata: { invoiceId: id },
      },
    });

    // Realtime broadcast
    broadcastNotification(invoice.workerId, {
      id: notification.id,
      type: "invoice_approved",
      title: notification.title,
      body: notification.body,
      metadata: { invoiceId: id },
    }).catch(console.error);

    // Invalidate dashboard/reports cache
    invalidateDashboard();
    invalidateReports();

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session!.user.id,
        action: "APPROVE",
        entity: "invoice",
        entityId: id,
        oldValue: { status: "pending" },
        newValue: { status: "approved", approvedAt: new Date().toISOString() },
      },
    });

    // Email notifikasi via Resend (fire and forget)
    sendEmail({
      to: invoice.worker.email,
      subject: `Invoice Disetujui — ${invoice.project.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#10b981;">Invoice Anda Disetujui! 🎉</h2>
          <p>Halo <strong>${invoice.worker.fullName}</strong>,</p>
          <p>Invoice Anda untuk proyek <strong>${invoice.project.title}</strong> sebesar 
          <strong>Rp ${Number(invoice.amount).toLocaleString("id-ID")}</strong> telah disetujui.</p>
          <p>Pembayaran akan diproses segera.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
          <p style="color:#64748b;font-size:12px;">Agency App — Sistem Manajemen Proyek</p>
        </div>
      `,
    }).catch(console.error);

    return ok(updated);
  } catch (error) {
    console.error("[PUT /api/invoices/[id]/approve]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
