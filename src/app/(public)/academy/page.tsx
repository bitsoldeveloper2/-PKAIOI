import type { Metadata } from "next";
import { getAcademyStats, getFeaturedCourses, listPrograms } from "@/server/queries/academy";
import { listUpcomingEvents } from "@/server/queries/cms";
import { CourseCard, ProgramRow } from "@/components/site/cards";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Academy",
  description: "Programs, courses and admissions at the Pakistan Institute of AI academy.",
  alternates: { canonical: "/academy" },
};

export default async function AcademyPage() {
  const [programs, courses, stats, events] = await Promise.all([listPrograms(), getFeaturedCourses(3), getAcademyStats(), listUpcomingEvents(4)]);

  return (
    <div>
      <header className="container-x grid gap-10 py-16 md:grid-cols-[1.3fr_1fr] md:items-end md:py-24">
        <div>
          <p className="eyebrow">The Academy</p>
          <h1 className="mt-4 font-display text-display-lg text-ink">Learn the way the field actually works.</h1>
          <p className="mt-5 max-w-xl text-[1.0625rem] text-ink-muted">
            Studios instead of lectures, evaluation before demos, and faculty who still ship. Choose a structured program or start with a single course on the campus.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/programs" size="lg">Programs</ButtonLink>
            <ButtonLink href="/courses" size="lg" variant="outline">Course catalog</ButtonLink>
            <ButtonLink href="/admissions" size="lg" variant="ghost">Admissions</ButtonLink>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-4">
          {[
            { label: "Programs", value: stats.programs },
            { label: "Courses", value: stats.courses },
            { label: "Faculty", value: stats.faculty },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
              <dt className="eyebrow">{s.label}</dt>
              <dd className="mt-2 font-display text-3xl tabular text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="border-y border-line bg-bg-deep py-20" aria-labelledby="ac-programs">
        <div className="container-x">
          <SectionHeading eyebrow="Programs" title={<span id="ac-programs">Structured paths.</span>} action={<ButtonLink href="/programs" variant="outline">All programs</ButtonLink>} />
          <ol className="mt-8 border-b border-line">
            {programs.map((p, i) => (
              <ProgramRow key={p.id} program={p} index={i} />
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-20" aria-labelledby="ac-courses">
        <SectionHeading eyebrow="Courses" title={<span id="ac-courses">Start with one course.</span>} action={<ButtonLink href="/courses" variant="outline">Browse the catalog</ButtonLink>} />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {events.length ? (
        <section className="container-x pb-20" aria-labelledby="ac-events">
          <SectionHeading eyebrow="On campus" title={<span id="ac-events">Coming up.</span>} size="sm" />
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {events.map((e) => (
              <li key={e.id} className="rounded-xl border border-line bg-surface p-5">
                <p className="eyebrow">{e.type.toLowerCase()}</p>
                <p className="mt-2 text-[1.0625rem] font-semibold text-ink">{e.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{e.description}</p>
                <p className="mt-3 text-sm text-ink-muted tabular">{formatDateTime(e.startsAt)} · {e.location}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
