import "server-only";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { env, isProd } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { __pioaiPrisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: isProd ? ["error"] : ["warn", "error"],
  });
}

/** Single Prisma instance per process; survives HMR in development. */
export const db: PrismaClient = globalForPrisma.__pioaiPrisma ?? createClient();

if (!isProd) globalForPrisma.__pioaiPrisma = db;

export type { PrismaClient };
