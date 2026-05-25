import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

/**
 * GET /api/notifications
 * List notifikasi user yang sedang login
 */
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly ? { isRead: false } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return ok({ notifications, unreadCount });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

