import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-helpers";

const RegisterSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  role: z.enum(["worker", "admin"]).default("worker"),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message, 422);
    }

    const { email, password, fullName, role, phone } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return err("Email sudah terdaftar", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
        phone,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    return ok(user, 201);
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return err("Terjadi kesalahan server", 500);
  }
}

