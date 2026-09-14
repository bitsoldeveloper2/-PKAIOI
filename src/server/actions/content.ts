"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { requirePermission } from "@/server/auth/dal";
import { fieldErrors, formToObject } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./leads";

export type { ActionState };

const lines = (v: unknown, max = 30) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);

const csv = (v: unknown, max = 30) => lines(String(v ?? "").replace(/,/g, "\n"), max);

async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>, currentId?: string) {
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; await exists(slug); i++) slug = `${root}-${i}`;
  return currentId ? slug : slug;
}

function revalidateResearch() {
  revalidatePath("/research", "layout");
  revalidatePath("/faculty", "layout");
  revalidatePath("/admin/research", "layout");
  revalidatePath("/");
}

// ── Research: labs ───────────────────────────────────────────────────────────

const labSchema = z.object({
  name: z.string().trim().min(3).max(120),
  tagline: z.string().trim().min(3).max(200),
  description: z.string().trim().min(20).max(20_000),
  focusAreas: z.string().max(2000).optional(),
  leadId: z.string().max(64).optional(),
  published: z.string().optional(),
  order: z.coerce.number().int().min(0).max(100).default(0),
});

export async function upsertLabAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("research:manage");
  const id = String(formData.get("id") ?? "");
  const parsed = labSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  const data = { name: d.name, tagline: d.tagline, description: d.description, focusAreas: lines(d.focusAreas), leadId: d.leadId || null, published: d.published === "on", order: d.order };
  const lab = id
    ? await db.researchLab.update({ where: { id }, data })
    : await db.researchLab.create({ data: { ...data, slug: await uniqueSlug(d.name, async (s) => Boolean(await db.researchLab.findUnique({ where: { slug: s }, select: { id: true } }))) } });
  await audit({ actorId: staff.id, action: id ? "lab.update" : "lab.create", entity: "ResearchLab", entityId: lab.id });
  revalidateResearch();
  if (!id) redirect(`/admin/research/labs/${lab.id}` as Route);
  return { ok: true, message: "Lab saved." };
}

// ── Research: publications ───────────────────────────────────────────────────

const publicationSchema = z.object({
  title: z.string().trim().min(5).max(300),
  abstract: z.string().trim().min(20).max(5000),
  authors: z.string().trim().min(2).max(1000),
  venue: z.string().trim().min(2).max(200),
  year: z.coerce.number().int().min(2000).max(2100),
  type: z.enum(["PAPER", "PREPRINT", "REPORT", "DATASET"]),
  url: z.union([z.literal(""), z.url()]).optional(),
  labId: z.string().max(64).optional(),
  featured: z.string().optional(),
  published: z.string().optional(),
});

export async function upsertPublicationAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("research:manage");
  const id = String(formData.get("id") ?? "");
  const parsed = publicationSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  const data = { title: d.title, abstract: d.abstract, authors: csv(d.authors), venue: d.venue, year: d.year, type: d.type, url: d.url || null, labId: d.labId || null, featured: d.featured === "on", published: d.published === "on" };
  const pub = id
    ? await db.publication.update({ where: { id }, data })
    : await db.publication.create({ data: { ...data, slug: await uniqueSlug(`${d.title}-${d.year}`, async (s) => Boolean(await db.publication.findUnique({ where: { slug: s }, select: { id: true } }))) } });
  await audit({ actorId: staff.id, action: id ? "publication.update" : "publication.create", entity: "Publication", entityId: pub.id });
  revalidateResearch();
  if (!id) redirect(`/admin/research/publications/${pub.id}` as Route);
  return { ok: true, message: "Publication saved." };
}

// ── Research: projects ───────────────────────────────────────────────────────

const projectSchema = z.object({
  title: z.string().trim().min(5).max(200),
  summary: z.string().trim().min(10).max(400),
  description: z.string().trim().min(20).max(10_000),
  status: z.enum(["ACTIVE", "COMPLETED", "PLANNED"]),
  labId: z.string().min(1, "Choose a lab."),
  startedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date."),
  endedAt: z.string().optional(),
  published: z.string().optional(),
});

