import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-helpers";

/**
 * GET /api/reports/financial/export?format=csv&startDate=&endDate=&months=N
 * Admin only — export laporan keuangan sebagai CSV atau JSON
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const monthsParam = searchParams.get("months");

    // Tentukan periode
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      const months = parseInt(monthsParam || "6");
      startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: { gte: startDate, lte: endDate },
        status: { in: ["approved", "paid", "pending", "rejected"] },
      },
      include: {
        worker: { select: { fullName: true, email: true } },
        project: { select: { title: true, clientName: true } },
        approver: { select: { fullName: true } },
      },
      orderBy: { invoiceDate: "asc" },
    });

    if (format === "csv") {
      const rows: string[][] = [
        ["No", "Tanggal", "Worker", "Email Worker", "Proyek", "Client", "Jumlah (IDR)", "Status", "Jatuh Tempo", "Disetujui Oleh", "Alasan Penolakan"],
      ];

      invoices.forEach((inv, i) => {
        rows.push([
          String(i + 1),
          new Date(inv.invoiceDate).toLocaleDateString("id-ID"),
          inv.worker.fullName,
          inv.worker.email,
          inv.project.title,
          inv.project.clientName,
          Number(inv.amount).toLocaleString("id-ID"),
          inv.status,
          new Date(inv.dueDate).toLocaleDateString("id-ID"),
          inv.approver?.fullName || "-",
          inv.rejectionReason || "-",
        ]);
      });

      // Escape CSV cells (handle commas and quotes)
      const csv = rows
        .map((row) =>
          row
            .map((cell) => {
              const str = String(cell);
              if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(",")
        )
        .join("\n");

      const filename = `laporan-keuangan-${startDate.toISOString().slice(0, 10)}-${endDate.toISOString().slice(0, 10)}.csv`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Default: JSON export
    return new NextResponse(
      JSON.stringify({
        exportedAt: new Date().toISOString(),
        period: { start: startDate, end: endDate },
        totalInvoices: invoices.length,
        data: invoices.map((inv) => ({
          id: inv.id,
          date: inv.invoiceDate,
          worker: inv.worker.fullName,
          workerEmail: inv.worker.email,
          project: inv.project.title,
          client: inv.project.clientName,
          amount: Number(inv.amount),
          status: inv.status,
          dueDate: inv.dueDate,
          approvedBy: inv.approver?.fullName,
          rejectionReason: inv.rejectionReason,
        })),
      }, null, 2),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="laporan-keuangan.json"`,
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/reports/financial/export]", error);
    return new NextResponse(JSON.stringify({ error: "Terjadi kesalahan server" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
