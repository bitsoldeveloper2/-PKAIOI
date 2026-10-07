/**
 * Defaults that let a production deployment run with no environment variables set
 * in the hosting panel. Shared by the runtime (`src/lib/env.ts`) and the build-time
 * scripts (`prisma.config.ts`, `prisma/deploy.ts`, `prisma/seed.ts`), so it must stay
 * free of Next.js imports and of `"server-only"`.
 */
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/** Hosting panels often keep quotes pasted around a value; strip them. */
export function stripQuotes(value: string | undefined) {
  return (value ?? "").trim().replace(/^(["'])(.*)\1$/, "$2");
}

/**
 * The SQLite file for this deployment. When `DATABASE_URL` is unset, use a folder in
 * the account's home directory: outside the project, so redeploys keep the data.
 */
export function resolveDatabaseUrl(raw: string | undefined) {
  const value = stripQuotes(raw);
  if (value) return value;
  const home = os.homedir().replace(/\\/g, "/");
  return `file:${path.posix.join(home, "pioai-data", "pioai.db")}`;
}

/** The folder that holds the SQLite file and the generated secrets. */
export function dataDirOf(databaseUrl: string) {
  return path.dirname(path.resolve(databaseUrl.replace(/^file:/, "")));
}

/**
 * The session signing secret: `SESSION_SECRET` when set, otherwise a secret generated
 * once and kept beside the database, readable only by this account. The build and the
 * running server resolve the same file, so sessions survive restarts and redeploys.
 */
export function resolveSessionSecret(raw: string | undefined, dataDir: string) {
  const value = stripQuotes(raw);
  if (value) return value;
  const file = path.join(dataDir, "session-secret");
  if (existsSync(file)) {
    const stored = readFileSync(file, "utf8").trim();
    if (stored) return stored;
  }
  mkdirSync(dataDir, { recursive: true });
  const secret = randomBytes(48).toString("base64url");
  writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}