export async function upsertProjectAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("research:manage");
  const id = String(formData.get("id") ?? "");
  const parsed = projectSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  const data = { title: d.title, summary: d.summary, description: d.description, status: d.status, labId: d.labId, startedAt: new Date(d.startedAt), endedAt: d.endedAt ? new Date(d.endedAt) : null, published: d.published === "on" };
  const project = id
    ? await db.researchProject.update({ where: { id }, data })
    : await db.researchProject.create({ data: { ...data, slug: await uniqueSlug(d.title, async (s) => Boolean(await db.researchProject.findUnique({ where: { slug: s }, select: { id: true } }))) } });
  await audit({ actorId: staff.id, action: id ? "project.update" : "project.create", entity: "ResearchProject", entityId: project.id });
  revalidateResearch();
  if (!id) redirect(`/admin/research/projects/${project.id}` as Route);
  return { ok: true, message: "Project saved." };
}

// ── Research: faculty ────────────────────────────────────────────────────────

const facultySchema = z.object({
  name: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(160),
  department: z.string().trim().min(2).max(80),
  bio: z.string().trim().min(20).max(10_000),
  expertise: z.string().max(1000).optional(),
  links: z.string().max(2000).optional(),
  userEmail: z.string().trim().max(254).optional(),
  featured: z.string().optional(),
  order: z.coerce.number().int().min(0).max(100).default(0),
});

export async function upsertFacultyAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("research:manage");
  const id = String(formData.get("id") ?? "");
  const parsed = facultySchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  let userId: string | null = null;
  if (d.userEmail) {
    const user = await db.user.findUnique({ where: { email: d.userEmail.toLowerCase() }, select: { id: true } });
    if (!user) return { ok: false, errors: { userEmail: ["No platform account with that email."] } };
    userId = user.id;
  }
  const links = lines(d.links, 10)
    .map((l) => {
      const [label, ...rest] = l.split("|");
      return { label: (label ?? "").trim(), url: rest.join("|").trim() };
    })
    .filter((l) => l.label && /^https?:\/\//.test(l.url));
  const data = { name: d.name, title: d.title, department: d.department, bio: d.bio, expertise: csv(d.expertise), links, userId, featured: d.featured === "on", order: d.order };
  const member = id
    ? await db.faculty.update({ where: { id }, data })
    : await db.faculty.create({ data: { ...data, slug: await uniqueSlug(d.name, async (s) => Boolean(await db.faculty.findUnique({ where: { slug: s }, select: { id: true } }))) } });
  await audit({ actorId: staff.id, action: id ? "faculty.update" : "faculty.create", entity: "Faculty", entityId: member.id });
  revalidateResearch();
  if (!id) redirect(`/admin/research/faculty/${member.id}` as Route);
  return { ok: true, message: "Faculty profile saved." };
}

export async function deleteResearchItemAction(formData: FormData) {
  const staff = await requirePermission("research:manage");
  const kind = z.enum(["labs", "publications", "projects", "faculty"]).parse(formData.get("kind"));
  const id = String(formData.get("id") ?? "");
  if (kind === "labs") await db.researchLab.delete({ where: { id } });
  if (kind === "publications") await db.publication.delete({ where: { id } });
  if (kind === "projects") await db.researchProject.delete({ where: { id } });
  if (kind === "faculty") await db.faculty.delete({ where: { id } });
  await audit({ actorId: staff.id, action: `${kind}.delete`, entity: kind, entityId: id });
  revalidateResearch();
  redirect("/admin/research" as Route);
}

// ── CMS: posts ───────────────────────────────────────────────────────────────

const postSchema = z.object({
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().min(10).max(400),
  body: z.string().trim().min(20).max(60_000),
  category: z.string().trim().min(2).max(60),
  tags: z.string().max(500).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  publishedAt: z.string().optional(),
});

function revalidateCms() {
  revalidatePath("/journal", "layout");
  revalidatePath("/admin/cms", "layout");
  revalidatePath("/");
}

export async function upsertPostAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("cms:manage");
  const id = String(formData.get("id") ?? "");
  const parsed = postSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  const publishedAt = d.status === "PUBLISHED" ? (d.publishedAt ? new Date(d.publishedAt) : new Date()) : null;
  const data = { title: d.title, excerpt: d.excerpt, body: d.body, category: d.category, tags: csv(d.tags, 12), status: d.status, publishedAt };
  const post = id
    ? await db.post.update({ where: { id }, data })
    : await db.post.create({ data: { ...data, authorId: staff.id, slug: await uniqueSlug(d.title, async (s) => Boolean(await db.post.findUnique({ where: { slug: s }, select: { id: true } }))) } });
  await audit({ actorId: staff.id, action: id ? "post.update" : "post.create", entity: "Post", entityId: post.id, meta: { status: d.status } });
  revalidateCms();
  revalidatePath(`/journal/${post.slug}`);
  if (!id) redirect(`/admin/cms/posts/${post.id}` as Route);
  return { ok: true, message: "Post saved." };
}

