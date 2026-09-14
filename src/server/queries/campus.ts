import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import type { LessonType } from "@/generated/prisma/enums";
import { listAnnouncements, listUpcomingEvents } from "./cms";
import { getFeaturedCourses } from "./academy";

export type QuizQuestionPublic = { id: string; prompt: string; options: string[]; explanation?: string };
export type QuizQuestion = QuizQuestionPublic & { answer: number };
export type LabSpec = {
  language: "python" | "javascript";
  starterCode: string;
  hint?: string;
  tests: { name: string; code: string }[];
};

export function parseQuiz(value: unknown): QuizQuestion[] {
  if (!value || typeof value !== "object") return [];
  const questions = (value as { questions?: unknown }).questions;
  if (!Array.isArray(questions)) return [];
  return questions
    .filter((q): q is QuizQuestion => typeof q === "object" && q !== null && typeof (q as QuizQuestion).prompt === "string")
    .map((q) => ({ ...q, options: Array.isArray(q.options) ? q.options.map(String) : [] }));
}

export function parseLab(value: unknown): LabSpec | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<LabSpec>;
  if (v.language !== "python" && v.language !== "javascript") return null;
  return {
    language: v.language,
    starterCode: typeof v.starterCode === "string" ? v.starterCode : "",
    hint: typeof v.hint === "string" ? v.hint : undefined,
    tests: Array.isArray(v.tests) ? v.tests.filter((t) => typeof t?.name === "string" && typeof t?.code === "string") : [],
  };
}

export type EnrollmentCard = {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  progressPct: number;
  enrolledAt: Date;
  completedAt: Date | null;
  course: { id: string; slug: string; title: string; subtitle: string; accent: string; level: string; durationHours: number; instructorName: string; category: string };
  totalLessons: number;
  completedLessons: number;
  nextLesson: { id: string; title: string; type: LessonType } | null;
};

async function buildEnrollmentCards(userId: string): Promise<EnrollmentCard[]> {
  const enrollments = await db.enrollment.findMany({
    where: { userId, status: { not: "DROPPED" } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      status: true,
      progressPct: true,
      enrolledAt: true,
      completedAt: true,
      lastLessonId: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          accent: true,
          level: true,
          durationHours: true,
          category: true,
          instructor: { select: { name: true } },
          modules: { orderBy: { order: "asc" }, select: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, type: true } } } },
        },
      },
    },
  });
  if (enrollments.length === 0) return [];

  const lessonIds = enrollments.flatMap((e) => e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)));
  const completed = await db.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessonIds }, completedAt: { not: null } },
    select: { lessonId: true },
  });
  const done = new Set(completed.map((c) => c.lessonId));

  return enrollments.map((e) => {
    const lessons = e.course.modules.flatMap((m) => m.lessons);
    const completedLessons = lessons.filter((l) => done.has(l.id)).length;
    const next = lessons.find((l) => !done.has(l.id)) ?? null;
    return {
      id: e.id,
      status: e.status,
      progressPct: lessons.length ? Math.round((completedLessons / lessons.length) * 100) : e.progressPct,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
      course: {
        id: e.course.id,
        slug: e.course.slug,
        title: e.course.title,
        subtitle: e.course.subtitle,
        accent: e.course.accent,
        level: e.course.level,
        durationHours: e.course.durationHours,
        category: e.course.category,
        instructorName: e.course.instructor.name,
      },
      totalLessons: lessons.length,
      completedLessons,
      nextLesson: next,
    };
  });
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function computeStreak(dates: Date[]) {
  const days = new Set(dates.map(dayKey));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export const getCampusDashboard = cache(async (userId: string) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [enrollments, progressRows, certificates, conversations, memberships] = await Promise.all([
    buildEnrollmentCards(userId),
    db.lessonProgress.findMany({ where: { userId }, select: { completedAt: true, seconds: true, updatedAt: true } }),
    db.certificate.count({ where: { userId, revokedAt: null } }),
    db.conversation.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, updatedAt: true, mode: true } }),
    db.membership.findMany({ where: { userId }, select: { orgId: true, org: { select: { name: true } } } }),
  ]);

  const completedDates = progressRows.flatMap((p) => (p.completedAt ? [p.completedAt] : []));
  const minutesThisWeek = Math.round(progressRows.filter((p) => p.updatedAt >= weekAgo).reduce((n, p) => n + p.seconds, 0) / 60);
  const courseIds = enrollments.map((e) => e.course.id);
  const audiences = ["ALL", "STUDENTS", ...memberships.map((m) => `ORG:${m.orgId}`)];
  const [events, announcements, recommended] = await Promise.all([
    listUpcomingEvents(5, courseIds),
    listAnnouncements(audiences, 4),
    getFeaturedCourses(6),
  ]);

  return {
    enrollments,
    stats: {
      activeCourses: enrollments.filter((e) => e.status === "ACTIVE").length,
      completedLessons: completedDates.length,
      certificates,
      streakDays: computeStreak(completedDates),
      minutesThisWeek,
    },
    events,
    announcements,
    conversations,
    recommended: recommended.filter((c) => !courseIds.includes(c.id)).slice(0, 3),
    organisation: memberships[0]?.org.name ?? null,
  };
});

