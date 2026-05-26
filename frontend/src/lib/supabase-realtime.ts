/**
 * src/lib/supabase-realtime.ts
 * Supabase Realtime broadcast menggunakan REST API
 * Tidak butuh npm package — pakai fetch ke Realtime REST endpoint
 * 
 * Frontend client harus subscribe ke channel: notifications:{userId}
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isConfigured =
  SUPABASE_URL &&
  SUPABASE_URL !== "https://your-project.supabase.co" &&
  SUPABASE_SERVICE_ROLE_KEY &&
  SUPABASE_SERVICE_ROLE_KEY !== "your-service-role-key";

export interface NotificationPayload {
  id?: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

/**
 * Broadcast notifikasi ke channel Supabase Realtime user tertentu
 * Channel name: notifications:{userId}
 * Frontend subscribes dengan: supabase.channel(`notifications:${userId}`)
 */
export async function broadcastNotification(
  userId: string,
  notification: NotificationPayload
): Promise<void> {
  if (!isConfigured) {
    // Dev mode: log saja
    console.log(`[Realtime] broadcast → notifications:${userId}`, notification.title);
    return;
  }

  try {
    const channel = `notifications:${userId}`;
    const res = await fetch(
      `${SUPABASE_URL}/realtime/v1/api/broadcast`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              topic: channel,
              event: "new_notification",
              payload: {
                ...notification,
                createdAt: notification.createdAt ?? new Date().toISOString(),
              },
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("[Realtime] broadcast error:", errBody);
    }
  } catch (err) {
    // Non-critical: jangan sampai gagalkan request utama
    console.error("[Realtime] broadcast exception:", err);
  }
}

/**
 * Broadcast ke multiple users sekaligus
 */
export async function broadcastToMany(
  userIds: string[],
  notification: NotificationPayload
): Promise<void> {
  await Promise.allSettled(
    userIds.map((uid) => broadcastNotification(uid, notification))
  );
}