export async function deletePostAction(formData: FormData) {
  const staff = await requirePermission("cms:manage");
  const id = String(formData.get("id") ?? "");
  await db.post.delete({ where: { id } });
  await audit({ actorId: staff.id, action: "post.delete", entity: "Post", entityId: id });
  revalidateCms();
  redirect("/admin/cms" as Route);
}

// ── CMS: pages ───────────────────────────────────────────────────────────────

const pageSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]{2,60}$/, "Lowercase letters, numbers and hyphens only."),
  title: z.string().trim().min(2).max(160),
  body: z.string().trim().min(10).max(80_000),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(200).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

const RESERVED = new Set(["campus", "studio", "admin", "learn", "account", "login", "register", "api", "courses", "programs", "research", "faculty", "journal", "search", "verify", "apply", "admissions", "enterprise", "contact", "academy"]);

export async function upsertPageAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("cms:manage");
  const id = String(formData.get("id") ?? "");
  const parsed = pageSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  if (RESERVED.has(d.slug)) return { ok: false, errors: { slug: ["That path is reserved by the application."] } };
  const clash = await db.page.findFirst({ where: { slug: d.slug, ...(id ? { id: { not: id } } : {}) }, select: { id: true } });
  if (clash) return { ok: false, errors: { slug: ["Another page already uses this path."] } };
  const data = { slug: d.slug, title: d.title, body: d.body, seoTitle: d.seoTitle || null, seoDescription: d.seoDescription || null, status: d.status, updatedById: staff.id };
  const page = id ? await db.page.update({ where: { id }, data }) : await db.page.create({ data });
  await audit({ actorId: staff.id, action: id ? "page.update" : "page.create", entity: "Page", entityId: page.id });
  revalidateCms();
  revalidatePath(`/${page.slug}`);
  revalidatePath("/about");
  if (!id) redirect(`/admin/cms/pages/${page.id}` as Route);
  return { ok: true, message: "Page saved." };
}

// ── CMS: announcements & events ──────────────────────────────────────────────

export async function upsertAnnouncementAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("cms:manage");
  const id = String(formData.get("id") ?? "");
  const parsed = z
    .object({ title: z.string().trim().min(3).max(160), body: z.string().trim().min(3).max(2000), audience: z.string().trim().regex(/^(ALL|STUDENTS|INSTRUCTORS|ORG:[a-z0-9]+)$/), expiresAt: z.string().optional() })
    .safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  const data = { title: d.title, body: d.body, audience: d.audience, expiresAt: d.expiresAt ? new Date(d.expiresAt) : null };
  const a = id ? await db.announcement.update({ where: { id }, data }) : await db.announcement.create({ data: { ...data, authorId: staff.id } });
  await audit({ actorId: staff.id, action: id ? "announcement.update" : "announcement.create", entity: "Announcement", entityId: a.id });
  revalidatePath("/admin/cms");
  revalidatePath("/campus");
  return { ok: true, message: "Announcement saved." };
}

export async function deleteAnnouncementAction(formData: FormData) {
  const staff = await requirePermission("cms:manage");
  const id = String(formData.get("id") ?? "");
  await db.announcement.delete({ where: { id } });
  await audit({ actorId: staff.id, action: "announcement.delete", entity: "Announcement", entityId: id });
  revalidatePath("/admin/cms");
  revalidatePath("/campus");
}

export async function upsertEventAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const staff = await requirePermission("cms:manage");
  const id = String(formData.get("id") ?? "");
  const parsed = z
    .object({
      title: z.string().trim().min(3).max(160),
      description: z.string().trim().min(3).max(2000),
      type: z.enum(["LECTURE", "WORKSHOP", "SEMINAR", "DEADLINE", "COHORT"]),
      location: z.string().trim().min(2).max(160),
      startsAt: z.string().min(10),
      endsAt: z.string().min(10),
      courseId: z.string().max(64).optional(),
      published: z.string().optional(),
    })
    .safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  const startsAt = new Date(d.startsAt);
  const endsAt = new Date(d.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt < startsAt) return { ok: false, errors: { endsAt: ["End must be after start."] } };
  const data = { title: d.title, description: d.description, type: d.type, location: d.location, startsAt, endsAt, courseId: d.courseId || null, published: d.published === "on" };
  const e = id ? await db.campusEvent.update({ where: { id }, data }) : await db.campusEvent.create({ data });
  await audit({ actorId: staff.id, action: id ? "event.update" : "event.create", entity: "CampusEvent", entityId: e.id });
  revalidatePath("/admin/cms");
  revalidatePath("/campus");
  revalidatePath("/academy");
  return { ok: true, message: "Event saved." };
}

