import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import type { SessionUser } from "@/server/auth/dal";
import { parseLab, parseQuiz } from "./campus";

function ownerFilter(user: SessionUser) {
  return user.role === "ADMIN" ? {} : { instructorId: user.id };
}

export const listStudioCourses = cache(async (user: SessionUser) => {
  const courses = await db.course.findMany({
    where: ownerFilter(user),
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      status: true,
      accent: true,
      category: true,
      level: true,
      updatedAt: true,
      publishedAt: true,
      instructor: { select: { name: true } },
      modules: { select: { _count: { select: { lessons: true } } } },
      _count: { select: { enrollments: true, certificates: true } },
    },
  });
  return courses.map((c) => ({
    ...c,
    lessonCount: c.modules.reduce((n, m) => n + m._count.lessons, 0),
    moduleCount: c.modules.length,
    learners: c._count.enrollments,
    completions: c._count.certificates,
    completionRate: c._count.enrollments ? Math.round((c._count.certificates / c._count.enrollments) * 100) : 0,
  }));
});

export const getStudioOverview = cache(async (user: SessionUser) => {
  const courses = await listStudioCourses(user);
  const courseIds = courses.map((c) => c.id);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [activeLearners, quizAgg, recentProgress, recentEnrollments, recentLabs] = await Promise.all([
    db.lessonProgress.findMany({ where: { updatedAt: { gte: weekAgo }, lesson: { module: { courseId: { in: courseIds } } } }, distinct: ["userId"], select: { userId: true } }),
    db.quizAttempt.aggregate({ where: { lesson: { module: { courseId: { in: courseIds } } } }, _avg: { score: true }, _count: { _all: true } }),
    db.lessonProgress.findMany({
      where: { completedAt: { not: null }, lesson: { module: { courseId: { in: courseIds } } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: { updatedAt: true, user: { select: { name: true } }, lesson: { select: { title: true, module: { select: { course: { select: { title: true } } } } } } },
    }),
    db.enrollment.findMany({ where: { courseId: { in: courseIds } }, orderBy: { enrolledAt: "desc" }, take: 6, select: { enrolledAt: true, user: { select: { name: true } }, course: { select: { title: true } } } }),
    db.labSubmission.findMany({ where: { lesson: { module: { courseId: { in: courseIds } } } }, orderBy: { createdAt: "desc" }, take: 6, select: { createdAt: true, passed: true, user: { select: { name: true } }, lesson: { select: { title: true, module: { select: { course: { select: { title: true } } } } } } } }),
  ]);

  const quizMax = await db.quizAttempt.aggregate({ where: { lesson: { module: { courseId: { in: courseIds } } } }, _avg: { maxScore: true } });
  const avgQuizPct = quizAgg._avg.score && quizMax._avg.maxScore ? Math.round((quizAgg._avg.score / quizMax._avg.maxScore) * 100) : null;

  const activity = [
    ...recentProgress.map((p) => ({ type: "progress" as const, at: p.updatedAt, learner: p.user.name, course: p.lesson.module.course.title, detail: `completed “${p.lesson.title}”` })),
    ...recentEnrollments.map((e) => ({ type: "enrollment" as const, at: e.enrolledAt, learner: e.user.name, course: e.course.title, detail: "enrolled" })),
    ...recentLabs.map((l) => ({ type: "lab" as const, at: l.createdAt, learner: l.user.name, course: l.lesson.module.course.title, detail: `${l.passed ? "passed" : "attempted"} lab “${l.lesson.title}”` })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10);

  return {
    courses,
    totals: {
      published: courses.filter((c) => c.status === "PUBLISHED").length,
      learners: courses.reduce((n, c) => n + c.learners, 0),
      activeLearners7d: activeLearners.length,
      completions: courses.reduce((n, c) => n + c.completions, 0),
      avgQuizPct,
      quizAttempts: quizAgg._count._all,
    },
    activity,
  };
});

export const getStudioCourse = cache(async (user: SessionUser, courseId: string) => {
  const course = await db.course.findFirst({
    where: { id: courseId, ...ownerFilter(user) },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      level: true,
      category: true,
      language: true,
      durationHours: true,
      accent: true,
      status: true,
      featured: true,
      tags: true,
      learningOutcomes: true,
      prerequisites: true,
      programId: true,
      publishedAt: true,
      updatedAt: true,
      instructor: { select: { id: true, name: true } },
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          summary: true,
          order: true,
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, type: true, order: true, durationMinutes: true, content: true, videoUrl: true, quiz: true, lab: true, isPreview: true },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return null;
  return {
    ...course,
    tags: Array.isArray(course.tags) ? (course.tags as string[]) : [],
    learningOutcomes: Array.isArray(course.learningOutcomes) ? (course.learningOutcomes as string[]) : [],
    prerequisites: Array.isArray(course.prerequisites) ? (course.prerequisites as string[]) : [],
    modules: course.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => ({ ...l, quiz: parseQuiz(l.quiz), lab: parseLab(l.lab) })),
    })),
  };
});

