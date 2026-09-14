/**
 * Runs before `next build`: pages read the database while prerendering, so a fresh
 * server needs its schema (and first content) in place before the build starts.
 *
 * - applies pending migrations (non-destructive, safe on every deploy)
 * - seeds only when the database has no users; the seed wipes tables, so it must
 *   never run against a live database
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "file:./dev.db";

// SQLite creates the file but not its folder.
if (url.startsWith("file:")) mkdirSync(path.dirname(path.resolve(url.slice("file:".length))), { recursive: true });

execSync("npx prisma migrate deploy", { stdio: "inherit" });

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
  try {
    if ((await prisma.user.count()) > 0) {
      console.log("✓ database already has data; skipping seed");
      return;
    }
  } finally {
    await prisma.$disconnect();
  }

  if (process.env.NODE_ENV === "production" && !process.env.SEED_PASSWORD) {
    throw new Error("Empty production database: set SEED_PASSWORD so the seeded accounts do not use the public default password.");
  }
  console.log("Empty database: seeding initial content");
  execSync("npx tsx prisma/seed.ts --force", { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
