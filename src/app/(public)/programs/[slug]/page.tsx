import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, GraduationCap, Wallet } from "lucide-react";
import { getProgramBySlug } from "@/server/queries/academy";
import { CourseCard, levelLabel } from "@/components/site/cards";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatPkr } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Program not found" };
  return {
    title: program.title,
    description: program.tagline,
    alternates: { canonical: `/programs/${program.slug}` },
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: program.title,
    description: program.summary,
    provider: { "@type": "CollegeOrUniversity", name: siteConfig.name, url: siteConfig.url },
    timeToComplete: `P${program.durationWeeks}W`,
    educationalProgramMode: program.format,
    ...(program.tuitionPkr ? { offers: { "@type": "Offer", price: program.tuitionPkr, priceCurrency: "PKR" } } : {}),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-line bg-bg-deep">
        <div className="container-x grid gap-10 py-14 md:grid-cols-[1.5fr_1fr] md:py-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
              <ol className="flex flex-wrap gap-2">
                <li><Link href="/programs" className="hover:text-ink">Programs</Link></li>
                <li aria-hidden>/</li>
                <li>{levelLabel(program.level)}</li>
              </ol>
            </nav>
            <h1 className="mt-6 font-display text-display-lg text-ink">{program.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-ink-muted">{program.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/apply?program=${program.slug}` as "/apply"} size="lg">
                Apply to this program
              </ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="outline">
                Talk to admissions
              </ButtonLink>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 self-end">
            {[
              { icon: Clock, label: "Duration", value: `${program.durationWeeks} weeks` },
              { icon: GraduationCap, label: "Format", value: program.format },
              { icon: Wallet, label: "Tuition", value: program.tuitionPkr ? formatPkr(program.tuitionPkr) : "Fully funded" },
              { icon: CalendarDays, label: "Intake", value: program.admissions.intake ?? "See admissions" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-line bg-surface p-4">
                <dt className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted"><f.icon className="size-3.5" aria-hidden />{f.label}</dt>
                <dd className="mt-2 text-[0.9375rem] font-medium text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="container-x grid gap-14 py-14 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <section aria-labelledby="overview-title">
            <h2 id="overview-title" className="eyebrow">Overview</h2>
            <Markdown content={program.description} className="mt-4" />
          </section>

          <section className="mt-12" aria-labelledby="outcomes-title">
            <h2 id="outcomes-title" className="eyebrow">Outcomes</h2>
            <ul className="mt-4 space-y-3">
              {program.outcomes.map((o) => (
                <li key={o} className="flex gap-3 text-[1.0625rem] text-ink">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="curriculum-title">
            <h2 id="curriculum-title" className="eyebrow">Curriculum</h2>
            <ol className="mt-4 space-y-3">
              {program.curriculum.map((block, i) => (
                <li key={block.title} className="rounded-xl border border-line bg-surface p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-lg text-ink-subtle tabular">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-[1.0625rem] font-semibold text-ink">{block.title}</h3>
                  </div>
                  <ul className="mt-3 grid gap-1.5 pl-9 text-[0.9375rem] text-ink-muted sm:grid-cols-2">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-2"><span aria-hidden>·</span>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          {program.courses.length ? (
            <section className="mt-12" aria-labelledby="courses-title">
              <h2 id="courses-title" className="eyebrow">Courses in this program</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {program.courses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="adm-title">
            <h2 id="adm-title" className="text-sm font-semibold text-ink">Admissions</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div><dt className="text-ink-muted">Intake</dt><dd className="mt-0.5 font-medium text-ink">{program.admissions.intake}</dd></div>
              <div><dt className="text-ink-muted">Deadline</dt><dd className="mt-0.5 font-medium text-ink">{program.admissions.deadline}</dd></div>
            </dl>
            <h3 className="mt-5 text-sm font-semibold text-ink">Requirements</h3>
            <ul className="mt-2 space-y-2 text-sm text-ink-muted">
              {(program.admissions.requirements ?? []).map((r) => (
                <li key={r} className="flex gap-2"><span aria-hidden>·</span>{r}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-2">
              <ButtonLink href={`/apply?program=${program.slug}` as "/apply"}>Apply now</ButtonLink>
              <Badge tone="gold" className="justify-center">Scholarships available</Badge>
            </div>
          </section>
        </aside>
      </div>
    </article>
  );
}