export const listStudioLearners = cache(async (user: SessionUser, opts: { courseId?: string; q?: string } = {}) => {
  const courses = await listStudioCourses(user);
  const courseIds = opts.courseId ? courses.filter((c) => c.id === opts.courseId).map((c) => c.id) : courses.map((c) => c.id);
  const enrollments = await db.enrollment.findMany({
    where: {
      courseId: { in: courseIds },
      ...(opts.q ? { user: { OR: [{ name: { contains: opts.q } }, { email: { contains: opts.q } }] } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      status: true,
      progressPct: true,
      enrolledAt: true,
      updatedAt: true,
      completedAt: true,
      user: { select: { id: true, name: true, email: true, avatarUrl: true, headline: true } },
      course: { select: { id: true, title: true, slug: true } },
      org: { select: { name: true } },
    },
  });
  const userIds = [...new Set(enrollments.map((e) => e.user.id))];
  const quizzes = await db.quizAttempt.groupBy({ by: ["userId"], where: { userId: { in: userIds }, lesson: { module: { courseId: { in: courseIds } } } }, _avg: { score: true, maxScore: true } });
  const quizByUser = new Map(quizzes.map((q) => [q.userId, q._avg.score && q._avg.maxScore ? Math.round((q._avg.score / q._avg.maxScore) * 100) : null]));
  return { courses, enrollments: enrollments.map((e) => ({ ...e, avgQuizPct: quizByUser.get(e.user.id) ?? null })) };
});

export const getStudioAnalytics = cache(async (user: SessionUser) => {
  const courses = await listStudioCourses(user);
  const courseIds = courses.map((c) => c.id);
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 12 * 7);
  since.setUTCHours(0, 0, 0, 0);

  const [enrollments, completions, quizAttempts, funnelRows] = await Promise.all([
    db.enrollment.findMany({ where: { courseId: { in: courseIds }, enrolledAt: { gte: since } }, select: { enrolledAt: true, courseId: true } }),
    db.lessonProgress.findMany({ where: { completedAt: { gte: since }, lesson: { module: { courseId: { in: courseIds } } } }, select: { completedAt: true } }),
    db.quizAttempt.findMany({ where: { lesson: { module: { courseId: { in: courseIds } } } }, select: { score: true, maxScore: true } }),
    db.lesson.findMany({
      where: { module: { courseId: { in: courseIds } } },
      orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
      select: { id: true, title: true, module: { select: { courseId: true, order: true } }, _count: { select: { progress: { where: { completedAt: { not: null } } } } } },
    }),
  ]);

  const weeks: { label: string; start: Date; enrollments: number; completions: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const start = new Date(since);
    start.setUTCDate(start.getUTCDate() + i * 7);
    weeks.push({ label: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(start), start, enrollments: 0, completions: 0 });
  }
  const bucket = (d: Date) => Math.min(11, Math.max(0, Math.floor((d.getTime() - since.getTime()) / (7 * 24 * 60 * 60 * 1000))));
  for (const e of enrollments) weeks[bucket(e.enrolledAt)]!.enrollments += 1;
  for (const c of completions) if (c.completedAt) weeks[bucket(c.completedAt)]!.completions += 1;

  const scoreBins = [0, 0, 0, 0, 0]; // 0-59, 60-69, 70-79, 80-89, 90-100
  for (const q of quizAttempts) {
    const pct = q.maxScore ? (q.score / q.maxScore) * 100 : 0;
    const bin = pct < 60 ? 0 : pct < 70 ? 1 : pct < 80 ? 2 : pct < 90 ? 3 : 4;
    scoreBins[bin] = (scoreBins[bin] ?? 0) + 1;
  }

  const funnels = courses
    .filter((c) => c.status === "PUBLISHED")
    .map((c) => ({
      courseId: c.id,
      title: c.title,
      learners: c.learners,
      lessons: funnelRows.filter((l) => l.module.courseId === c.id).map((l) => ({ id: l.id, title: l.title, completed: l._count.progress })),
    }));

  return { courses, weeks: weeks.map((w) => ({ label: w.label, enrollments: w.enrollments, completions: w.completions })), scoreBins, funnels, quizAttempts: quizAttempts.length };
});
