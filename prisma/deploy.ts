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
import { randomBytes } from "node:crypto";
import { accessSync, constants, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { dataDirOf, resolveDatabaseUrl, resolveSessionSecret, stripQuotes } from "../src/lib/deploy-defaults";

const url = resolveDatabaseUrl(process.env.DATABASE_URL);

// The runtime uses the SQLite adapter, so anything else (e.g. a MongoDB or Postgres
// URL) fails later with a cryptic P1013. Name the problem without printing the value,
// which may contain a password.
if (!url.startsWith("file:")) {
  console.error(
    `DATABASE_URL must be a SQLite file path starting with "file:", but it starts with "${url.split(":")[0]}:".\n` +
      `Set it to e.g. file:/home/<user>/pioai-data/pioai.db (no quotes). MongoDB belongs in MONGODB_URI.`,
  );
  process.exit(1);
}
process.env.DATABASE_URL = url; // the migrate and seed child processes read it too

// SQLite creates the file but not its folder. Name the folder and give a usable
// example instead of a bare EACCES when the panel still holds a placeholder path.
const dbDir = dataDirOf(url);
try {
  mkdirSync(dbDir, { recursive: true });
  accessSync(dbDir, constants.W_OK);
} catch (e) {
  const code = (e as NodeJS.ErrnoException).code ?? "error";
  console.error(
    `Cannot create or write the database folder ${dbDir} (${code}).\n` +
      `Set DATABASE_URL to a SQLite file inside a folder this account owns, e.g. file:${os.homedir()}/pioai-data/pioai.db (no quotes).`,
  );
  process.exit(1);
}

// Pages are prerendered during the build, so the session secret must exist now and
// be the same one the server reads later.
resolveSessionSecret(process.env.SESSION_SECRET, dbDir);

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

  // Never seed a live site with the public default password: without SEED_PASSWORD,
  // generate one, keep a copy beside the database and let the seed print it once.
  let password = stripQuotes(process.env.SEED_PASSWORD);
  if (!password) {
    password = randomBytes(12).toString("base64url");
    const file = path.join(dbDir, "seed-password.txt");
    writeFileSync(file, password, { mode: 0o600 });
    console.log(`No SEED_PASSWORD set: generated one for the seeded accounts and saved it to ${file}`);
  }
  process.env.SEED_PASSWORD = password; // the seed child process reads it
  console.log("Empty database: seeding initial content");
  execSync("npx tsx prisma/seed.ts --force", { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
