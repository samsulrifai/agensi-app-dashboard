import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-helpers";
import { sendEmail, resetPasswordTemplate, APP_URL } from "@/lib/resend";
import { applyRateLimit, getRequestIP } from "@/lib/rate-limit";

/**
 * POST /api/auth/forgot-password
 * Public — request reset password link via email
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20/min per IP
    const ip = getRequestIP(request);
    const rateLimited = applyRateLimit(`${ip}:auth`, "auth");
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return err("Email wajib diisi", 422);
    }

    // Cari user
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Selalu return sukses untuk mencegah email enumeration
    const SUCCESS_RESPONSE = ok({
      message: "Jika email terdaftar, link reset password telah dikirim.",
    });

    if (!user) return SUCCESS_RESPONSE;

    // Hapus token lama yang belum digunakan
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    // Generate token baru (secure random 32 bytes = 64 hex chars)
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // Kirim email
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset Password — Agency App",
      html: resetPasswordTemplate(resetUrl, user.fullName),
    });

    return SUCCESS_RESPONSE;
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error);
    return err("Terjadi kesalahan server", 500);
  }
}
