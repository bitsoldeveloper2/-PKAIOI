import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, FileText, FlaskConical, HelpCircle, Layers, Lock, PlayCircle, Users } from "lucide-react";
import { getCourseBySlug } from "@/server/queries/academy";
import { getCurrentUser } from "@/server/auth/dal";
import { db } from "@/server/db";
import { enrollAction } from "@/server/actions/campus";
import { accentFor, levelLabel } from "@/components/site/cards";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatDate, formatDuration } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

const LESSON_ICON = { VIDEO: PlayCircle, ARTICLE: FileText, QUIZ: HelpCircle, LAB: FlaskConical } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course not found" };
  return {
    title: course.title,
    description: course.subtitle,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: { title: course.title, description: course.subtitle, type: "article" },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [course, user] = await Promise.all([getCourseBySlug(slug), getCurrentUser()]);
  if (!course) notFound();

  const enrollment = user
    ? await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, select: { status: true, lastLessonId: true, progressPct: true } })
    : null;
  const accent = accentFor(course.accent);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.subtitle,
    provider: { "@type": "CollegeOrUniversity", name: siteConfig.name, url: siteConfig.url },
    educationalLevel: levelLabel(course.level),
    inLanguage: "en",
    timeRequired: `PT${course.durationHours}H`,
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `PT${course.durationHours}H` },
  };

  const continueHref = enrollment?.lastLessonId ? `/learn/${course.slug}/${enrollment.lastLessonId}` : course.firstLessonId ? `/learn/${course.slug}/${course.firstLessonId}` : "/campus";

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="relative overflow-hidden" style={{ background: accent.bg, color: accent.fg }}>
        <div className="grain absolute inset-0" aria-hidden />
        <div className="container-x relative grid gap-10 py-14 md:grid-cols-[1.5fr_1fr] md:py-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-[0.8125rem] opacity-90">
              <ol className="flex flex-wrap gap-2">
                <li><Link href="/courses" className="hover:underline">Catalog</Link></li>
                <li aria-hidden>/</li>
                <li>{course.category}</li>
              </ol>
            </nav>
            <h1 className="mt-6 font-display text-display-lg">{course.title}</h1>
            <p className="mt-4 max-w-xl text-lg opacity-95">{course.subtitle}</p>
            <div className="mt-8 flex items-center gap-3">
              <Avatar name={course.instructor.name} src={course.instructor.avatarUrl} size="md" />
              <div className="text-sm">
                <p className="font-semibold">
                  {course.instructor.facultyProfile ? (
                    <Link href={`/faculty/${course.instructor.facultyProfile.slug}`} className="hover:underline">{course.instructor.name}</Link>
                  ) : (
                    course.instructor.name
                  )}
                </p>
                <p className="opacity-90">{course.instructor.headline}</p>
              </div>
            </div>
          </div>

          <aside className="self-end rounded-xl border border-white/15 bg-black/20 p-6 backdrop-blur-sm">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div><dt className="text-[0.6875rem] font-semibold uppercase tracking-wider opacity-90">Level</dt><dd className="mt-1 font-medium">{levelLabel(course.level)}</dd></div>
              <div><dt className="text-[0.6875rem] font-semibold uppercase tracking-wider opacity-90">Effort</dt><dd className="mt-1 font-medium">{course.durationHours} hours</dd></div>
              <div><dt className="text-[0.6875rem] font-semibold uppercase tracking-wider opacity-90">Curriculum</dt><dd className="mt-1 font-medium">{course.modules.length} modules · {course.lessonCount} lessons</dd></div>
              <div><dt className="text-[0.6875rem] font-semibold uppercase tracking-wider opacity-90">Language</dt><dd className="mt-1 font-medium">{course.language}</dd></div>
              {course.program ? (
                <div className="col-span-2"><dt className="text-[0.6875rem] font-semibold uppercase tracking-wider opacity-90">Part of</dt><dd className="mt-1 font-medium"><Link href={`/programs/${course.program.slug}`} className="underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white">{course.program.title}</Link></dd></div>
              ) : null}
            </dl>
            <div className="mt-6">
              {enrollment ? (
                <ButtonLink href={continueHref as "/campus"} variant="inverse" size="lg" className="w-full">
                  {enrollment.status === "COMPLETED" ? "Review the course" : enrollment.progressPct > 0 ? `Continue · ${enrollment.progressPct}%` : "Start learning"}
                </ButtonLink>
              ) : (
                <form action={enrollAction}>
                  <input type="hidden" name="slug" value={course.slug} />
                  <Button type="submit" variant="inverse" size="lg" className="w-full">
                    {user ? "Enrol — free for members" : "Sign in to enrol"}
                  </Button>
                </form>
              )}
              <p className="mt-3 text-center text-[0.75rem] opacity-90">
                {course._count.enrollments} enrolled · {course._count.certificates} certificates issued
              </p>
            </div>
          </aside>
        </div>
      </header>

      <div className="container-x grid gap-14 py-14 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <section aria-labelledby="about-title">
            <h2 id="about-title" className="eyebrow">About this course</h2>
            <Markdown content={course.description} className="mt-4" />
          </section>

          <section className="mt-12" aria-labelledby="outcomes-title">
            <h2 id="outcomes-title" className="eyebrow">What you will be able to do</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {course.learningOutcomes.map((o) => (
                <li key={o} className="flex gap-3 rounded-lg border border-line bg-surface p-4 text-[0.9375rem] text-ink">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="curriculum-title">
            <div className="flex items-baseline justify-between">
              <h2 id="curriculum-title" className="eyebrow">Curriculum</h2>
              <p className="text-sm text-ink-muted tabular">{course.lessonCount} lessons · {formatDuration(course.totalMinutes)}</p>
            </div>
            <ol className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
              {course.modules.map((m, mi) => (
                <li key={m.id} className="p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-lg text-ink-subtle tabular">{String(mi + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-[1.0625rem] font-semibold text-ink">{m.title}</h3>
                      {m.summary ? <p className="mt-0.5 text-sm text-ink-muted">{m.summary}</p> : null}
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1">
                    {m.lessons.map((l) => {
                      const Icon = LESSON_ICON[l.type];
                      const open = enrollment || l.isPreview;
                      const row = (
                        <>
                          <Icon className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                          <span className="flex-1 text-[0.9375rem] text-ink">{l.title}</span>
                          {l.isPreview && !enrollment ? <Badge tone="accent">Preview</Badge> : null}
                          <span className="inline-flex items-center gap-1 text-[0.8125rem] text-ink-muted tabular"><Clock className="size-3.5" aria-hidden />{l.durationMinutes} min</span>
                          {!open ? <Lock className="size-3.5 text-ink-subtle" aria-label="Enrol to unlock" /> : null}
                        </>
                      );
                      return (
                        <li key={l.id}>
                          {open ? (
                            <Link href={`/learn/${course.slug}/${l.id}`} className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-2">
                              {row}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3 px-2 py-2 opacity-90">{row}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="prereq-title">
            <h2 id="prereq-title" className="text-sm font-semibold text-ink">Prerequisites</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {course.prerequisites.map((p) => (
                <li key={p} className="flex gap-2"><span aria-hidden>·</span>{p}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="facts-title">
            <h2 id="facts-title" className="text-sm font-semibold text-ink">At a glance</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3"><dt className="inline-flex items-center gap-2 text-ink-muted"><Layers className="size-4" aria-hidden />Modules</dt><dd className="tabular text-ink">{course.modules.length}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="inline-flex items-center gap-2 text-ink-muted"><Users className="size-4" aria-hidden />Enrolled</dt><dd className="tabular text-ink">{course._count.enrollments}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="inline-flex items-center gap-2 text-ink-muted"><Clock className="size-4" aria-hidden />Updated</dt><dd className="text-ink">{formatDate(course.updatedAt)}</dd></div>
            </dl>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Topics">
              {course.tags.map((t) => (
                <li key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.75rem] text-ink-muted">{t}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="cert-title">
            <h2 id="cert-title" className="text-sm font-semibold text-ink">Certificate</h2>
            <p className="mt-2 text-sm text-ink-muted">Complete every lesson, pass each quiz at 70% and finish the labs to earn a verifiable certificate with a public code.</p>
            <Link href="/verify" className="mt-3 inline-block text-sm link">How verification works</Link>
          </section>
        </aside>
      </div>
    </article>
  );
}
