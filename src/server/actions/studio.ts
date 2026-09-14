"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { requirePermission, type SessionUser } from "@/server/auth/dal";
import { fieldErrors, formToObject } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import type { Prisma } from "@/generated/prisma/client";
import type { ActionState } from "./leads";

export type { ActionState };

const levelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
const statusEnum = z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]);
const lessonTypeEnum = z.enum(["VIDEO", "ARTICLE", "QUIZ", "LAB"]);
const accentEnum = z.enum(["jade", "gold", "violet", "coral", "sky", "ink", "slate"]);

const lines = (v: unknown) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);

const courseSchema = z.object({
  title: z.string().trim().min(3).max(120),
  subtitle: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(20_000),
  level: levelEnum,
  category: z.string().trim().min(2).max(60),
  language: z.string().trim().min(2).max(40).default("English"),
  durationHours: z.coerce.number().int().min(0).max(500),
  accent: accentEnum.default("jade"),
  programId: z.string().max(64).optional(),
  tags: z.string().max(500).optional(),
  learningOutcomes: z.string().max(4000).optional(),
  prerequisites: z.string().max(2000).optional(),
  featured: z.string().optional(),
});

const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        prompt: z.string().trim().min(3).max(500),
        options: z.array(z.string().trim().min(1).max(300)).min(2).max(6),
        answer: z.number().int().min(0).max(5),
        explanation: z.string().trim().max(1000).default(""),
      }),
    )
    .min(1)
    .max(30),
});

const labSchema = z.object({
  language: z.enum(["python", "javascript"]),
  starterCode: z.string().max(20_000),
  hint: z.string().max(1000).optional(),
  tests: z.array(z.object({ name: z.string().trim().min(1).max(200), code: z.string().min(1).max(5000) })).min(1).max(20),
});

const lessonSchema = z.object({
  title: z.string().trim().min(2).max(160),
  type: lessonTypeEnum,
  durationMinutes: z.coerce.number().int().min(1).max(600),
  content: z.string().max(60_000).default(""),
  videoUrl: z.string().max(500).optional(),
  isPreview: z.string().optional(),
  quiz: z.string().max(60_000).optional(),
  lab: z.string().max(60_000).optional(),
});

async function ownCourse(user: SessionUser, courseId: string) {
  const course = await db.course.findFirst({ where: { id: courseId, ...(user.role === "ADMIN" ? {} : { instructorId: user.id }) }, select: { id: true, slug: true } });
  if (!course) throw new Error("Course not found or not yours.");
  return course;
}

async function ownModule(user: SessionUser, moduleId: string) {
  const mod = await db.module.findFirst({ where: { id: moduleId, course: user.role === "ADMIN" ? {} : { instructorId: user.id } }, select: { id: true, courseId: true, course: { select: { slug: true } } } });
  if (!mod) throw new Error("Module not found or not yours.");
  return mod;
}

async function ownLesson(user: SessionUser, lessonId: string) {
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, module: { course: user.role === "ADMIN" ? {} : { instructorId: user.id } } }, select: { id: true, moduleId: true, module: { select: { courseId: true, course: { select: { slug: true } } } } } });
  if (!lesson) throw new Error("Lesson not found or not yours.");
  return lesson;
}

function refresh(courseId: string, slug: string) {
  revalidatePath(`/studio/courses/${courseId}`);
  revalidatePath("/studio");
  revalidatePath("/studio/courses");
  revalidatePath(`/courses/${slug}`);
  revalidatePath("/courses");
}

export async function createCourseAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const user = await requirePermission("studio:access");
  const parsed = z.object({ title: z.string().trim().min(3).max(120), subtitle: z.string().trim().min(3).max(160), category: z.string().trim().min(2).max(60), level: levelEnum }).safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const base = slugify(parsed.data.title) || "course";
  let slug = base;
  for (let i = 2; await db.course.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`;

  const course = await db.course.create({
    data: {
      ...parsed.data,
      slug,
      description: `## About this course\n\nDescribe what learners will build, why it matters and how the course is assessed.`,
      instructorId: user.id,
      tags: [],
      learningOutcomes: [],
      prerequisites: [],
      modules: { create: { title: "Module 1", order: 0 } },
    },
    select: { id: true },
  });
  await audit({ actorId: user.id, action: "course.create", entity: "Course", entityId: course.id });
  revalidatePath("/studio/courses");
  redirect(`/studio/courses/${course.id}` as Route);
}

