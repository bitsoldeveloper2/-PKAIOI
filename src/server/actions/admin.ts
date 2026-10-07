"use server";

import { randomBytes } from "node:crypto";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { requirePermission } from "@/server/auth/dal";
import { destroyAllSessions } from "@/server/auth/session";
import { emailSchema, fieldErrors, formToObject } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./leads";

export type { ActionState };

const roleEnum = z.enum(["STUDENT", "INSTRUCTOR", "STAFF", "ADMIN"]);
const appStatusEnum = z.enum(["SUBMITTED", "UNDER_REVIEW", "INTERVIEW", "OFFER", "ACCEPTED", "WAITLISTED", "REJECTED", "WITHDRAWN"]);
const leadStageEnum = z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]);
const activityEnum = z.enum(["NOTE", "CALL", "EMAIL", "MEETING"]);
const planEnum = z.enum(["TEAM", "ENTERPRISE"]);
const memberRoleEnum = z.enum(["MEMBER", "MANAGER", "OWNER"]);

function inviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("").replace(/^(.{4})(.{4})$/, "$1-$2");
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requirePermission("admin:users");
  const userId = String(formData.get("userId") ?? "");
  const role = roleEnum.parse(formData.get("role"));
  if (userId === admin.id && role !== "ADMIN") throw new Error("You cannot remove your own administrator role.");
  await db.user.update({ where: { id: userId }, data: { role } });
  await audit({ actorId: admin.id, action: "user.role.update", entity: "User", entityId: userId, meta: { role } });
  revalidatePath("/admin/users");
}

export async function setUserDisabledAction(formData: FormData) {
  const admin = await requirePermission("admin:users");
  const userId = String(formData.get("userId") ?? "");
  const disabled = String(formData.get("disabled")) === "true";
  if (userId === admin.id) throw new Error("You cannot disable your own account.");
  await db.user.update({ where: { id: userId }, data: { disabledAt: disabled ? new Date() : null } });
  if (disabled) await destroyAllSessions(userId);
  await audit({ actorId: admin.id, action: disabled ? "user.disable" : "user.enable", entity: "User", entityId: userId });
  revalidatePath("/admin/users");
}

// ── Settings ─────────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  bannerEnabled: z.string().optional(),
  bannerText: z.string().trim().max(160),
  bannerHref: z.string().trim().max(200).refine((v) => v.startsWith("/"), { error: "Use a relative path such as /apply." }),
  intakeDiploma: z.string().trim().max(60),
  intakeLlm: z.string().trim().max(60),
  intakeExecutive: z.string().trim().max(60),
  intakeFoundations: z.string().trim().max(60),
  tutorEnabled: z.string().optional(),
  labHintsEnabled: z.string().optional(),
  dailyMessageCap: z.coerce.number().int().min(10).max(5000),
  promotionActive: z.string().optional(),
  promotionPercent: z.coerce.number().int().min(0).max(90),
  promotionLabel: z.string().trim().max(80),
});

export async function updateSettingsAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const admin = await requirePermission("admin:settings");
  const parsed = settingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  const writes = [
    { key: "site.banner", value: { enabled: d.bannerEnabled === "on", text: d.bannerText, href: d.bannerHref } },
    { key: "admissions.intakes", value: { diploma: d.intakeDiploma, llm: d.intakeLlm, executive: d.intakeExecutive, foundations: d.intakeFoundations } },
    { key: "platform.ai", value: { tutorEnabled: d.tutorEnabled === "on", labHintsEnabled: d.labHintsEnabled === "on", dailyMessageCap: d.dailyMessageCap } },
    { key: "academy.promotion", value: { active: d.promotionActive === "on", percentOff: d.promotionPercent, label: d.promotionLabel || `${d.promotionPercent}% off all programs` } },
  ];
  await db.$transaction(writes.map((w) => db.siteSetting.upsert({ where: { key: w.key }, create: { key: w.key, value: w.value }, update: { value: w.value } })));
  await audit({ actorId: admin.id, action: "settings.update", entity: "SiteSetting" });
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

// ── Admissions ───────────────────────────────────────────────────────────────

