import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import { stringList } from "@/lib/utils";
import type { ApplicationStatus, LeadStage, Role } from "@/generated/prisma/enums";

export const getAdminOverview = cache(async () => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [usersByRole, appsByStatus, leadsByStage, enrollments, certificates, courses, posts, newUsers7d, recentAudit, recentApps, recentLeads, orgs] = await Promise.all([
    db.user.groupBy({ by: ["role"], _count: { _all: true } }),
    db.application.groupBy({ by: ["status"], _count: { _all: true } }),
    db.lead.groupBy({ by: ["stage"], _count: { _all: true }, _sum: { value: true } }),
    db.enrollment.count(),
    db.certificate.count({ where: { revokedAt: null } }),
    db.course.count({ where: { status: "PUBLISHED" } }),
    db.post.count({ where: { status: "PUBLISHED" } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, action: true, entity: true, entityId: true, createdAt: true, actor: { select: { name: true } } } }),
    db.application.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, firstName: true, lastName: true, status: true, createdAt: true, program: { select: { title: true } } } }),
    db.lead.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, name: true, organization: true, stage: true, updatedAt: true, value: true } }),
    db.organization.count(),
  ]);
  const roleCount = (r: Role) => usersByRole.find((u) => u.role === r)?._count._all ?? 0;
  const statusCount = (s: ApplicationStatus) => appsByStatus.find((a) => a.status === s)?._count._all ?? 0;
  const pipelineValue = leadsByStage.filter((l) => l.stage !== "LOST" && l.stage !== "WON").reduce((n, l) => n + (l._sum.value ?? 0), 0);
  return {
    users: { total: usersByRole.reduce((n, u) => n + u._count._all, 0), students: roleCount("STUDENT"), instructors: roleCount("INSTRUCTOR"), staff: roleCount("STAFF") + roleCount("ADMIN"), new7d: newUsers7d },
    admissions: { open: statusCount("SUBMITTED") + statusCount("UNDER_REVIEW") + statusCount("INTERVIEW"), offers: statusCount("OFFER"), accepted: statusCount("ACCEPTED"), total: appsByStatus.reduce((n, a) => n + a._count._all, 0) },
    crm: { open: leadsByStage.filter((l) => l.stage !== "LOST" && l.stage !== "WON").reduce((n, l) => n + l._count._all, 0), pipelineValue, won: leadsByStage.find((l) => l.stage === "WON")?._count._all ?? 0 },
    academy: { enrollments, certificates, courses, posts, orgs },
    recentAudit,
    recentApps,
    recentLeads,
  };
});

export const listUsers = cache(async (opts: { q?: string; role?: Role; page?: number } = {}) => {
  const take = 40;
  const page = Math.max(1, opts.page ?? 1);
  const where = {
    ...(opts.role ? { role: opts.role } : {}),
    ...(opts.q ? { OR: [{ name: { contains: opts.q } }, { email: { contains: opts.q } }] } : {}),
  };
  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
      select: { id: true, name: true, email: true, role: true, headline: true, avatarUrl: true, createdAt: true, lastLoginAt: true, disabledAt: true, _count: { select: { enrollments: true, coursesTaught: true, memberships: true } } },
    }),
    db.user.count({ where }),
  ]);
  return { users, total, page, pages: Math.max(1, Math.ceil(total / take)) };
});

export const listAuditLog = cache(async (opts: { page?: number; q?: string } = {}) => {
  const take = 60;
  const page = Math.max(1, opts.page ?? 1);
  const where = opts.q ? { OR: [{ action: { contains: opts.q } }, { entity: { contains: opts.q } }, { entityId: { contains: opts.q } }] } : {};
  const [entries, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take, select: { id: true, action: true, entity: true, entityId: true, meta: true, ip: true, createdAt: true, actor: { select: { name: true, email: true } } } }),
    db.auditLog.count({ where }),
  ]);
  return { entries, total, page, pages: Math.max(1, Math.ceil(total / take)) };
});

