/**
 * prisma/seed-production.ts
 * Production seed — hanya buat 1 akun admin default
 * JANGAN jalankan ini di production jika admin sudah ada
 * 
 * Usage: ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-production.ts
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Production seed: membuat admin default...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@agencyapp.id";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD env var diperlukan untuk production seed");
  }

  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD minimal 12 karakter untuk keamanan");
  }

  // Cek apakah admin sudah ada
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`✅ Admin ${adminEmail} sudah ada — skip.`);
    return;
  }

  const passwordHash = await hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      fullName: "Administrator",
      passwordHash,
      role: "admin",
      isActive: true,
    },
  });

  console.log(`✅ Admin dibuat: ${admin.email} (id: ${admin.id})`);
  console.log("⚠️  Segera ubah password setelah login pertama!");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
