import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma dan bcryptjs tidak bisa di-bundle oleh webpack/Next.js
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