export const getSettings = cache(async () => {
  const rows = await db.siteSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    banner: (map.get("site.banner") as { enabled: boolean; text: string; href: string } | undefined) ?? { enabled: false, text: "", href: "/apply" },
    intakes: (map.get("admissions.intakes") as Record<string, string> | undefined) ?? {},
    ai: (map.get("platform.ai") as { tutorEnabled: boolean; labHintsEnabled: boolean; dailyMessageCap: number } | undefined) ?? { tutorEnabled: true, labHintsEnabled: true, dailyMessageCap: 200 },
  };
});

// ── Admissions ───────────────────────────────────────────────────────────────

export const listApplications = cache(async (opts: { status?: ApplicationStatus; programId?: string; q?: string } = {}) =>
  db.application.findMany({
    where: {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.programId ? { programId: opts.programId } : {}),
      ...(opts.q ? { OR: [{ firstName: { contains: opts.q } }, { lastName: { contains: opts.q } }, { email: { contains: opts.q } }, { city: { contains: opts.q } }] } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
    select: { id: true, firstName: true, lastName: true, email: true, city: true, country: true, status: true, score: true, createdAt: true, program: { select: { id: true, title: true, level: true } }, reviewer: { select: { name: true } } },
  }),
);

export const getApplication = cache(async (id: string) =>
  db.application.findUnique({
    where: { id },
    include: {
      program: { select: { id: true, title: true, level: true, slug: true } },
      reviewer: { select: { id: true, name: true } },
      applicant: { select: { id: true, name: true, email: true } },
      events: { orderBy: { createdAt: "desc" }, include: { actor: { select: { name: true } } } },
    },
  }),
);

export const listReviewers = cache(async () => db.user.findMany({ where: { role: { in: ["INSTRUCTOR", "STAFF", "ADMIN"] } }, orderBy: { name: "asc" }, select: { id: true, name: true, role: true } }));

// ── CRM ──────────────────────────────────────────────────────────────────────

export const listLeads = cache(async (opts: { stage?: LeadStage; ownerId?: string; q?: string } = {}) =>
  db.lead.findMany({
    where: {
      ...(opts.stage ? { stage: opts.stage } : {}),
      ...(opts.ownerId ? { ownerId: opts.ownerId } : {}),
      ...(opts.q ? { OR: [{ name: { contains: opts.q } }, { email: { contains: opts.q } }, { organization: { contains: opts.q } }] } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 300,
    select: { id: true, name: true, email: true, organization: true, role: true, source: true, interest: true, stage: true, value: true, updatedAt: true, createdAt: true, owner: { select: { id: true, name: true } }, _count: { select: { activities: true } } },
  }),
);

export const getLead = cache(async (id: string) =>
  db.lead.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true } }, activities: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } } },
  }),
);

// ── Enterprise (admin view) ──────────────────────────────────────────────────

export const listOrganizations = cache(async () =>
  db.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, name: true, domain: true, plan: true, seats: true, inviteCode: true, createdAt: true, _count: { select: { memberships: true, enrollments: true } } },
  }),
);

export const getOrganizationBySlug = cache(async (slug: string) => {
  const org = await db.organization.findUnique({
    where: { slug },
    include: {
      memberships: { orderBy: { joinedAt: "asc" }, include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, headline: true, lastLoginAt: true } } } },
    },
  });
  if (!org) return null;
  const userIds = org.memberships.map((m) => m.userId);
  const [enrollments, certificates, progress] = await Promise.all([
    db.enrollment.findMany({ where: { userId: { in: userIds } }, select: { userId: true, status: true, progressPct: true, updatedAt: true, course: { select: { id: true, title: true, slug: true } } } }),
    db.certificate.findMany({ where: { userId: { in: userIds }, revokedAt: null }, select: { userId: true, courseId: true, issuedAt: true } }),
    db.lessonProgress.groupBy({ by: ["userId"], where: { userId: { in: userIds }, completedAt: { not: null } }, _count: { _all: true }, _max: { updatedAt: true } }),
  ]);
  return { ...org, enrollments, certificates, progress };
});

// ── Research (admin) ─────────────────────────────────────────────────────────

