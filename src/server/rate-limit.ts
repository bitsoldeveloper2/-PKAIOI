import "server-only";
import { headers } from "next/headers";
import { env } from "@/lib/env";

/**
 * In-process sliding-window rate limiter. Sufficient for a single Node instance;
 * swap the store for Redis (same interface) when running multiple replicas.
 */
type Bucket = { hits: number[]; };

const store = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store) {
    if (bucket.hits.length === 0 || (bucket.hits.at(-1) ?? 0) < now - 15 * 60_000) store.delete(key);
  }
}

export type RateLimitResult = { ok: true; remaining: number } | { ok: false; retryAfterSec: number };

export function rateLimit(key: string, { limit: baseLimit, windowMs }: { limit: number; windowMs: number }): RateLimitResult {
  // RATE_LIMIT_SCALE relaxes limits for automated testing; it is 1 in production.
  const limit = Math.round(baseLimit * env.RATE_LIMIT_SCALE);
  const now = Date.now();
  sweep(now);
  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => t > now - windowMs);
  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    store.set(key, bucket);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }
  bucket.hits.push(now);
  store.set(key, bucket);
  return { ok: true, remaining: limit - bucket.hits.length };
}

export async function clientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded ? (forwarded.split(",")[0]?.trim() ?? "unknown") : (h.get("x-real-ip") ?? "local");
}

export const LIMITS = {
  login: { limit: 8, windowMs: 10 * 60_000 },
  register: { limit: 5, windowMs: 60 * 60_000 },
  contact: { limit: 6, windowMs: 60 * 60_000 },
  ai: { limit: 40, windowMs: 10 * 60_000 },
  search: { limit: 60, windowMs: 60_000 },
} as const;
