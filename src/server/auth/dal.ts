import "server-only";
import { cache } from "react";
import type { Route } from "next";
import { forbidden, redirect } from "next/navigation";
import { db } from "@/server/db";
import { getSession, type SessionUser } from "./session";
import { can, type Permission } from "./permissions";
import type { MembershipRole, Role } from "@/generated/prisma/enums";

export type { SessionUser };

/** The signed-in user, or null. Memoised per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  return session?.user ?? null;
});

function loginUrl(nextPath?: string) {
  return nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
}

/** Redirects to sign-in when there is no valid session. */
export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(loginUrl(nextPath) as Route);
  return user;
}

/** Requires a signed-in user with the given capability; renders 403 otherwise. */
export async function requirePermission(permission: Permission, nextPath?: string): Promise<SessionUser> {
  const user = await requireUser(nextPath);
  if (!can(user.role, permission)) forbidden();
  return user;
}

export async function requireRole(roles: Role[], nextPath?: string): Promise<SessionUser> {
  const user = await requireUser(nextPath);
  if (!roles.includes(user.role)) forbidden();
  return user;
}

export type EnterpriseContext = {
  org: { id: string; slug: string; name: string; plan: "TEAM" | "ENTERPRISE"; seats: number; inviteCode: string; domain: string | null };
  membershipRole: MembershipRole;
};

/** Organisations the user manages (MANAGER or OWNER). */
export const getEnterpriseContexts = cache(async (userId: string): Promise<EnterpriseContext[]> => {
  const memberships = await db.membership.findMany({
    where: { userId, role: { in: ["MANAGER", "OWNER"] } },
    select: {
      role: true,
      org: { select: { id: true, slug: true, name: true, plan: true, seats: true, inviteCode: true, domain: true } },
    },
    orderBy: { joinedAt: "asc" },
  });
  return memberships.map((m) => ({ org: m.org, membershipRole: m.role }));
});

/** Enterprise portal gate: staff/admins may view any org; others need a managing membership. */
export async function requireEnterpriseManager(nextPath?: string) {
  const user = await requireUser(nextPath);
  const contexts = await getEnterpriseContexts(user.id);
  if (contexts.length === 0 && !can(user.role, "enterprise:manage")) forbidden();
  return { user, contexts };
}
