"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { getEnterpriseContexts, requireUser } from "@/server/auth/dal";
import { can } from "@/server/auth/permissions";
import { emailSchema, fieldErrors, formToObject } from "@/lib/validation";
import type { ActionState } from "./leads";

export type { ActionState };

/** The signed-in user must manage this organisation (MANAGER/OWNER) or be institute staff. */
async function assertManages(orgId: string) {
  const user = await requireUser("/enterprise/portal");
  if (can(user.role, "enterprise:manage")) return user;
  const contexts = await getEnterpriseContexts(user.id);
  if (!contexts.some((c) => c.org.id === orgId)) throw new Error("You do not manage this organisation.");
  return user;
}

function inviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("").replace(/^(.{4})(.{4})$/, "$1-$2");
}

function revalidatePortal() {
  revalidatePath("/enterprise/portal", "layout");
  revalidatePath("/admin/enterprise", "layout");
}

export async function portalAddMemberAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const orgId = String(formData.get("orgId") ?? "");
  const user = await assertManages(orgId);
  const parsed = z.object({ email: emailSchema, role: z.enum(["MEMBER", "MANAGER"]).default("MEMBER") }).safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const org = await db.organization.findUnique({ where: { id: orgId }, select: { seats: true, _count: { select: { memberships: true } } } });
  if (!org) return { ok: false, message: "Organisation not found." };
  const target = await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (!target) return { ok: false, errors: { email: ["No campus account with that email yet. Share the invite code so they can register with a seat."] } };
  if (org._count.memberships >= org.seats) return { ok: false, message: "All seats are in use. Contact partnerships@pioai.edu.pk to add more." };
  await db.membership.upsert({ where: { orgId_userId: { orgId, userId: target.id } }, create: { orgId, userId: target.id, role: parsed.data.role }, update: { role: parsed.data.role } });
  await audit({ actorId: user.id, action: "portal.member.add", entity: "Organization", entityId: orgId, meta: { userId: target.id, role: parsed.data.role } });
  revalidatePortal();
  return { ok: true, message: "Member added." };
}

export async function portalSetRoleAction(formData: FormData) {
  const orgId = String(formData.get("orgId") ?? "");
  const membershipId = String(formData.get("membershipId") ?? "");
  const role = z.enum(["MEMBER", "MANAGER"]).parse(formData.get("role"));
  const user = await assertManages(orgId);
  const membership = await db.membership.findFirst({ where: { id: membershipId, orgId }, select: { id: true, role: true, userId: true } });
  if (!membership) throw new Error("Membership not found.");
  if (membership.role === "OWNER") throw new Error("Owners can only be changed by the institute.");
  if (membership.userId === user.id) throw new Error("You cannot change your own role.");
  await db.membership.update({ where: { id: membership.id }, data: { role } });
  await audit({ actorId: user.id, action: "portal.member.role", entity: "Membership", entityId: membership.id, meta: { role } });
  revalidatePortal();
}

export async function portalRemoveMemberAction(formData: FormData) {
  const orgId = String(formData.get("orgId") ?? "");
  const membershipId = String(formData.get("membershipId") ?? "");
  const user = await assertManages(orgId);
  const membership = await db.membership.findFirst({ where: { id: membershipId, orgId }, select: { id: true, role: true, userId: true } });
  if (!membership) throw new Error("Membership not found.");
  if (membership.role === "OWNER") throw new Error("Owners can only be removed by the institute.");
  if (membership.userId === user.id) throw new Error("You cannot remove yourself.");
  await db.membership.delete({ where: { id: membership.id } });
  await audit({ actorId: user.id, action: "portal.member.remove", entity: "Membership", entityId: membership.id });
  revalidatePortal();
}

export async function portalRotateInviteAction(formData: FormData) {
  const orgId = String(formData.get("orgId") ?? "");
  const user = await assertManages(orgId);
  await db.organization.update({ where: { id: orgId }, data: { inviteCode: inviteCode() } });
  await audit({ actorId: user.id, action: "portal.invite.rotate", entity: "Organization", entityId: orgId });
  revalidatePortal();
}
