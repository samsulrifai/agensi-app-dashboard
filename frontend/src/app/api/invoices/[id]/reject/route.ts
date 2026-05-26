import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, ok, err } from "@/lib/api-helpers";
import { sendEmail } from "@/lib/resend";

const RejectSchema = z.object({
  reason: z.string().min(5, "Alasan penolakan minimal 5 karakter"),
});

/**
 * PUT /api/invoices/[id]/reject
 * Admin only — tolak invoice (reason wajib) + audit log + email
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
      include: {
        worker: { select: { id: true, fullName: true, email: true } },
        project: { select: { title: true } },
      },
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

    // Notifikasi in-app
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

    // Email notifikasi (fire and forget)
    sendEmail({
      to: invoice.worker.email,
      subject: `Invoice Ditolak — ${invoice.project.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#ef4444;">Invoice Ditolak</h2>
          <p>Halo <strong>${invoice.worker.fullName}</strong>,</p>
          <p>Mohon maaf, invoice Anda untuk proyek <strong>${invoice.project.title}</strong> sebesar 
          <strong>Rp ${Number(invoice.amount).toLocaleString("id-ID")}</strong> tidak dapat disetujui.</p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
            <strong>Alasan Penolakan:</strong><br/>
            <span style="color:#dc2626;">${parsed.data.reason}</span>
          </div>
          <p>Anda dapat memperbaiki dan mengajukan ulang invoice setelah memperhatikan alasan di atas.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
          <p style="color:#64748b;font-size:12px;">Agency App — Sistem Manajemen Proyek</p>
        </div>
      `,
    }).catch(console.error);

    return ok(updated);
  } catch (error) {
    console.error("[PUT /api/invoices/[id]/reject]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