export async function updateCourseAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const user = await requirePermission("studio:access");
  const courseId = String(formData.get("courseId") ?? "");
  const parsed = courseSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const course = await ownCourse(user, courseId);
  const d = parsed.data;
  await db.course.update({
    where: { id: course.id },
    data: {
      title: d.title,
      subtitle: d.subtitle,
      description: d.description,
      level: d.level,
      category: d.category,
      language: d.language,
      durationHours: d.durationHours,
      accent: d.accent,
      programId: d.programId || null,
      tags: lines(d.tags?.replace(/,/g, "\n")),
      learningOutcomes: lines(d.learningOutcomes),
      prerequisites: lines(d.prerequisites),
      featured: user.role === "ADMIN" ? d.featured === "on" : undefined,
    },
  });
  await audit({ actorId: user.id, action: "course.update", entity: "Course", entityId: course.id });
  refresh(course.id, course.slug);
  return { ok: true, message: "Course settings saved." };
}

export async function setCourseStatusAction(formData: FormData) {
  const user = await requirePermission("studio:access");
  const courseId = String(formData.get("courseId") ?? "");
  const status = statusEnum.parse(formData.get("status"));
  const course = await ownCourse(user, courseId);
  if (status === "PUBLISHED") {
    const lessons = await db.lesson.count({ where: { module: { courseId: course.id } } });
    if (lessons === 0) throw new Error("Add at least one lesson before publishing.");
  }
  await db.course.update({ where: { id: course.id }, data: { status, publishedAt: status === "PUBLISHED" ? new Date() : undefined } });
  await audit({ actorId: user.id, action: `course.status.${status.toLowerCase()}`, entity: "Course", entityId: course.id });
  refresh(course.id, course.slug);
}

export async function addModuleAction(formData: FormData) {
  const user = await requirePermission("studio:access");
  const courseId = String(formData.get("courseId") ?? "");
  const title = z.string().trim().min(2).max(120).parse(formData.get("title"));
  const course = await ownCourse(user, courseId);
  const count = await db.module.count({ where: { courseId: course.id } });
  await db.module.create({ data: { courseId: course.id, title, order: count } });
  refresh(course.id, course.slug);
}

export async function updateModuleAction(formData: FormData) {
  const user = await requirePermission("studio:access");
  const moduleId = String(formData.get("moduleId") ?? "");
  const title = z.string().trim().min(2).max(120).parse(formData.get("title"));
  const summary = z.string().trim().max(300).optional().parse(formData.get("summary") ?? undefined);
  const mod = await ownModule(user, moduleId);
  await db.module.update({ where: { id: mod.id }, data: { title, summary: summary || null } });
  refresh(mod.courseId, mod.course.slug);
}

export async function deleteModuleAction(formData: FormData) {
  const user = await requirePermission("studio:access");
  const moduleId = String(formData.get("moduleId") ?? "");
  const mod = await ownModule(user, moduleId);
  await db.module.delete({ where: { id: mod.id } });
  const remaining = await db.module.findMany({ where: { courseId: mod.courseId }, orderBy: { order: "asc" }, select: { id: true } });
  await Promise.all(remaining.map((m, i) => db.module.update({ where: { id: m.id }, data: { order: i } })));
  await audit({ actorId: user.id, action: "module.delete", entity: "Module", entityId: mod.id });
  refresh(mod.courseId, mod.course.slug);
}

export async function reorderModulesAction(courseId: string, orderedIds: string[]) {
  const user = await requirePermission("studio:access");
  const course = await ownCourse(user, courseId);
  const ids = z.array(z.string()).max(100).parse(orderedIds);
  const mods = await db.module.findMany({ where: { courseId: course.id }, select: { id: true } });
  const known = new Set(mods.map((m) => m.id));
  await db.$transaction(ids.filter((id) => known.has(id)).map((id, i) => db.module.update({ where: { id }, data: { order: i } })));
  refresh(course.id, course.slug);
}

