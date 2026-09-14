import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ExternalLink } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { listStudioCourses } from "@/server/queries/studio";
import { PageHeader } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { accentFor, levelLabel } from "@/components/site/cards";
import { formatDate } from "@/lib/utils";
import { NewCourseForm } from "./new-course-form";

export const metadata: Metadata = { title: "Courses" };

const STATUS_TONE = { DRAFT: "neutral", REVIEW: "info", PUBLISHED: "success", ARCHIVED: "outline" } as const;

export default async function StudioCoursesPage() {
  const user = await requirePermission("studio:access", "/studio/courses");
  const courses = await listStudioCourses(user);

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Studio" title="Courses" lede="Draft, review, publish. Drafts are invisible to learners until you publish them." actions={<NewCourseForm />} />

      <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[52rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Curriculum</th>
              <th className="px-4 py-3 text-right">Learners</th>
              <th className="px-4 py-3 text-right">Completion</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-muted">No courses yet — create one to start building.</td></tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="size-2.5 rounded-full" style={{ background: accentFor(c.accent).bg }} aria-hidden />
                      <div className="min-w-0">
                        <Link href={`/studio/courses/${c.id}` as Route} className="font-medium text-ink hover:text-accent">{c.title}</Link>
                        <p className="text-xs text-ink-muted">{c.category} · {levelLabel(c.level)}{user.role === "ADMIN" ? ` · ${c.instructor.name}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[c.status]}>{c.status.toLowerCase()}</Badge></td>
                  <td className="px-4 py-3 tabular text-ink-muted">{c.moduleCount} modules · {c.lessonCount} lessons</td>
                  <td className="px-4 py-3 text-right tabular text-ink">{c.learners}</td>
                  <td className="px-4 py-3 text-right tabular text-ink">{c.completionRate}%</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(c.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {c.status === "PUBLISHED" ? (
                      <Link href={`/courses/${c.slug}`} className="inline-flex items-center gap-1 text-accent hover:underline" target="_blank" rel="noopener">
                        View <ExternalLink className="size-3.5" aria-hidden />
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
