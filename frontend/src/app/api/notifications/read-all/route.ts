import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * PUT /api/notifications/read-all
 * Tandai semua notifikasi user sebagai sudah dibaca
 */
export async function PUT(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return ok({ updated: result.count });
  } catch (error) {
    console.error("[PUT /api/notifications/read-all]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

