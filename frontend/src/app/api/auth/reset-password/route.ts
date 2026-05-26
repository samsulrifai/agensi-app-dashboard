import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-helpers";

/**
 * POST /api/auth/reset-password
 * Public — reset password dengan token yang valid
 * Body: { token: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return err("Token tidak valid", 422);
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return err("Password minimal 8 karakter", 422);
    }

    // Cari token yang valid
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });

    if (!resetToken) {
      return err("Token tidak valid atau sudah kadaluarsa", 400);
    }

    if (resetToken.usedAt) {
      return err("Token sudah digunakan. Silakan request link baru.", 400);
    }

    if (resetToken.expiresAt < new Date()) {
      return err("Token sudah kadaluarsa. Silakan request link baru.", 400);
    }

    // Hash password baru
    const passwordHash = await hash(password, 12);

    // Update password + tandai token sebagai sudah digunakan (atomic)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
      // Audit log
      prisma.auditLog.create({
        data: {
          userId: resetToken.userId,
          action: "RESET_PASSWORD",
          entity: "user",
          entityId: resetToken.userId,
          newValue: { method: "reset_token" },
        },
      }),
    ]);

    return ok({ message: "Password berhasil diubah. Silakan login." });
  } catch (error) {
    console.error("[POST /api/auth/reset-password]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

/**
 * GET /api/auth/reset-password?token=xxx
 * Validasi token (untuk frontend cek sebelum tampilkan form)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) return err("Token diperlukan", 422);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: { expiresAt: true, usedAt: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return err("Token tidak valid atau sudah kadaluarsa", 400);
    }

    return ok({ valid: true, expiresAt: resetToken.expiresAt });
  } catch (error) {
    console.error("[GET /api/auth/reset-password]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
