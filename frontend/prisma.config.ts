import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI tidak membaca .env.local secara otomatis — load manual
config({ path: ".env.local" });
config({ path: ".env" }); // fallback

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: {
    // Gunakan DATABASE_URL (pooled) — direct URL timeout di environment ini
    url: process.env.DATABASE_URL ?? "",
  },
});
