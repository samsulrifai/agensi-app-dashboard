import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/debug
 * TEMPORARY - hapus setelah fix
 */
export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, isActive: true, fullName: true },
    take: 20,
  });

  return Response.json({
    userCount: users.length,
    users: users.map(u => ({
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      name: u.fullName,
    })),
    env: {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
  });
}
