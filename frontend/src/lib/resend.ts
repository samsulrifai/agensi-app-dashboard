/**
 * src/lib/resend.ts
 * Resend email client dengan graceful fallback jika API key belum diset
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = "noreply@yourdomain.com"; // Ganti dengan domain terverifikasi di Resend

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY || RESEND_API_KEY === "re_your_resend_api_key") {
    // Development mode: log ke console saja
    console.log("[Resend] Email tidak dikirim (API key belum diset)");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    return { ok: true }; // Return ok agar flow tidak error di dev
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("[Resend] Failed:", errBody);
      return { ok: false, error: "Gagal mengirim email" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[Resend] Exception:", err);
    return { ok: false, error: "Gagal mengirim email" };
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export function resetPasswordTemplate(resetUrl: string, userName: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#059669);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Agency App</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Reset Password</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;">Halo, ${userName}!</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
                Kami menerima permintaan untuk mereset password akun Anda.
                Klik tombol di bawah untuk membuat password baru.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background:#10b981;border-radius:8px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;text-align:center;">
                Link ini akan kadaluarsa dalam <strong>1 jam</strong>.
              </p>
              <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;">
                Jika Anda tidak meminta reset password, abaikan email ini.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Agency App &bull; Sistem Manajemen Proyek Freelance
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export { APP_URL };
