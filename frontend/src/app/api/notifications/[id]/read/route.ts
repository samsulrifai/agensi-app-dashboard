import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * PUT /api/notifications/[id]/read
 * Tandai notifikasi sebagai sudah dibaca
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) return err("Notifikasi tidak ditemukan", 404);
    if (notification.userId !== userId) return err("Akses ditolak", 403);

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return ok(updated);
  } catch (error) {
    console.error("[PUT /api/notifications/[id]/read]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
