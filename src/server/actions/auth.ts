"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { clientIp, LIMITS, rateLimit } from "@/server/rate-limit";
import { burnPasswordCheck, hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, destroyAllSessions, destroySession, getSession } from "@/server/auth/session";
import { getCurrentUser } from "@/server/auth/dal";
import { homeFor } from "@/server/auth/permissions";
import { safeNextPath } from "@/lib/utils";
import {
  changePasswordSchema,
  fieldErrors,
  formToObject,
  loginSchema,
  profileSchema,
  registerSchema,
} from "@/lib/validation";
import type { ActionState } from "./leads";

export type { ActionState };

const GENERIC_LOGIN_ERROR = "That email and password combination is not correct.";

export async function loginAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { email, password, next } = parsed.data;
  const ip = await clientIp();
  const limit = rateLimit(`login:${ip}:${email}`, LIMITS.login);
  if (!limit.ok) {
    await audit({ action: "auth.login.throttled", entity: "User", meta: { email } });
    return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).` };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, role: true, disabledAt: true },
  });

  if (!user) {
    await burnPasswordCheck(password);
    return { ok: false, message: GENERIC_LOGIN_ERROR };
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    await audit({ actorId: user.id, action: "auth.login.failed", entity: "User", entityId: user.id });
    return { ok: false, message: GENERIC_LOGIN_ERROR };
  }
  if (user.disabledAt) {
    return { ok: false, message: "This account has been disabled. Contact the registrar for help." };
  }

  await createSession(user.id);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit({ actorId: user.id, action: "auth.login", entity: "User", entityId: user.id });

  redirect(safeNextPath(next, homeFor(user.role)) as Route);
}

export async function registerAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const ip = await clientIp();
  const limit = rateLimit(`register:${ip}`, LIMITS.register);
  if (!limit.ok) return { ok: false, message: "Too many accounts created from this network. Please try again later." };

  const { name, email, password, inviteCode } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { ok: false, errors: { email: ["An account with this email already exists. Try signing in instead."] } };
  }

  let org: { id: string; seats: number; name: string; memberCount: number } | null = null;
  if (inviteCode) {
    const found = await db.organization.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
      select: { id: true, seats: true, name: true, _count: { select: { memberships: true } } },
    });
    if (!found) return { ok: false, errors: { inviteCode: ["That invite code was not recognised."] } };
    if (found._count.memberships >= found.seats) {
      return { ok: false, errors: { inviteCode: [`${found.name} has used all of its seats. Ask your programme manager to add more.`] } };
    }
    org = { id: found.id, seats: found.seats, name: found.name, memberCount: found._count.memberships };
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
      memberships: org ? { create: { orgId: org.id, role: "MEMBER" } } : undefined,
    },
    select: { id: true },
  });

  await createSession(user.id);
  await audit({ actorId: user.id, action: "auth.register", entity: "User", entityId: user.id, meta: { org: org?.id } });

  redirect("/campus?welcome=1" as Route);
}

export async function logoutAction() {
  const session = await getSession();
  await destroySession();
  if (session) {
    await audit({ actorId: session.user.id, action: "auth.logout", entity: "User", entityId: session.user.id });
  }
  redirect("/");
}

/** Revoke every session except the current one (the "sign out other devices" button). */
export async function logoutOtherSessionsAction() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Faccount" as Route);
  await destroyAllSessions(session.user.id, session.id);
  await audit({ actorId: session.user.id, action: "auth.sessions.revoke_others", entity: "User", entityId: session.user.id });
  revalidatePath("/account");
}

export async function updateProfileAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = profileSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { name, headline, bio, timezone } = parsed.data;
  await db.user.update({
    where: { id: user.id },
    data: { name, headline: headline || null, bio: bio || null, timezone: timezone || undefined },
  });
  await audit({ actorId: user.id, action: "user.profile.update", entity: "User", entityId: user.id });
  return { ok: true, message: "Profile updated." };
}

export async function changePasswordAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = changePasswordSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const record = await db.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
  if (!record || !(await verifyPassword(record.passwordHash, parsed.data.current))) {
    return { ok: false, errors: { current: ["Your current password is not correct."] } };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });
  await destroyAllSessions(session.user.id, session.id);
  await audit({ actorId: session.user.id, action: "auth.password.change", entity: "User", entityId: session.user.id });
  return { ok: true, message: "Password changed. Other devices have been signed out." };
}
