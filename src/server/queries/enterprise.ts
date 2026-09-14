import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import type { EnterpriseContext, SessionUser } from "@/server/auth/dal";
import { can } from "@/server/auth/permissions";

export type PortalOrg = { id: string; slug: string; name: string; plan: "TEAM" | "ENTERPRISE"; seats: number; inviteCode: string; domain: string | null; membershipRole: "MEMBER" | "MANAGER" | "OWNER" | "STAFF" };

const orgSelect = { id: true, slug: true, name: true, plan: true, seats: true, inviteCode: true, domain: true } as const;

/** Resolves which organisation the portal shows: a managed org, or any org for staff. */
export const resolvePortalOrg = cache(async (user: SessionUser, contexts: EnterpriseContext[], orgSlug?: string): Promise<{ org: PortalOrg | null; options: { slug: string; name: string }[] }> => {
  if (can(user.role, "enterprise:manage")) {
    const all = await db.organization.findMany({ orderBy: { name: "asc" }, select: orgSelect });
    const chosen = (orgSlug ? all.find((o) => o.slug === orgSlug) : undefined) ?? all.find((o) => contexts.some((c) => c.org.id === o.id)) ?? all[0];
    return { org: chosen ? { ...chosen, membershipRole: contexts.find((c) => c.org.id === chosen.id)?.membershipRole ?? "STAFF" } : null, options: all.map((o) => ({ slug: o.slug, name: o.name })) };
  }
  const chosen = (orgSlug ? contexts.find((c) => c.org.slug === orgSlug) : undefined) ?? contexts[0];
  return {
    org: chosen ? { ...chosen.org, membershipRole: chosen.membershipRole } : null,
    options: contexts.map((c) => ({ slug: c.org.slug, name: c.org.name })),
  };
});

export const getPortalPeople = cache(async (orgId: string) => {
  const memberships = await db.membership.findMany({
    where: { orgId },
    orderBy: { joinedAt: "asc" },
    select: { id: true, role: true, joinedAt: true, user: { select: { id: true, name: true, email: true, avatarUrl: true, headline: true, lastLoginAt: true } } },
  });
  const userIds = memberships.map((m) => m.user.id);
  const [enrollments, certificates, progress] = await Promise.all([
    db.enrollment.findMany({ where: { userId: { in: userIds } }, select: { userId: true, status: true, progressPct: true, course: { select: { title: true } } } }),
    db.certificate.groupBy({ by: ["userId"], where: { userId: { in: userIds }, revokedAt: null }, _count: { _all: true } }),
    db.lessonProgress.groupBy({ by: ["userId"], where: { userId: { in: userIds }, completedAt: { not: null } }, _count: { _all: true }, _max: { updatedAt: true } }),
  ]);
  const certByUser = new Map(certificates.map((c) => [c.userId, c._count._all]));
  const progByUser = new Map(progress.map((p) => [p.userId, p]));
  return memberships.map((m) => {
    const mine = enrollments.filter((e) => e.userId === m.user.id);
    const active = mine.filter((e) => e.status === "ACTIVE");
    const avg = active.length ? Math.round(active.reduce((n, e) => n + e.progressPct, 0) / active.length) : 0;
    return {
      membershipId: m.id,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user,
      activeCourses: active.length,
      completedCourses: mine.filter((e) => e.status === "COMPLETED").length,
      avgProgress: avg,
      certificates: certByUser.get(m.user.id) ?? 0,
      lessonsCompleted: progByUser.get(m.user.id)?._count._all ?? 0,
      lastActive: progByUser.get(m.user.id)?._max.updatedAt ?? null,
      currentCourses: active.map((e) => e.course.title),
    };
  });
});

