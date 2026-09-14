import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { db } from "@/server/db";
import { isProd } from "@/lib/env";
import type { Role } from "@/generated/prisma/enums";

export const SESSION_COOKIE = "pioai_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days, sliding
const TOUCH_INTERVAL_MS = 1000 * 60 * 60; // refresh at most hourly

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  headline: string | null;
  timezone: string;
};

export type Session = {
  id: string;
  user: SessionUser;
  expiresAt: Date;
};

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
  headline: true,
  timezone: true,
  disabledAt: true,
} as const;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function requestMeta() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return {
    ip: forwarded ? (forwarded.split(",")[0]?.trim() ?? null) : (h.get("x-real-ip") ?? null),
    userAgent: h.get("user-agent")?.slice(0, 255) ?? null,
  };
}

/**
 * Issues a new database-backed session and sets the cookie. The cookie holds a
 * random 256-bit token; only its SHA-256 hash is stored.
 */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const meta = await requestMeta();

  await db.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt, ...meta },
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    expires: expiresAt,
  });
}

/** Resolves the current session once per request (memoised with React cache). */
export const getSession = cache(async (): Promise<Session | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      lastSeenAt: true,
      user: { select: userSelect },
    },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now() || session.user.disabledAt) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  if (Date.now() - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await db.session
      .update({
        where: { id: session.id },
        data: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
      })
      .catch(() => undefined);
  }

  const { id, email, name, role, avatarUrl, headline, timezone } = session.user;
  return { id: session.id, user: { id, email, name, role, avatarUrl, headline, timezone }, expiresAt: session.expiresAt };
});

/** Ends the current session and clears the cookie. Safe to call when signed out. */
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: isProd, path: "/", maxAge: 0 });
}

/** Revokes every session for a user (password change, account disable). */
export async function destroyAllSessions(userId: string, exceptSessionId?: string) {
  await db.session.deleteMany({
    where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
  });
}

export async function purgeExpiredSessions() {
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
