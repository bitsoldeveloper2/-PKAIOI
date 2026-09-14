import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { listCourseCategories, listCourses } from "@/server/queries/academy";
import { CourseCard } from "@/components/site/cards";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { CatalogFilters } from "./filters";
import type { CourseLevel } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Course catalog",
  description: "Self-paced and cohort courses across machine learning, language, vision, engineering and AI governance.",
  alternates: { canonical: "/courses" },
};

const LEVELS = new Set<string>(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
const SORTS = new Set<string>(["featured", "newest", "popular", "shortest"]);

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; level?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim().slice(0, 80) || undefined;
  const category = params.category?.slice(0, 60) || undefined;
  const level = params.level && LEVELS.has(params.level) ? (params.level as CourseLevel) : undefined;
  const sort = params.sort && SORTS.has(params.sort) ? (params.sort as "featured" | "newest" | "popular" | "shortest") : "featured";

  const [courses, categories] = await Promise.all([listCourses({ q, category, level, sort }), listCourseCategories()]);

  return (
    <div className="container-x py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Course catalog</p>
        <h1 className="mt-4 font-display text-display-lg text-ink">Every course runs on the campus.</h1>
        <p className="mt-4 text-[1.0625rem] text-ink-muted">
          Lessons, quizzes, browser-based labs and a tutor that has read the syllabus. Take a single course, or follow a program and let the courses come to you.
        </p>
      </header>

      <CatalogFilters categories={categories} current={{ q: q ?? "", category: category ?? "", level: level ?? "", sort }} className="mt-10" />

      <p className="mt-6 text-sm text-ink-muted" role="status" aria-live="polite">
        {courses.length === 0 ? "No courses match these filters." : `${courses.length} ${courses.length === 1 ? "course" : "courses"}`}
        {q ? ` for “${q}”` : ""}
      </p>

      {courses.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={BookOpen}
          title="Nothing here yet"
          description="Try a broader search, clear the filters, or browse a program — new courses are added each intake."
          action={
            <ButtonLink href="/courses" variant="outline">
              Clear filters
            </ButtonLink>
          }
        />
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