export async function updateApplicationStatusAction(formData: FormData) {
  const staff = await requirePermission("admissions:manage");
  const id = String(formData.get("applicationId") ?? "");
  const status = appStatusEnum.parse(formData.get("status"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  const decided = ["OFFER", "ACCEPTED", "WAITLISTED", "REJECTED"].includes(status);
  await db.application.update({
    where: { id },
    data: {
      status,
      decisionAt: decided ? new Date() : undefined,
      reviewerId: staff.id,
      events: { create: { type: "STATUS", body: `${status.replace("_", " ").toLowerCase()}${note ? ` — ${note}` : ""}`, actorId: staff.id } },
    },
  });
  await audit({ actorId: staff.id, action: "admissions.status", entity: "Application", entityId: id, meta: { status } });
  revalidatePath("/admin/admissions");
  revalidatePath(`/admin/admissions/${id}`);
}

export async function scoreApplicationAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("admissions:manage");
  const id = String(formData.get("applicationId") ?? "");
  const parsed = z.object({ score: z.coerce.number().int().min(0).max(100), reviewNotes: z.string().trim().max(3000) }).safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await db.application.update({
    where: { id },
    data: { score: parsed.data.score, reviewNotes: parsed.data.reviewNotes || null, reviewerId: staff.id, events: { create: { type: "SCORE", body: `Scored ${parsed.data.score}/100.`, actorId: staff.id } } },
  });
  await audit({ actorId: staff.id, action: "admissions.score", entity: "Application", entityId: id, meta: { score: parsed.data.score } });
  revalidatePath(`/admin/admissions/${id}`);
  return { ok: true, message: "Review saved." };
}

export async function addApplicationNoteAction(formData: FormData) {
  const staff = await requirePermission("admissions:manage");
  const id = String(formData.get("applicationId") ?? "");
  const body = z.string().trim().min(1).max(2000).parse(formData.get("body"));
  await db.applicationEvent.create({ data: { applicationId: id, type: "NOTE", body, actorId: staff.id } });
  revalidatePath(`/admin/admissions/${id}`);
}

export async function assignReviewerAction(formData: FormData) {
  const staff = await requirePermission("admissions:manage");
  const id = String(formData.get("applicationId") ?? "");
  const reviewerId = String(formData.get("reviewerId") ?? "") || null;
  await db.application.update({ where: { id }, data: { reviewerId, events: { create: { type: "NOTE", body: reviewerId ? "Reviewer assigned." : "Reviewer cleared.", actorId: staff.id } } } });
  revalidatePath(`/admin/admissions/${id}`);
  revalidatePath("/admin/admissions");
}

// ── CRM ──────────────────────────────────────────────────────────────────────

export async function updateLeadStageAction(leadId: string, stage: string) {
  const staff = await requirePermission("crm:manage");
  const parsedStage = leadStageEnum.parse(stage);
  await db.lead.update({ where: { id: leadId }, data: { stage: parsedStage, activities: { create: { type: "STAGE", body: `Moved to ${parsedStage.toLowerCase()}.`, authorId: staff.id } } } });
  await audit({ actorId: staff.id, action: "lead.stage", entity: "Lead", entityId: leadId, meta: { stage: parsedStage } });
  revalidatePath("/admin/crm");
  revalidatePath(`/admin/crm/${leadId}`);
}

export async function updateLeadStageFormAction(formData: FormData) {
  await updateLeadStageAction(String(formData.get("leadId") ?? ""), String(formData.get("stage") ?? ""));
}

export async function assignLeadOwnerAction(formData: FormData) {
  const staff = await requirePermission("crm:manage");
  const leadId = String(formData.get("leadId") ?? "");
  const ownerId = String(formData.get("ownerId") ?? "") || null;
  await db.lead.update({ where: { id: leadId }, data: { ownerId } });
  await audit({ actorId: staff.id, action: "lead.assign", entity: "Lead", entityId: leadId, meta: { ownerId } });
  revalidatePath(`/admin/crm/${leadId}`);
  revalidatePath("/admin/crm");
}

export async function addLeadActivityAction(formData: FormData) {
  const staff = await requirePermission("crm:manage");
  const leadId = String(formData.get("leadId") ?? "");
  const type = activityEnum.parse(formData.get("type") ?? "NOTE");
  const body = z.string().trim().min(1).max(3000).parse(formData.get("body"));
  await db.lead.update({ where: { id: leadId }, data: { activities: { create: { type, body, authorId: staff.id } } } });
  revalidatePath(`/admin/crm/${leadId}`);
}

const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  phone: z.string().trim().max(30).optional(),
  organization: z.string().trim().max(120).optional(),
  role: z.string().trim().max(80).optional(),
  source: z.string().trim().min(2).max(60).default("Manual"),
  interest: z.string().trim().max(120).optional(),
  stage: leadStageEnum.default("NEW"),
  value: z.union([z.literal(""), z.coerce.number().int().min(0).max(1_000_000_000)]).optional(),
  message: z.string().trim().max(3000).optional(),
});

