import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Award, CheckCircle2 } from "lucide-react";
import type { EnrollmentCard as EnrollmentCardData } from "@/server/queries/campus";
import { accentFor, levelLabel } from "@/components/site/cards";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LESSON_LABEL: Record<string, string> = { VIDEO: "Watch", ARTICLE: "Read", QUIZ: "Quiz", LAB: "Lab" };

export function EnrollmentCard({ enrollment, compact }: { enrollment: EnrollmentCardData; compact?: boolean }) {
  const accent = accentFor(enrollment.course.accent);
  const done = enrollment.status === "COMPLETED";
  const href = (
    enrollment.nextLesson ? `/learn/${enrollment.course.slug}/${enrollment.nextLesson.id}` : `/courses/${enrollment.course.slug}`
  ) as Route;

  return (
    <article className={cn("group relative flex overflow-hidden rounded-xl border border-line bg-surface transition-[transform,box-shadow,border-color] duration-300 ease-out-quart hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift", compact ? "flex-row" : "flex-col sm:flex-row")}>
      <div className={cn("relative shrink-0", compact ? "w-2" : "h-2 sm:h-auto sm:w-2.5")} style={{ background: accent.bg }} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">{enrollment.course.category} · {levelLabel(enrollment.course.level)}</p>
            <h3 className="mt-1 truncate font-display text-[1.375rem] leading-tight text-ink">{enrollment.course.title}</h3>
            {!compact ? <p className="mt-1 text-sm text-ink-muted">{enrollment.course.subtitle}</p> : null}
          </div>
          {done ? <Badge tone="gold"><Award className="size-3" aria-hidden />Completed</Badge> : null}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={enrollment.progressPct} label={`${enrollment.course.title} progress`} tone={done ? "gold" : "accent"} className="flex-1" />
          <span className="text-xs tabular text-ink-muted">{enrollment.completedLessons}/{enrollment.totalLessons}</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          {done ? (
            <span className="inline-flex items-center gap-1.5 text-ink-muted"><CheckCircle2 className="size-4 text-success" aria-hidden />All lessons complete</span>
          ) : enrollment.nextLesson ? (
            <span className="truncate text-ink-muted">
              Next: <span className="text-ink">{LESSON_LABEL[enrollment.nextLesson.type] ?? "Open"} · {enrollment.nextLesson.title}</span>
            </span>
          ) : (
            <span className="text-ink-muted">Course has no lessons yet</span>
          )}
          <span className="inline-flex shrink-0 items-center gap-1 font-medium text-accent">
            {done ? "Review" : enrollment.progressPct > 0 ? "Continue" : "Start"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
      <Link href={href} className="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label={`${done ? "Review" : "Continue"} ${enrollment.course.title}`} />
    </article>
  );
}
