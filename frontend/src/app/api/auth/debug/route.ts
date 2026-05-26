import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * GET /api/auth/debug
 * Debug endpoint to test DB and bcrypt on Vercel
 * REMOVE THIS IN PRODUCTION
 */
export async function GET(request: NextRequest) {
  const results: Record<string, any> = {};
  
  // Test 1: DB connection
  try {
    const userCount = await prisma.user.count();
    results.db = { ok: true, userCount };
  } catch (e: any) {
    results.db = { ok: false, error: e.message };
  }
  
  // Test 2: Find admin user
  try {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@agensi.com" },
      select: { id: true, email: true, role: true, isActive: true, passwordHash: true },
    });
    if (admin) {
      results.admin = { 
        ok: true, 
        id: admin.id, 
        email: admin.email, 
        role: admin.role, 
        isActive: admin.isActive,
        hasHash: !!admin.passwordHash,
        hashPrefix: admin.passwordHash?.substring(0, 10) + "..."
      };
      
      // Test 3: bcrypt compare
      try {
        const isValid = await bcrypt.compare("admin123", admin.passwordHash);
        results.bcrypt = { ok: true, passwordMatch: isValid };
      } catch (e: any) {
        results.bcrypt = { ok: false, error: e.message };
      }
    } else {
      results.admin = { ok: false, error: "User not found" };
    }
  } catch (e: any) {
    results.admin = { ok: false, error: e.message };
  }
  
  // Test 4: Env vars check
  results.env = {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    DATABASE_URL: process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  };
  
  return Response.json(results);
}
