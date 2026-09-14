import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` runs on install, before `.env` exists on a fresh clone, so the
// datasource falls back to the local SQLite file that `.env.example` also uses.
// Hosting panels often keep quotes pasted around a value, so strip them.
const databaseUrl = process.env.DATABASE_URL?.trim().replace(/^(["'])(.*)\1$/, "$2") || "file:./dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
