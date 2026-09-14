import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { getStudioCourse } from "@/server/queries/studio";
import { listProgramOptions } from "@/server/queries/academy";
import { setCourseStatusAction } from "@/server/actions/studio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { accentFor } from "@/components/site/cards";
import { CourseBuilder } from "./course-builder";
import { CourseSettingsForm } from "./course-settings-form";

export const metadata: Metadata = { title: "Course builder" };

const STATUS_TONE = { DRAFT: "neutral", REVIEW: "info", PUBLISHED: "success", ARCHIVED: "outline" } as const;

export default async function CourseBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermission("studio:access", `/studio/courses/${id}`);
  const [course, programs] = await Promise.all([getStudioCourse(user, id), listProgramOptions()]);
  if (!course) notFound();
  const accent = accentFor(course.accent);
  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <div className="container-wide py-8 md:py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <span className="mt-1 h-12 w-1.5 shrink-0 rounded-full" style={{ background: accent.bg }} aria-hidden />
          <div>
            <p className="eyebrow">Course builder</p>
            <h1 className="mt-2 font-display text-display-sm text-ink">{course.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <Badge tone={STATUS_TONE[course.status]}>{course.status.toLowerCase()}</Badge>
              <span>{course.modules.length} modules · {lessonCount} lessons · {course._count.enrollments} learners</span>
              {course.status === "PUBLISHED" ? (
                <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1 text-accent hover:underline" target="_blank" rel="noopener">
                  View live <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <form action={setCourseStatusAction} className="flex flex-wrap gap-2">
          <input type="hidden" name="courseId" value={course.id} />
          {course.status !== "PUBLISHED" ? (
            <Button type="submit" name="status" value="PUBLISHED" disabled={lessonCount === 0} title={lessonCount === 0 ? "Add a lesson first" : undefined}>Publish</Button>
          ) : (
            <Button type="submit" name="status" value="DRAFT" variant="outline">Unpublish</Button>
          )}
          {course.status === "DRAFT" ? <Button type="submit" name="status" value="REVIEW" variant="outline">Send for review</Button> : null}
          {course.status !== "ARCHIVED" ? <Button type="submit" name="status" value="ARCHIVED" variant="ghost">Archive</Button> : <Button type="submit" name="status" value="DRAFT" variant="ghost">Restore</Button>}
        </form>
      </header>

      <Tabs
        className="mt-8"
        items={[
          { id: "curriculum", label: "Curriculum", count: lessonCount, content: <CourseBuilder courseId={course.id} modules={course.modules} /> },
          {
            id: "settings",
            label: "Settings",
            content: (
              <CourseSettingsForm
                course={{
                  id: course.id,
                  title: course.title,
                  subtitle: course.subtitle,
                  description: course.description,
                  level: course.level,
                  category: course.category,
                  language: course.language,
                  durationHours: course.durationHours,
                  accent: course.accent,
                  programId: course.programId ?? "",
                  tags: course.tags,
                  learningOutcomes: course.learningOutcomes,
                  prerequisites: course.prerequisites,
                  featured: course.featured,
                }}
                programs={programs.map((p) => ({ id: p.id, title: p.title }))}
                canFeature={user.role === "ADMIN"}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
