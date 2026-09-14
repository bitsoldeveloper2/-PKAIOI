"use server";

import { randomBytes } from "node:crypto";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { getCurrentUser } from "@/server/auth/dal";
import { parseQuiz } from "@/server/queries/campus";
import { labSubmissionSchema, noteSchema, quizSubmissionSchema } from "@/lib/validation";
import type { ActionState } from "./leads";

function certificateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += alphabet[bytes[i]! % alphabet.length];
  return `PIOAI-${out.slice(0, 5)}-${out.slice(5)}`;
}

/** Enrols the signed-in user on a published course, then opens the first lesson. */
export async function enrollAction(formData: FormData) {
  const user = await getCurrentUser();
  const slug = String(formData.get("slug") ?? "");
  if (!user) redirect(`/login?next=${encodeURIComponent(`/courses/${slug}`)}` as Route);

  const course = await db.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true, slug: true, modules: { orderBy: { order: "asc" }, take: 1, select: { lessons: { orderBy: { order: "asc" }, take: 1, select: { id: true } } } } },
  });
  if (!course) redirect("/courses");

  const membership = await db.membership.findFirst({ where: { userId: user.id }, select: { orgId: true } });

  await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: { userId: user.id, courseId: course.id, orgId: membership?.orgId ?? null },
    update: { status: "ACTIVE" },
  });
  await audit({ actorId: user.id, action: "course.enroll", entity: "Course", entityId: course.id });

  const firstLesson = course.modules[0]?.lessons[0]?.id;
  revalidatePath("/campus");
  redirect((firstLesson ? `/learn/${course.slug}/${firstLesson}` : `/campus/courses`) as Route);
}

async function recomputeProgress(userId: string, lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { course: { select: { id: true, slug: true, modules: { select: { lessons: { select: { id: true } } } } } } } } },
  });
  if (!lesson) return null;
  const course = lesson.module.course;
  const ids = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const done = await db.lessonProgress.count({ where: { userId, lessonId: { in: ids }, completedAt: { not: null } } });
  const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
  const completed = ids.length > 0 && done >= ids.length;

  const enrollment = await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } }, select: { id: true, status: true } });
  if (enrollment) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPct: pct,
        lastLessonId: lessonId,
        ...(completed && enrollment.status !== "COMPLETED" ? { status: "COMPLETED", completedAt: new Date() } : {}),
      },
    });
  }

  let certificateCodeIssued: string | null = null;
  if (completed) {
    const existing = await db.certificate.findUnique({ where: { userId_courseId: { userId, courseId: course.id } }, select: { code: true } });
    if (existing) {
      certificateCodeIssued = existing.code;
    } else {
      const attempts = await db.quizAttempt.findMany({ where: { userId, lesson: { module: { courseId: course.id } } }, select: { score: true, maxScore: true } });
      const ratio = attempts.length ? attempts.reduce((n, a) => n + a.score, 0) / Math.max(1, attempts.reduce((n, a) => n + a.maxScore, 0)) : 1;
      const grade = ratio >= 0.85 ? "Distinction" : ratio >= 0.7 ? "Merit" : "Pass";
      const cert = await db.certificate.create({ data: { code: certificateCode(), userId, courseId: course.id, grade } });
      certificateCodeIssued = cert.code;
      await audit({ actorId: userId, action: "certificate.issue", entity: "Certificate", entityId: cert.code, meta: { courseId: course.id, grade } });
    }
  }
  return { courseSlug: course.slug, pct, completed, certificateCode: certificateCodeIssued };
}

export type LessonActionState = ActionState & { certificateCode?: string | null; progressPct?: number; score?: number; maxScore?: number; results?: { id: string; correct: boolean; explanation: string; answer: number }[] };

export async function completeLessonAction(_prev: LessonActionState | undefined, formData: FormData): Promise<LessonActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has expired." };
  const lessonId = String(formData.get("lessonId") ?? "");
  const seconds = Math.min(7200, Math.max(0, Number(formData.get("seconds") ?? 0) || 0));
  if (!lessonId) return { ok: false, message: "Missing lesson." };

  const enrolled = await db.enrollment.findFirst({ where: { userId: user.id, course: { modules: { some: { lessons: { some: { id: lessonId } } } } } }, select: { id: true } });
  if (!enrolled) return { ok: false, message: "You are not enrolled on this course." };

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, completedAt: new Date(), seconds },
    update: { completedAt: new Date(), seconds: { increment: seconds } },
  });
  const result = await recomputeProgress(user.id, lessonId);
  if (result) revalidatePath(`/learn/${result.courseSlug}`, "layout");
  revalidatePath("/campus");
  return { ok: true, message: "Lesson marked complete.", certificateCode: result?.certificateCode ?? null, progressPct: result?.pct };
}

export async function saveNoteAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has expired." };
  const parsed = noteSchema.safeParse({ lessonId: formData.get("lessonId"), body: formData.get("body") ?? "" });
  if (!parsed.success) return { ok: false, message: "Note is too long." };
  const { lessonId, body } = parsed.data;
  if (!body.trim()) {
    await db.note.deleteMany({ where: { userId: user.id, lessonId } });
    return { ok: true, message: "Note cleared." };
  }
  await db.note.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, body },
    update: { body },
  });
  return { ok: true, message: "Note saved." };
}