export const listResearchAdmin = cache(async () => {
  const [labs, publications, projects, faculty] = await Promise.all([
    db.researchLab.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, name: true, tagline: true, published: true, lead: { select: { name: true } }, _count: { select: { publications: true, projects: true } } } }),
    db.publication.findMany({ orderBy: [{ year: "desc" }, { title: "asc" }], select: { id: true, slug: true, title: true, venue: true, year: true, type: true, featured: true, published: true, lab: { select: { name: true } } } }),
    db.researchProject.findMany({ orderBy: { startedAt: "desc" }, select: { id: true, slug: true, title: true, status: true, published: true, lab: { select: { name: true } } } }),
    db.faculty.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, slug: true, name: true, title: true, department: true, featured: true, user: { select: { email: true } } } }),
  ]);
  return { labs, publications, projects, faculty };
});

export const getResearchEditData = cache(async () => {
  const [labs, faculty] = await Promise.all([
    db.researchLab.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.faculty.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { labs, faculty };
});

export const getPublicationForEdit = cache(async (id: string) => {
  const pub = await db.publication.findUnique({ where: { id } });
  return pub ? { ...pub, authors: stringList(pub.authors) } : null;
});

export const getLabForEdit = cache(async (id: string) => {
  const lab = await db.researchLab.findUnique({ where: { id } });
  return lab ? { ...lab, focusAreas: stringList(lab.focusAreas) } : null;
});

export const getFacultyForEdit = cache(async (id: string) => {
  const f = await db.faculty.findUnique({ where: { id }, include: { user: { select: { email: true } } } });
  return f ? { ...f, expertise: stringList(f.expertise), links: (Array.isArray(f.links) ? f.links : []) as { label: string; url: string }[] } : null;
});

export const getProjectForEdit = cache(async (id: string) => db.researchProject.findUnique({ where: { id } }));

// ── CMS (admin) ──────────────────────────────────────────────────────────────

export const listCmsAdmin = cache(async () => {
  const [posts, pages, announcements, events] = await Promise.all([
    db.post.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, slug: true, title: true, category: true, status: true, publishedAt: true, updatedAt: true, author: { select: { name: true } } } }),
    db.page.findMany({ orderBy: { slug: "asc" }, select: { id: true, slug: true, title: true, status: true, updatedAt: true, updatedBy: { select: { name: true } } } }),
    db.announcement.findMany({ orderBy: { publishedAt: "desc" }, select: { id: true, title: true, body: true, audience: true, publishedAt: true, expiresAt: true, author: { select: { name: true } } } }),
    db.campusEvent.findMany({ orderBy: { startsAt: "desc" }, take: 50, select: { id: true, title: true, type: true, location: true, startsAt: true, endsAt: true, published: true, course: { select: { title: true } } } }),
  ]);
  return { posts, pages, announcements, events };
});

export const getPostForEdit = cache(async (id: string) => {
  const post = await db.post.findUnique({ where: { id } });
  return post ? { ...post, tags: stringList(post.tags) } : null;
});

export const getPageForEdit = cache(async (id: string) => db.page.findUnique({ where: { id } }));

// ── Academy (admin) ──────────────────────────────────────────────────────────

export const listAcademyAdmin = cache(async () => {
  const [programs, courses, instructors] = await Promise.all([
    db.program.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true, level: true, durationWeeks: true, tuitionPkr: true, published: true, featured: true, _count: { select: { courses: true, applications: true } } } }),
    db.course.findMany({ orderBy: [{ status: "asc" }, { updatedAt: "desc" }], select: { id: true, slug: true, title: true, status: true, featured: true, category: true, level: true, updatedAt: true, instructor: { select: { id: true, name: true } }, program: { select: { title: true } }, _count: { select: { enrollments: true } } } }),
    db.user.findMany({ where: { role: { in: ["INSTRUCTOR", "ADMIN"] } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { programs, courses, instructors };
});

export const getProgramForEdit = cache(async (id: string) => {
  const p = await db.program.findUnique({ where: { id } });
  if (!p) return null;
  return {
    ...p,
    outcomes: stringList(p.outcomes),
    curriculum: (Array.isArray(p.curriculum) ? p.curriculum : []) as { title: string; items: string[] }[],
    admissions: (p.admissions ?? {}) as { intake?: string; deadline?: string; requirements?: string[] },
  };
});
