import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, BookOpen, Plus } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { getStudioOverview } from "@/server/queries/studio";
import { PageHeader } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress";
import { accentFor } from "@/components/site/cards";
import { firstName, relativeTime } from "@/lib/utils";

const STATUS_TONE = { DRAFT: "neutral", REVIEW: "info", PUBLISHED: "success", ARCHIVED: "outline" } as const;

export default async function StudioHome() {
  const user = await requirePermission("studio:access", "/studio");
  const data = await getStudioOverview(user);

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader
        eyebrow="Instructor studio"
        title={`Good to see you, ${firstName(user.name)}.`}
        lede="Your courses, your learners and what they did this week."
        actions={<ButtonLink href="/studio/courses"><Plus className="size-4" aria-hidden />New course</ButtonLink>}
      />

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Published courses", value: data.totals.published, hint: `${data.courses.length} total` },
          { label: "Learners", value: data.totals.learners, hint: `${data.totals.activeLearners7d} active this week` },
          { label: "Completions", value: data.totals.completions, hint: "certificates issued" },
          { label: "Avg quiz score", value: data.totals.avgQuizPct != null ? `${data.totals.avgQuizPct}%` : "—", hint: `${data.totals.quizAttempts} attempts` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">{s.label}</dt>
            <dd className="mt-2 font-display text-3xl tabular text-ink">{s.value}</dd>
            <dd className="mt-0.5 text-xs text-ink-subtle">{s.hint}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="courses-title">
          <div className="flex items-baseline justify-between">
            <h2 id="courses-title" className="font-display text-display-sm text-ink">Courses</h2>
            <Link href="/studio/courses" className="text-sm link">Manage all</Link>
          </div>
          {data.courses.length === 0 ? (
            <EmptyState className="mt-4" icon={BookOpen} title="No courses yet" description="Create your first course and build the curriculum module by module." action={<ButtonLink href="/studio/courses">Create a course</ButtonLink>} />
          ) : (
            <ul className="mt-4 grid gap-3">
              {data.courses.slice(0, 6).map((c) => {
                const accent = accentFor(c.accent);
                return (
                  <li key={c.id} className="group relative flex gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2">
                    <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full" style={{ background: accent.bg }} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[1.0625rem] font-semibold text-ink">
                          <Link href={`/studio/courses/${c.id}` as Route} className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                            <span className="absolute inset-0" aria-hidden />
                            {c.title}
                          </Link>
                        </h3>
                        <Badge tone={STATUS_TONE[c.status]}>{c.status.toLowerCase()}</Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-ink-muted">{c.moduleCount} modules · {c.lessonCount} lessons · {c.learners} learners · updated {relativeTime(c.updatedAt)}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <ProgressBar value={c.completionRate} label={`${c.title} completion rate`} size="sm" className="max-w-xs" />
                        <span className="text-xs tabular text-ink-muted">{c.completionRate}% complete</span>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside>
          <h2 className="font-display text-display-sm text-ink">Recent activity</h2>
          {data.activity.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No learner activity yet.</p>
          ) : (
            <ol className="mt-4 space-y-3 rounded-xl border border-line bg-surface p-4">
              {data.activity.map((a, i) => (
                <li key={i} className="border-t border-line pt-3 text-sm first:border-t-0 first:pt-0">
                  <p className="text-ink"><span className="font-medium">{a.learner}</span> {a.detail}</p>
                  <p className="text-xs text-ink-muted">{a.course} · {relativeTime(a.at)}</p>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </div>
  );
}