export async function deleteEventAction(formData: FormData) {
  const staff = await requirePermission("cms:manage");
  const id = String(formData.get("id") ?? "");
  await db.campusEvent.delete({ where: { id } });
  await audit({ actorId: staff.id, action: "event.delete", entity: "CampusEvent", entityId: id });
  revalidatePath("/admin/cms");
  revalidatePath("/campus");
}

// ── Academy: programs & course governance ────────────────────────────────────

const programSchema = z.object({
  title: z.string().trim().min(5).max(200),
  tagline: z.string().trim().min(5).max(200),
  level: z.enum(["FOUNDATION", "PROFESSIONAL", "ADVANCED", "EXECUTIVE", "RESEARCH"]),
  format: z.string().trim().min(3).max(120),
  durationWeeks: z.coerce.number().int().min(1).max(200),
  tuitionPkr: z.union([z.literal(""), z.coerce.number().int().min(0).max(100_000_000)]).optional(),
  summary: z.string().trim().min(20).max(1000),
  description: z.string().trim().min(20).max(20_000),
  outcomes: z.string().max(4000).optional(),
  curriculum: z.string().max(12_000).optional(),
  intake: z.string().trim().max(120).optional(),
  deadline: z.string().trim().max(120).optional(),
  requirements: z.string().max(3000).optional(),
  featured: z.string().optional(),
  published: z.string().optional(),
  order: z.coerce.number().int().min(0).max(100).default(0),
});

/** Curriculum text format: a line starting with "# " opens a block; following lines are items. */
function parseCurriculum(text: string | undefined) {
  const blocks: { title: string; items: string[] }[] = [];
  for (const raw of lines(text, 200)) {
    if (raw.startsWith("# ")) blocks.push({ title: raw.slice(2).trim(), items: [] });
    else if (blocks.length) blocks[blocks.length - 1]!.items.push(raw.replace(/^[-*]\s*/, ""));
  }
  return blocks;
}

export async function upsertProgramAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const admin = await requirePermission("academy:manage");
  const id = String(formData.get("id") ?? "");
  const parsed = programSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const d = parsed.data;
  const data = {
    title: d.title,
    tagline: d.tagline,
    level: d.level,
    format: d.format,
    durationWeeks: d.durationWeeks,
    tuitionPkr: typeof d.tuitionPkr === "number" ? d.tuitionPkr : null,
    summary: d.summary,
    description: d.description,
    outcomes: lines(d.outcomes),
    curriculum: parseCurriculum(d.curriculum),
    admissions: { intake: d.intake ?? "", deadline: d.deadline ?? "", requirements: lines(d.requirements) },
    featured: d.featured === "on",
    published: d.published === "on",
    order: d.order,
  };
  const program = id
    ? await db.program.update({ where: { id }, data })
    : await db.program.create({ data: { ...data, slug: await uniqueSlug(d.title, async (s) => Boolean(await db.program.findUnique({ where: { slug: s }, select: { id: true } }))) } });
  await audit({ actorId: admin.id, action: id ? "program.update" : "program.create", entity: "Program", entityId: program.id });
  revalidatePath("/programs", "layout");
  revalidatePath("/admin/academy", "layout");
  revalidatePath("/");
  if (!id) redirect(`/admin/academy/programs/${program.id}` as Route);
  return { ok: true, message: "Program saved." };
}

export async function setCourseGovernanceAction(formData: FormData) {
  const admin = await requirePermission("academy:manage");
  const courseId = String(formData.get("courseId") ?? "");
  const featured = String(formData.get("featured") ?? "") === "true";
  const instructorId = String(formData.get("instructorId") ?? "");
  await db.course.update({ where: { id: courseId }, data: { featured, ...(instructorId ? { instructorId } : {}) } });
  await audit({ actorId: admin.id, action: "course.governance", entity: "Course", entityId: courseId, meta: { featured, instructorId: instructorId || undefined } });
  revalidatePath("/admin/academy");
  revalidatePath("/courses", "layout");
  revalidatePath("/");
}
