import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedPublications, getResearchStats, listLabs } from "@/server/queries/research";
import { PublicationRow } from "@/components/site/cards";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Research",
  description: "Five labs working on language, perception, safety, systems and health — with a bias toward problems that matter in Pakistan and the region.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage() {
  const [labs, publications, stats] = await Promise.all([listLabs(), getFeaturedPublications(4), getResearchStats()]);

  return (
    <div>
      <header className="container-x grid gap-10 py-16 md:grid-cols-[1.3fr_1fr] md:items-end md:py-24">
        <div>
          <p className="eyebrow">Research</p>
          <h1 className="mt-4 font-display text-display-lg text-ink">Problems that matter here.</h1>
          <p className="mt-5 max-w-xl text-[1.0625rem] text-ink-muted">
            Urdu-language models, vision on sub-$50 hardware, evaluation standards for public deployment. Our labs work on what benchmarks ignore, and publish where it counts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/research/publications" size="lg">Publications</ButtonLink>
            <ButtonLink href="/faculty" size="lg" variant="outline">Faculty</ButtonLink>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-4">
          {[
            { label: "Labs", value: stats.labs },
            { label: "Publications", value: stats.publications },
            { label: "Active projects", value: stats.activeProjects },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
              <dt className="eyebrow">{s.label}</dt>
              <dd className="mt-2 font-display text-3xl tabular text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="border-y border-line bg-bg-deep py-20" aria-labelledby="labs-title">
        <div className="container-x">
          <SectionHeading eyebrow="Labs" title={<span id="labs-title">Five labs, one agenda.</span>} />
          <ol className="mt-10 grid gap-4 md:grid-cols-2">
            {labs.map((lab, i) => (
              <li key={lab.id}>
                <Link href={`/research/${lab.slug}`} className="group flex h-full flex-col rounded-xl border border-line bg-surface p-6 transition-[transform,box-shadow,border-color] duration-300 ease-out-quart hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-display text-lg text-ink-subtle tabular">{String(i + 1).padStart(2, "0")}</span>
                    <ArrowUpRight className="size-4 text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-display-sm text-ink">{lab.name}</h3>
                  <p className="mt-2 text-[0.9375rem] text-ink-muted">{lab.tagline}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {lab.focusAreas.slice(0, 3).map((f) => (
                      <li key={f} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.75rem] text-ink-muted">{f}</li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm text-ink-muted">
                    {lab.lead ? (
                      <span className="inline-flex items-center gap-2"><Avatar name={lab.lead.name} src={lab.lead.photoUrl} size="xs" />{lab.lead.name}</span>
                    ) : <span />}
                    <span className="tabular">{lab._count.publications} publications · {lab._count.projects} projects</span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-20" aria-labelledby="pubs-title">
        <SectionHeading eyebrow="Selected work" title={<span id="pubs-title">Recent publications.</span>} action={<ButtonLink href="/research/publications" variant="outline">All publications</ButtonLink>} />
        <ol className="mt-6 border-b border-line">
          {publications.map((p) => (
            <PublicationRow key={p.id} pub={p} />
          ))}
        </ol>
      </section>
    </div>
  );
}
