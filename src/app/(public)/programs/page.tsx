import type { Metadata } from "next";
import { listPrograms } from "@/server/queries/academy";
import { ProgramRow } from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Programs",
  description: "Diplomas, certificates, executive education, one- and three-month short courses in AI and digital media marketing, and a funded research fellowship at the Pakistan Institute of AI.",
  alternates: { canonical: "/programs" },
};

export default async function ProgramsPage() {
  const programs = await listPrograms();

  return (
    <div className="container-x py-12 md:py-16">
      <header className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="eyebrow">Programs</p>
          <h1 className="mt-4 font-display text-display-lg text-ink">Structured paths, defended work.</h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-ink-muted">
            Every program is cohort-based and project-heavy. You finish with systems you built, reviewed by faculty and an industry examiner — not with a slide deck. Short courses in AI and digital media marketing run every month in one- and three-month formats.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <ButtonLink href="/apply">Start an application</ButtonLink>
          <ButtonLink href="/admissions" variant="outline">
            Admissions guide
          </ButtonLink>
        </div>
      </header>

      <ol className="mt-14 border-b border-line">
        {programs.map((p, i) => (
          <ProgramRow key={p.id} program={p} index={i} />
        ))}
      </ol>

      <section className="mt-20 grid gap-6 rounded-2xl border border-line bg-surface p-8 md:grid-cols-3 md:p-10" aria-labelledby="how-title">
        <div>
          <h2 id="how-title" className="font-display text-display-sm text-ink">How programs are taught</h2>
        </div>
        {[
          { title: "Studios, not lectures", body: "Each program is a sequence of studios. A studio pairs a concept with a lab that breaks something on purpose, and ends in a defended project." },
          { title: "Faculty who still ship", body: "Instructors run the labs whose research informs the course, and many hold appointments in industry. Office hours are real and weekly." },
          { title: "Judged by evidence", body: "Rubrics weight validation and honesty above raw performance. Capstones are defended in front of an examiner whose first question is always: how do you know?" },
        ].map((item) => (
          <div key={item.title}>
            <h3 className="text-[1.0625rem] font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-[0.9375rem] text-ink-muted">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
