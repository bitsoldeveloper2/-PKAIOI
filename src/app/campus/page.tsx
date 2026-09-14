import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, BrainCircuit, CalendarDays, Flame, Megaphone, Sparkles, TerminalSquare } from "lucide-react";
import { requireUser } from "@/server/auth/dal";
import { getCampusDashboard } from "@/server/queries/campus";
import { EnrollmentCard } from "@/components/app/enrollment-card";
import { CourseCard } from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { firstName, formatDateTime, relativeTime } from "@/lib/utils";

function greeting(name: string, hour: number) {
  const first = firstName(name);
  const when = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${when}, ${first}.`;
}

export default async function CampusHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const [user, { welcome }] = await Promise.all([requireUser("/campus"), searchParams]);
  const data = await getCampusDashboard(user.id);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: user.timezone || "Asia/Karachi" }).format(new Date()));
  const active = data.enrollments.filter((e) => e.status === "ACTIVE");
  const continueTarget = active[0];

  return (
    <div className="container-wide py-8 md:py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{data.organisation ? `${data.organisation} · Campus` : "Campus"}</p>
          <h1 className="mt-2 font-display text-display-md text-ink">{welcome ? `Welcome to the campus, ${firstName(user.name)}.` : greeting(user.name, hour)}</h1>
          <p className="mt-2 text-[0.9375rem] text-ink-muted">
            {continueTarget
              ? `You are ${continueTarget.progressPct}% through ${continueTarget.course.title}.`
              : "Pick a course from the catalog to begin — every course runs right here."}
          </p>
        </div>
        {continueTarget?.nextLesson ? (
          <ButtonLink href={`/learn/${continueTarget.course.slug}/${continueTarget.nextLesson.id}` as Route} size="lg">
            Continue learning <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        ) : (
          <ButtonLink href="/courses" size="lg">Browse the catalog</ButtonLink>
        )}
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Active courses", value: data.stats.activeCourses, hint: `${data.enrollments.length - data.stats.activeCourses} completed` },
          { label: "Lessons completed", value: data.stats.completedLessons, hint: "across all courses" },
          { label: "Day streak", value: data.stats.streakDays, hint: data.stats.streakDays > 0 ? "keep it going" : "complete a lesson today", icon: Flame },
          { label: "Minutes this week", value: data.stats.minutesThisWeek, hint: "time in lessons" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
            <dt className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
              {s.icon ? <s.icon className="size-3.5 text-gold" aria-hidden /> : null}
              {s.label}
            </dt>
            <dd className="mt-2 font-display text-3xl tabular text-ink">{s.value}</dd>
            <dd className="mt-0.5 text-xs text-ink-subtle">{s.hint}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="in-progress">
            <div className="flex items-baseline justify-between">
              <h2 id="in-progress" className="font-display text-display-sm text-ink">In progress</h2>
              <Link href="/campus/courses" className="text-sm link">All my courses</Link>
            </div>
            {active.length ? (
              <div className="mt-4 grid gap-4">
                {active.slice(0, 3).map((e) => (
                  <EnrollmentCard key={e.id} enrollment={e} />
                ))}
              </div>
            ) : (
              <EmptyState className="mt-4" icon={Sparkles} title="Nothing in progress" description="Enrol on a course and it will appear here with your next lesson ready." action={<ButtonLink href="/courses" variant="outline">Browse courses</ButtonLink>} />
            )}
          </section>

          <section aria-labelledby="ai-tools">
            <h2 id="ai-tools" className="font-display text-display-sm text-ink">AI on campus</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link href="/campus/tutor" className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:bg-surface-2">
                <BrainCircuit className="size-5 text-accent" aria-hidden />
                <p className="mt-3 text-[1.0625rem] font-semibold text-ink">Tutor</p>
                <p className="mt-1 text-sm text-ink-muted">Ask about any lesson. It asks before it answers, and it has read the syllabus.</p>
                {data.conversations[0] ? <p className="mt-3 text-xs text-ink-subtle">Last: “{data.conversations[0].title}” · {relativeTime(data.conversations[0].updatedAt)}</p> : null}
              </Link>
              <Link href="/campus/lab" className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:bg-surface-2">
                <TerminalSquare className="size-5 text-accent" aria-hidden />
                <p className="mt-3 text-[1.0625rem] font-semibold text-ink">Coding lab</p>
                <p className="mt-1 text-sm text-ink-muted">Python and JavaScript, running in your browser, with an AI reviewer when you want one.</p>
              </Link>
            </div>
          </section>

          {data.recommended.length ? (
            <section aria-labelledby="recommended">
              <h2 id="recommended" className="font-display text-display-sm text-ink">Recommended next</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {data.recommended.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="upcoming">
            <h2 id="upcoming" className="inline-flex items-center gap-2 text-sm font-semibold text-ink"><CalendarDays className="size-4 text-ink-muted" aria-hidden />Upcoming</h2>
            {data.events.length ? (
              <ul className="mt-3 space-y-3">
                {data.events.map((e) => (
                  <li key={e.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">{e.type.toLowerCase()}</p>
                    <p className="mt-0.5 text-sm font-medium text-ink">{e.title}</p>
                    <p className="text-xs text-ink-muted tabular">{formatDateTime(e.startsAt)} · {e.location}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">Nothing scheduled.</p>
            )}
          </section>

          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="announcements">
            <h2 id="announcements" className="inline-flex items-center gap-2 text-sm font-semibold text-ink"><Megaphone className="size-4 text-ink-muted" aria-hidden />Announcements</h2>
            {data.announcements.length ? (
              <ul className="mt-3 space-y-3">
                {data.announcements.map((a) => (
                  <li key={a.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                    <p className="text-sm font-medium text-ink">{a.title}</p>
                    <p className="mt-0.5 text-[0.8125rem] leading-snug text-ink-muted">{a.body}</p>
                    <p className="mt-1 text-xs text-ink-subtle">{a.author.name} · {relativeTime(a.publishedAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">No announcements.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