export const getPortalOverview = cache(async (orgId: string, seats: number) => {
  const people = await getPortalPeople(orgId);
  const userIds = people.map((p) => p.user.id);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [active7d, enrollments, recent] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId: { in: userIds }, updatedAt: { gte: weekAgo } }, distinct: ["userId"], select: { userId: true } }),
    db.enrollment.findMany({ where: { userId: { in: userIds } }, select: { status: true, progressPct: true, course: { select: { id: true, title: true, slug: true } } } }),
    db.lessonProgress.findMany({ where: { userId: { in: userIds }, completedAt: { not: null } }, orderBy: { updatedAt: "desc" }, take: 8, select: { updatedAt: true, user: { select: { name: true } }, lesson: { select: { title: true, module: { select: { course: { select: { title: true } } } } } } } }),
  ]);
  const courseMap = new Map<string, { title: string; slug: string; enrolled: number; completed: number; progress: number }>();
  for (const e of enrollments) {
    const c = courseMap.get(e.course.id) ?? { title: e.course.title, slug: e.course.slug, enrolled: 0, completed: 0, progress: 0 };
    c.enrolled += 1;
    if (e.status === "COMPLETED") c.completed += 1;
    c.progress += e.progressPct;
    courseMap.set(e.course.id, c);
  }
  const courses = [...courseMap.values()].map((c) => ({ ...c, avgProgress: c.enrolled ? Math.round(c.progress / c.enrolled) : 0 })).sort((a, b) => b.enrolled - a.enrolled);
  return {
    stats: {
      members: people.length,
      seats,
      active7d: active7d.length,
      enrollments: enrollments.length,
      completions: enrollments.filter((e) => e.status === "COMPLETED").length,
      certificates: people.reduce((n, p) => n + p.certificates, 0),
      avgProgress: enrollments.length ? Math.round(enrollments.reduce((n, e) => n + e.progressPct, 0) / enrollments.length) : 0,
    },
    courses: courses.slice(0, 6),
    recent,
    people: people.slice(0, 5),
  };
});

export const getPortalReports = cache(async (orgId: string) => {
  const people = await getPortalPeople(orgId);
  const userIds = people.map((p) => p.user.id);
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 12 * 7);
  since.setUTCHours(0, 0, 0, 0);
  const [enrollments, completions, certificates] = await Promise.all([
    db.enrollment.findMany({ where: { userId: { in: userIds } }, select: { status: true, progressPct: true, enrolledAt: true, course: { select: { id: true, title: true } } } }),
    db.lessonProgress.findMany({ where: { userId: { in: userIds }, completedAt: { gte: since } }, select: { completedAt: true } }),
    db.certificate.findMany({ where: { userId: { in: userIds }, revokedAt: null }, orderBy: { issuedAt: "desc" }, select: { code: true, grade: true, issuedAt: true, user: { select: { name: true } }, course: { select: { title: true } } } }),
  ]);
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const start = new Date(since);
    start.setUTCDate(start.getUTCDate() + i * 7);
    return { label: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(start), enrollments: 0, completions: 0 };
  });
  const bucket = (d: Date) => Math.min(11, Math.max(0, Math.floor((d.getTime() - since.getTime()) / (7 * 24 * 60 * 60 * 1000))));
  for (const e of enrollments) if (e.enrolledAt >= since) weeks[bucket(e.enrolledAt)]!.enrollments += 1;
  for (const c of completions) if (c.completedAt) weeks[bucket(c.completedAt)]!.completions += 1;
  const byCourse = new Map<string, { title: string; enrolled: number; completed: number; progress: number }>();
  for (const e of enrollments) {
    const c = byCourse.get(e.course.id) ?? { title: e.course.title, enrolled: 0, completed: 0, progress: 0 };
    c.enrolled += 1;
    if (e.status === "COMPLETED") c.completed += 1;
    c.progress += e.progressPct;
    byCourse.set(e.course.id, c);
  }
  return {
    weeks,
    courses: [...byCourse.values()].map((c) => ({ ...c, avgProgress: c.enrolled ? Math.round(c.progress / c.enrolled) : 0, completionRate: c.enrolled ? Math.round((c.completed / c.enrolled) * 100) : 0 })).sort((a, b) => b.enrolled - a.enrolled),
    certificates,
    people,
  };
});

export const getPortalGovernance = cache(async (orgId: string) => {
  const people = await getPortalPeople(orgId);
  const userIds = people.map((p) => p.user.id);
  const governanceCourse = await db.course.findFirst({ where: { slug: "ai-safety-alignment-and-governance", status: "PUBLISHED" }, select: { id: true, slug: true, title: true } });
  const enrollments = governanceCourse
    ? await db.enrollment.findMany({ where: { userId: { in: userIds }, courseId: governanceCourse.id }, select: { userId: true, status: true, progressPct: true } })
    : [];
  const byUser = new Map(enrollments.map((e) => [e.userId, e]));
  return {
    governanceCourse,
    roster: people.map((p) => ({ name: p.user.name, email: p.user.email, role: p.role, status: byUser.get(p.user.id)?.status ?? "NOT_STARTED", progress: byUser.get(p.user.id)?.progressPct ?? 0 })),
  };
});
