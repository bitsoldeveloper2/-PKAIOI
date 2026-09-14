import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import type { CourseLevel } from "@/generated/prisma/enums";

export type CourseCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  level: CourseLevel;
  category: string;
  durationHours: number;
  accent: string;
  thumbnailUrl: string | null;
  featured: boolean;
  tags: string[];
  instructor: { name: string; avatarUrl: string | null };
  program: { slug: string; title: string } | null;
  lessonCount: number;
  moduleCount: number;
  enrollmentCount: number;
};

const courseCardSelect = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  level: true,
  category: true,
  durationHours: true,
  accent: true,
  thumbnailUrl: true,
  featured: true,
  tags: true,
  instructor: { select: { name: true, avatarUrl: true } },
  program: { select: { slug: true, title: true } },
  modules: { select: { _count: { select: { lessons: true } } } },
  _count: { select: { enrollments: true } },
} as const;

type RawCard = {
  id: string; slug: string; title: string; subtitle: string; level: CourseLevel; category: string; durationHours: number;
  accent: string; thumbnailUrl: string | null; featured: boolean; tags: unknown;
  instructor: { name: string; avatarUrl: string | null };
  program: { slug: string; title: string } | null;
  modules: { _count: { lessons: number } }[];
  _count: { enrollments: number };
};

function toCard(c: RawCard): CourseCard {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    level: c.level,
    category: c.category,
    durationHours: c.durationHours,
    accent: c.accent,
    thumbnailUrl: c.thumbnailUrl,
    featured: c.featured,
    tags: Array.isArray(c.tags) ? (c.tags as string[]) : [],
    instructor: c.instructor,
    program: c.program,
    lessonCount: c.modules.reduce((n, m) => n + m._count.lessons, 0),
    moduleCount: c.modules.length,
    enrollmentCount: c._count.enrollments,
  };
}

export type CourseFilters = {
  q?: string;
  category?: string;
  level?: CourseLevel;
  sort?: "featured" | "newest" | "popular" | "shortest";
};

export const listCourses = cache(async (filters: CourseFilters = {}): Promise<CourseCard[]> => {
  const { q, category, level, sort = "featured" } = filters;
  const courses = await db.course.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(level ? { level } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { subtitle: { contains: q } },
              { category: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    select: courseCardSelect,
    orderBy:
      sort === "newest"
        ? [{ publishedAt: "desc" }]
        : sort === "popular"
          ? [{ enrollments: { _count: "desc" } }]
          : sort === "shortest"
            ? [{ durationHours: "asc" }]
            : [{ featured: "desc" }, { publishedAt: "desc" }],
  });
  return courses.map(toCard);
});

export const getFeaturedCourses = cache(async (limit = 3): Promise<CourseCard[]> => {
  const courses = await db.course.findMany({
    where: { status: "PUBLISHED", featured: true },
    select: courseCardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return courses.map(toCard);
});

export const listCourseCategories = cache(async () => {
  const rows = await db.course.groupBy({
    by: ["category"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
    orderBy: { category: "asc" },
  });
  return rows.map((r) => ({ category: r.category, count: r._count._all }));
});

export const getCourseBySlug = cache(async (slug: string) => {
  const course = await db.course.findFirst({
    where: { slug, status: "PUBLISHED" },
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
      thumbnailUrl: true,
      featured: true,
      tags: true,
      learningOutcomes: true,
      prerequisites: true,
      publishedAt: true,
      updatedAt: true,
      instructor: {
        select: { id: true, name: true, headline: true, avatarUrl: true, bio: true, facultyProfile: { select: { slug: true, title: true } } },
      },
      program: { select: { slug: true, title: true, level: true } },
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          summary: true,
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, type: true, durationMinutes: true, isPreview: true },
          },
        },
      },
      _count: { select: { enrollments: true, certificates: true } },
    },
  });
  if (!course) return null;
  const lessons = course.modules.flatMap((m) => m.lessons);
  return {
    ...course,
    tags: Array.isArray(course.tags) ? (course.tags as string[]) : [],
    learningOutcomes: Array.isArray(course.learningOutcomes) ? (course.learningOutcomes as string[]) : [],
    prerequisites: Array.isArray(course.prerequisites) ? (course.prerequisites as string[]) : [],
    lessonCount: lessons.length,
    totalMinutes: lessons.reduce((n, l) => n + l.durationMinutes, 0),
    firstLessonId: lessons[0]?.id ?? null,
  };
});

export type ProgramSummary = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  level: string;
  format: string;
  durationWeeks: number;
  tuitionPkr: number | null;
  summary: string;
  featured: boolean;
  imageUrl: string | null;
  courseCount: number;
};

export const listPrograms = cache(async (): Promise<ProgramSummary[]> => {
  const programs = await db.program.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      tagline: true,
      level: true,
      format: true,
      durationWeeks: true,
      tuitionPkr: true,
      summary: true,
      featured: true,
      imageUrl: true,
      _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
    },
  });
  return programs.map(({ _count, ...p }) => ({ ...p, courseCount: _count.courses }));
});

export const getProgramBySlug = cache(async (slug: string) => {
  const program = await db.program.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      tagline: true,
      level: true,
      format: true,
      durationWeeks: true,
      tuitionPkr: true,
      summary: true,
      description: true,
      outcomes: true,
      curriculum: true,
      admissions: true,
      imageUrl: true,
      courses: { where: { status: "PUBLISHED" }, select: courseCardSelect, orderBy: { publishedAt: "asc" } },
    },
  });
  if (!program) return null;
  const curriculum = Array.isArray(program.curriculum)
    ? (program.curriculum as { title: string; items: string[] }[])
    : [];
  const admissions = (program.admissions ?? {}) as { intake?: string; deadline?: string; requirements?: string[] };
  return {
    ...program,
    outcomes: Array.isArray(program.outcomes) ? (program.outcomes as string[]) : [],
    curriculum,
    admissions,
    courses: program.courses.map(toCard),
  };
});

export const listProgramOptions = cache(async () =>
  db.program.findMany({ where: { published: true }, orderBy: { order: "asc" }, select: { id: true, title: true, level: true, slug: true } }),
);

export const getAcademyStats = cache(async () => {
  const [courses, programs, learners, faculty, certificates] = await Promise.all([
    db.course.count({ where: { status: "PUBLISHED" } }),
    db.program.count({ where: { published: true } }),
    db.user.count({ where: { role: "STUDENT" } }),
    db.faculty.count(),
    db.certificate.count({ where: { revokedAt: null } }),
  ]);
  return { courses, programs, learners, faculty, certificates };
});
