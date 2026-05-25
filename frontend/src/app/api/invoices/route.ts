import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireRole, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/invoices
 * Worker: invoice miliknya
 * Admin: semua invoice (filter by status)
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;
    const role = (session!.user as any).role;
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const workerId = searchParams.get("workerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {
      ...(role === "worker" ? { workerId: userId } : {}),
      ...(status ? { status } : {}),
      ...(role === "admin" && workerId ? { workerId } : {}),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          worker: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
          project: { select: { id: true, title: true, clientName: true } },
          approver: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return ok({
      invoices: invoices.map((inv) => ({
        ...inv,
        amount: Number(inv.amount),
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[GET /api/invoices]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

const InvoiceSchema = z.object({
  projectId: z.string().uuid("Project ID tidak valid"),
  amount: z.number().positive("Nominal harus positif"),
  dueDate: z.string().transform((s) => new Date(s)),
  notes: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
});

/**
 * POST /api/invoices
 * Worker only — submit invoice baru
 */
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireRole("worker");
    if (error) return error;

    const body = await request.json();
    const parsed = InvoiceSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0].message, 422);

    const userId = session!.user.id;
    const { projectId, amount, dueDate, notes, attachmentUrl } = parsed.data;

    // Verifikasi worker terlibat di proyek
    const membership = await prisma.projectWorker.findUnique({
      where: { projectId_workerId: { projectId, workerId: userId } },
    });
    if (!membership) return err("Anda tidak terlibat dalam proyek ini", 403);

    // Cek budget
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        invoices: {
          where: { status: { in: ["pending", "approved", "paid"] } },
          select: { amount: true },
        },
      },
    });
    if (!project) return err("Proyek tidak ditemukan", 404);

    const totalInvoiced = project.invoices.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0
    );

    if (totalInvoiced + amount > Number(project.budget)) {
      // PRD: tampilkan warning (tapi masih bisa submit)
      console.warn(`[Invoice] Nominal melebihi sisa budget proyek ${projectId}`);
    }

    const invoice = await prisma.invoice.create({
      data: {
        workerId: userId,
        projectId,
        amount,
        dueDate,
        notes,
        attachmentUrl,
        invoiceDate: new Date(),
      },
      include: {
        project: { select: { title: true, adminId: true, clientName: true } },
      },
    });

    // Notifikasi ke admin project
    await prisma.notification.create({
      data: {
        userId: invoice.project.adminId,
        type: "invoice_submitted",
        title: "Invoice Baru Masuk",
        body: `Invoice sebesar Rp ${amount.toLocaleString("id-ID")} dari worker untuk proyek "${invoice.project.title}" menunggu review.`,
        metadata: { invoiceId: invoice.id, projectId },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: "SUBMIT",
        entity: "invoice",
        entityId: invoice.id,
        newValue: { amount, projectId },
      },
    });

    return ok(invoice, 201);
  } catch (error) {
    console.error("[POST /api/invoices]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

