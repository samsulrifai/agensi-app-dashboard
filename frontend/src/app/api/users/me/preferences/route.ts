import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession, ok, err } from "@/lib/api-helpers";

const PreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  language: z.enum(["id", "en"]).optional(),
});

/**
 * GET /api/users/me/preferences
 * Auth — ambil preferensi user saat ini
 */
export async function GET(_request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;

    const pref = await prisma.userPreference.findUnique({ where: { userId } });

    // Return default jika belum ada
    return ok(
      pref ?? {
        userId,
        theme: "system",
        emailNotifications: true,
        pushNotifications: true,
        language: "id",
      }
    );
  } catch (error) {
    console.error("[GET /api/users/me/preferences]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

/**
 * PUT /api/users/me/preferences
 * Auth — update preferensi user (partial update)
 * Body: { theme?, emailNotifications?, pushNotifications?, language? }
 */
export async function PUT(request: NextRequest) {
  try {
    const { session, error } = await getAuthSession();
    if (error) return error;

    const userId = session!.user.id;
    const body = await request.json();

    const parsed = PreferencesSchema.safeParse(body);
    if (!parsed.success) {
      return err(parsed.error.issues[0].message, 422);
    }

    const { theme, emailNotifications, pushNotifications, language } = parsed.data;

    // Upsert — buat baru jika belum ada, update jika sudah ada
    const pref = await prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...(theme && { theme }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(language && { language }),
      },
      update: {
        ...(theme && { theme }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(language && { language }),
      },
    });

    return ok(pref);
  } catch (error) {
    console.error("[PUT /api/users/me/preferences]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