export const listMyEnrollments = cache(async (userId: string) => buildEnrollmentCards(userId));

export const getCurriculumForLearner = cache(async (userId: string, courseSlug: string) => {
  const course = await db.course.findFirst({
    where: { slug: courseSlug, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      accent: true,
      instructor: { select: { name: true } },
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          summary: true,
          lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, type: true, durationMinutes: true, isPreview: true } },
        },
      },
    },
  });
  if (!course) return null;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    select: { id: true, status: true, lastLessonId: true, completedAt: true },
  });

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const done = new Set(
    (
      await db.lessonProgress.findMany({
        where: { userId, lessonId: { in: lessonIds }, completedAt: { not: null } },
        select: { lessonId: true },
      })
    ).map((r) => r.lessonId),
  );

  const modules = course.modules.map((m) => ({
    ...m,
    lessons: m.lessons.map((l) => ({ ...l, completed: done.has(l.id) })),
  }));
  const flat = modules.flatMap((m) => m.lessons);
  const completedCount = flat.filter((l) => l.completed).length;

  return {
    course: { id: course.id, slug: course.slug, title: course.title, accent: course.accent, instructorName: course.instructor.name },
    enrollment,
    modules,
    totalLessons: flat.length,
    completedLessons: completedCount,
    progressPct: flat.length ? Math.round((completedCount / flat.length) * 100) : 0,
    nextLessonId: flat.find((l) => !l.completed)?.id ?? flat[0]?.id ?? null,
  };
});

export const getLessonForLearner = cache(async (userId: string, courseSlug: string, lessonId: string) => {
  const curriculum = await getCurriculumForLearner(userId, courseSlug);
  if (!curriculum) return null;

  const flat = curriculum.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title, moduleId: m.id })));
  const index = flat.findIndex((l) => l.id === lessonId);
  if (index === -1) return null;
  const current = flat[index]!;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, title: true, type: true, content: true, videoUrl: true, durationMinutes: true, quiz: true, lab: true, isPreview: true },
  });
  if (!lesson) return null;

  const [progress, note, attempts, lastLab] = await Promise.all([
    db.lessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId } }, select: { completedAt: true, seconds: true } }),
    db.note.findUnique({ where: { userId_lessonId: { userId, lessonId } }, select: { body: true, updatedAt: true } }),
    db.quizAttempt.findMany({ where: { userId, lessonId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, score: true, maxScore: true, createdAt: true } }),
    db.labSubmission.findFirst({ where: { userId, lessonId }, orderBy: { createdAt: "desc" }, select: { code: true, passed: true, results: true, createdAt: true } }),
  ]);

  const quiz = parseQuiz(lesson.quiz).map<QuizQuestionPublic>((q) => ({ id: q.id, prompt: q.prompt, options: q.options, explanation: q.explanation }));
  const lab = parseLab(lesson.lab);

  return {
    curriculum,
    lesson: { ...lesson, quiz, lab },
    moduleTitle: current.moduleTitle,
    position: { index: index + 1, total: flat.length },
    prev: flat[index - 1] ? { id: flat[index - 1]!.id, title: flat[index - 1]!.title } : null,
    next: flat[index + 1] ? { id: flat[index + 1]!.id, title: flat[index + 1]!.title } : null,
    completed: Boolean(progress?.completedAt),
    note: note?.body ?? "",
    attempts,
    lastLab: lastLab
      ? { code: lastLab.code, passed: lastLab.passed, results: (lastLab.results as { name: string; passed: boolean; output: string }[]) ?? [], createdAt: lastLab.createdAt }
      : null,
  };
});

export const listMyCertificates = cache(async (userId: string) =>
  db.certificate.findMany({
    where: { userId, revokedAt: null },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      code: true,
      grade: true,
      issuedAt: true,
      course: { select: { slug: true, title: true, subtitle: true, accent: true, durationHours: true, instructor: { select: { name: true } } } },
    },
  }),
);

export const getCertificateByCode = cache(async (code: string) =>
  db.certificate.findUnique({
    where: { code: code.toUpperCase() },
    select: {
      id: true,
      code: true,
      grade: true,
      issuedAt: true,
      revokedAt: true,
      user: { select: { name: true } },
      course: { select: { slug: true, title: true, subtitle: true, durationHours: true, level: true, instructor: { select: { name: true, headline: true } } } },
    },
  }),
);

export const listConversations = cache(async (userId: string, mode?: "tutor" | "lab") =>
  db.conversation.findMany({
    where: { userId, ...(mode ? { mode } : {}) },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, updatedAt: true, courseId: true, lessonId: true, mode: true, _count: { select: { messages: true } } },
  }),
);

export const getConversation = cache(async (userId: string, id: string) =>
  db.conversation.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      courseId: true,
      lessonId: true,
      mode: true,
      messages: { orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, createdAt: true } },
    },
  }),
);
