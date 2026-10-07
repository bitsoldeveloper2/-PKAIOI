import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl } from "./src/lib/deploy-defaults";

// `prisma generate` runs on install, before `.env` exists on a fresh clone. The
// resolver strips quotes pasted in hosting panels and, when the variable is unset,
// falls back to a SQLite file in the home directory (the production default).
const databaseUrl = resolveDatabaseUrl(process.env.DATABASE_URL);

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