export async function addLessonAction(formData: FormData) {
  const user = await requirePermission("studio:access");
  const moduleId = String(formData.get("moduleId") ?? "");
  const type = lessonTypeEnum.parse(formData.get("type") ?? "ARTICLE");
  const title = z.string().trim().min(2).max(160).parse(formData.get("title"));
  const mod = await ownModule(user, moduleId);
  const count = await db.lesson.count({ where: { moduleId: mod.id } });
  const defaults: Record<string, Partial<Prisma.LessonUncheckedCreateInput>> = {
    VIDEO: { videoUrl: "/media/sample-lecture.webm", durationMinutes: 15 },
    ARTICLE: { durationMinutes: 12 },
    QUIZ: { durationMinutes: 8, quiz: { questions: [{ id: "q1", prompt: "First question", options: ["Option A", "Option B", "Option C"], answer: 0, explanation: "Why A is right." }] } },
    LAB: { durationMinutes: 30, lab: { language: "python", starterCode: "def solve():\n    raise NotImplementedError\n", hint: "", tests: [{ name: "solve is defined", code: "assert callable(solve)" }] } },
  };
  await db.lesson.create({ data: { moduleId: mod.id, title, type, order: count, content: "", ...defaults[type] } });
  refresh(mod.courseId, mod.course.slug);
}

export async function updateLessonAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const user = await requirePermission("studio:access");
  const lessonId = String(formData.get("lessonId") ?? "");
  const parsed = lessonSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Check the highlighted fields." };
  const lesson = await ownLesson(user, lessonId);
  const d = parsed.data;

  let quiz: Prisma.InputJsonValue | undefined;
  let lab: Prisma.InputJsonValue | undefined;
  if (d.type === "QUIZ") {
    try {
      quiz = quizSchema.parse(JSON.parse(d.quiz || "{}")) as unknown as Prisma.InputJsonValue;
    } catch (error) {
      return { ok: false, message: error instanceof z.ZodError ? `Quiz: ${error.issues[0]?.message ?? "invalid"}` : "Quiz definition is not valid JSON." };
    }
  }
  if (d.type === "LAB") {
    try {
      lab = labSchema.parse(JSON.parse(d.lab || "{}")) as unknown as Prisma.InputJsonValue;
    } catch (error) {
      return { ok: false, message: error instanceof z.ZodError ? `Lab: ${error.issues[0]?.message ?? "invalid"}` : "Lab definition is not valid JSON." };
    }
  }
  const videoUrl = d.videoUrl?.trim() || null;
  if (videoUrl && !/^(\/media\/|https:\/\/)/.test(videoUrl)) return { ok: false, errors: { videoUrl: ["Use a path under /media/ or an https:// URL."] } };

  await db.lesson.update({
    where: { id: lesson.id },
    data: {
      title: d.title,
      type: d.type,
      durationMinutes: d.durationMinutes,
      content: d.content,
      videoUrl: d.type === "VIDEO" ? videoUrl : null,
      isPreview: d.isPreview === "on",
      quiz: d.type === "QUIZ" ? quiz : undefined,
      lab: d.type === "LAB" ? lab : undefined,
    },
  });
  await audit({ actorId: user.id, action: "lesson.update", entity: "Lesson", entityId: lesson.id });
  refresh(lesson.module.courseId, lesson.module.course.slug);
  return { ok: true, message: "Lesson saved." };
}

export async function deleteLessonAction(formData: FormData) {
  const user = await requirePermission("studio:access");
  const lessonId = String(formData.get("lessonId") ?? "");
  const lesson = await ownLesson(user, lessonId);
  await db.lesson.delete({ where: { id: lesson.id } });
  const remaining = await db.lesson.findMany({ where: { moduleId: lesson.moduleId }, orderBy: { order: "asc" }, select: { id: true } });
  await Promise.all(remaining.map((l, i) => db.lesson.update({ where: { id: l.id }, data: { order: i } })));
  await audit({ actorId: user.id, action: "lesson.delete", entity: "Lesson", entityId: lesson.id });
  refresh(lesson.module.courseId, lesson.module.course.slug);
}

export async function reorderLessonsAction(moduleId: string, orderedIds: string[]) {
  const user = await requirePermission("studio:access");
  const mod = await ownModule(user, moduleId);
  const ids = z.array(z.string()).max(200).parse(orderedIds);
  const lessons = await db.lesson.findMany({ where: { moduleId: mod.id }, select: { id: true } });
  const known = new Set(lessons.map((l) => l.id));
  await db.$transaction(ids.filter((id) => known.has(id)).map((id, i) => db.lesson.update({ where: { id }, data: { order: i } })));
  refresh(mod.courseId, mod.course.slug);
}