export async function upsertLeadAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("crm:manage");
  const leadId = String(formData.get("leadId") ?? "");
  const parsed = leadSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  const data = { name: d.name, email: d.email, phone: d.phone || null, organization: d.organization || null, role: d.role || null, source: d.source, interest: d.interest || null, stage: d.stage, value: typeof d.value === "number" ? d.value : null, message: d.message || null };
  const lead = leadId ? await db.lead.update({ where: { id: leadId }, data }) : await db.lead.create({ data: { ...data, ownerId: staff.id } });
  await audit({ actorId: staff.id, action: leadId ? "lead.update" : "lead.create", entity: "Lead", entityId: lead.id });
  revalidatePath("/admin/crm");
  revalidatePath(`/admin/crm/${lead.id}`);
  if (!leadId) redirect(`/admin/crm/${lead.id}` as Route);
  return { ok: true, message: "Lead saved." };
}

// ── Enterprise organisations ─────────────────────────────────────────────────

const orgSchema = z.object({
  name: z.string().trim().min(2).max(120),
  domain: z.string().trim().max(120).optional(),
  plan: planEnum,
  seats: z.coerce.number().int().min(1).max(100_000),
});

export async function upsertOrganizationAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("enterprise:manage");
  const orgId = String(formData.get("orgId") ?? "");
  const parsed = orgSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  let org;
  if (orgId) {
    org = await db.organization.update({ where: { id: orgId }, data: { name: d.name, domain: d.domain || null, plan: d.plan, seats: d.seats } });
  } else {
    const base = slugify(d.name) || "org";
    let slug = base;
    for (let i = 2; await db.organization.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`;
    org = await db.organization.create({ data: { name: d.name, domain: d.domain || null, plan: d.plan, seats: d.seats, slug, inviteCode: inviteCode() } });
  }
  await audit({ actorId: staff.id, action: orgId ? "org.update" : "org.create", entity: "Organization", entityId: org.id });
  revalidatePath("/admin/enterprise");
  revalidatePath(`/admin/enterprise/${org.slug}`);
  revalidatePath("/enterprise/portal", "layout");
  if (!orgId) redirect(`/admin/enterprise/${org.slug}` as Route);
  return { ok: true, message: "Organisation saved." };
}

export async function regenerateInviteCodeAction(formData: FormData) {
  const staff = await requirePermission("enterprise:manage");
  const orgId = String(formData.get("orgId") ?? "");
  const org = await db.organization.update({ where: { id: orgId }, data: { inviteCode: inviteCode() }, select: { slug: true } });
  await audit({ actorId: staff.id, action: "org.invite.rotate", entity: "Organization", entityId: orgId });
  revalidatePath(`/admin/enterprise/${org.slug}`);
  revalidatePath("/enterprise/portal", "layout");
}

export async function addOrganizationMemberAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("enterprise:manage");
  const orgId = String(formData.get("orgId") ?? "");
  const parsed = z.object({ email: emailSchema, role: memberRoleEnum.default("MEMBER") }).safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const org = await db.organization.findUnique({ where: { id: orgId }, select: { id: true, slug: true, seats: true, _count: { select: { memberships: true } } } });
  if (!org) return { ok: false, message: "Organisation not found." };
  const user = await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (!user) return { ok: false, errors: { email: ["No account with that email. Ask them to register first, or share the invite code."] } };
  if (org._count.memberships >= org.seats) return { ok: false, message: "All seats are in use. Increase the seat count first." };
  await db.membership.upsert({ where: { orgId_userId: { orgId, userId: user.id } }, create: { orgId, userId: user.id, role: parsed.data.role }, update: { role: parsed.data.role } });
  await audit({ actorId: staff.id, action: "org.member.add", entity: "Organization", entityId: orgId, meta: { userId: user.id } });
  revalidatePath(`/admin/enterprise/${org.slug}`);
  revalidatePath("/enterprise/portal", "layout");
  return { ok: true, message: "Member added." };
}

export async function setMembershipRoleAction(formData: FormData) {
  const staff = await requirePermission("enterprise:manage");
  const membershipId = String(formData.get("membershipId") ?? "");
  const role = memberRoleEnum.parse(formData.get("role"));
  const m = await db.membership.update({ where: { id: membershipId }, data: { role }, select: { org: { select: { slug: true } } } });
  await audit({ actorId: staff.id, action: "org.member.role", entity: "Membership", entityId: membershipId, meta: { role } });
  revalidatePath(`/admin/enterprise/${m.org.slug}`);
  revalidatePath("/enterprise/portal", "layout");
}

export async function removeMembershipAction(formData: FormData) {
  const staff = await requirePermission("enterprise:manage");
  const membershipId = String(formData.get("membershipId") ?? "");
  const m = await db.membership.delete({ where: { id: membershipId }, select: { org: { select: { slug: true } } } });
  await audit({ actorId: staff.id, action: "org.member.remove", entity: "Membership", entityId: membershipId });
  revalidatePath(`/admin/enterprise/${m.org.slug}`);
  revalidatePath("/enterprise/portal", "layout");
}
