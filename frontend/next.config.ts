import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Prisma dan bcryptjs tidak bisa di-bundle oleh Next.js
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],

  // Disable source maps di production untuk keamanan dan ukuran bundle
  productionBrowserSourceMaps: false,

  // Compress response
  compress: true,

  // Image domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },

  // Security headers di setiap response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Clickjacking protection
          { key: "X-Frame-Options", value: "DENY" },
          // MIME type sniffing protection
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // XSS protection (modern browsers use CSP instead, but keep for compat)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // HSTS (production only)
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      // API routes: CORS for trusted origins only
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Request-ID" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },

  // Redirect www to non-www in production
  async redirects() {
    if (!isProd) return [];
    return [
      {
        source: "/(.*)",
        has: [{ type: "host", value: "www.(?<domain>.*)" }],
        destination: "https://:domain/:path*",
        permanent: true,
      },
    ];
  },

  // Rewrites for health check vanity URL
  async rewrites() {
    return [
      {
        source: "/health",
        destination: "/api/health",
      },
    ];
  },

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},

  // Webpack fallback (only used with --webpack flag in dev)
  webpack(config: any, { isServer, dev }: { isServer: boolean; dev: boolean }) {
    // Disable cache in CI
    if (process.env.CI) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