export async function submitQuizAction(_prev: LessonActionState | undefined, formData: FormData): Promise<LessonActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has expired." };

  const lessonId = String(formData.get("lessonId") ?? "");
  // One radio group per question: answers[0], answers[1], ... A missing index fails validation below.
  const raw: number[] = [];
  for (const [key, value] of formData.entries()) {
    const m = /^answers\[(\d{1,2})\]$/.exec(key);
    if (m) raw[Number(m[1])] = Number(value);
  }
  const parsed = quizSubmissionSchema.safeParse({ lessonId, answers: Array.from(raw) });
  if (!parsed.success) return { ok: false, message: "Answer every question before submitting." };

  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { quiz: true, module: { select: { courseId: true } } } });
  if (!lesson) return { ok: false, message: "Lesson not found." };
  const enrolled = await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: lesson.module.courseId } }, select: { id: true } });
  if (!enrolled) return { ok: false, message: "You are not enrolled on this course." };

  const questions = parseQuiz(lesson.quiz);
  if (questions.length === 0) return { ok: false, message: "This lesson has no quiz." };
  if (parsed.data.answers.length !== questions.length) return { ok: false, message: "Answer every question before submitting." };

  const results = questions.map((q, i) => ({ id: q.id, correct: q.answer === parsed.data.answers[i], explanation: q.explanation ?? "", answer: q.answer }));
  const score = results.filter((r) => r.correct).length;
  const maxScore = questions.length;
  const passed = score / maxScore >= 0.7;

  await db.quizAttempt.create({ data: { userId: user.id, lessonId, score, maxScore, answers: parsed.data.answers } });
  let certificateCodeIssued: string | null = null;
  let progressPct: number | undefined;
  if (passed) {
    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      create: { userId: user.id, lessonId, completedAt: new Date(), seconds: 0 },
      update: { completedAt: new Date() },
    });
    const result = await recomputeProgress(user.id, lessonId);
    certificateCodeIssued = result?.certificateCode ?? null;
    progressPct = result?.pct;
    if (result) revalidatePath(`/learn/${result.courseSlug}`, "layout");
  }
  revalidatePath("/campus");
  return {
    ok: true,
    message: passed ? `You scored ${score}/${maxScore}. Lesson complete.` : `You scored ${score}/${maxScore}. You need 70% to complete this lesson — review the explanations and try again.`,
    score,
    maxScore,
    results,
    certificateCode: certificateCodeIssued,
    progressPct,
  };
}

export async function submitLabAction(_prev: LessonActionState | undefined, formData: FormData): Promise<LessonActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has expired." };

  let results: unknown;
  try {
    results = JSON.parse(String(formData.get("results") ?? "[]"));
  } catch {
    return { ok: false, message: "Malformed results." };
  }
  const parsed = labSubmissionSchema.safeParse({ lessonId: formData.get("lessonId"), language: formData.get("language"), code: formData.get("code") ?? "", results });
  if (!parsed.success) return { ok: false, message: "Submission could not be validated." };

  const lesson = await db.lesson.findUnique({ where: { id: parsed.data.lessonId }, select: { lab: true, module: { select: { courseId: true } } } });
  if (!lesson || !lesson.lab) return { ok: false, message: "This lesson has no lab." };
  const enrolled = await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: lesson.module.courseId } }, select: { id: true } });
  if (!enrolled) return { ok: false, message: "You are not enrolled on this course." };

  // The browser reports test outcomes; the server records them and only counts the lab
  // as complete when every declared test in the lesson spec is reported as passing.
  const spec = lesson.lab as { tests?: { name: string }[] };
  const declared = (spec.tests ?? []).map((t) => t.name);
  const reported = new Map(parsed.data.results.map((r) => [r.name, r.passed]));
  const passed = declared.length > 0 && declared.every((name) => reported.get(name) === true);

  await db.labSubmission.create({ data: { userId: user.id, lessonId: parsed.data.lessonId, language: parsed.data.language, code: parsed.data.code, passed, results: parsed.data.results } });

  let certificateCodeIssued: string | null = null;
  let progressPct: number | undefined;
  if (passed) {
    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: parsed.data.lessonId } },
      create: { userId: user.id, lessonId: parsed.data.lessonId, completedAt: new Date(), seconds: 0 },
      update: { completedAt: new Date() },
    });
    const result = await recomputeProgress(user.id, parsed.data.lessonId);
    certificateCodeIssued = result?.certificateCode ?? null;
    progressPct = result?.pct;
    if (result) revalidatePath(`/learn/${result.courseSlug}`, "layout");
  }
  revalidatePath("/campus");
  return {
    ok: true,
    message: passed ? "All tests pass. Lab complete." : "Submission saved. Some tests are still failing.",
    certificateCode: certificateCodeIssued,
    progressPct,
  };
}
