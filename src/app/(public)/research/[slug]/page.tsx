import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLabBySlug } from "@/server/queries/research";
import { Markdown } from "@/components/markdown";
import { PublicationRow } from "@/components/site/cards";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const STATUS: Record<string, { label: string; tone: "success" | "neutral" | "info" }> = {
  ACTIVE: { label: "Active", tone: "success" },
  COMPLETED: { label: "Completed", tone: "neutral" },
  PLANNED: { label: "Planned", tone: "info" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) return { title: "Lab not found" };
  return { title: lab.name, description: lab.tagline, alternates: { canonical: `/research/${lab.slug}` } };
}

export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();

  return (
    <article>
      <header className="border-b border-line bg-bg-deep">
        <div className="container-x grid gap-10 py-14 md:grid-cols-[1.5fr_1fr] md:items-end md:py-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
              <Link href="/research" className="hover:text-ink">Research</Link> <span aria-hidden>/</span> Labs
            </nav>
            <h1 className="mt-6 font-display text-display-lg text-ink">{lab.name}</h1>
            <p className="mt-4 max-w-xl text-lg text-ink-muted">{lab.tagline}</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Focus areas">
              {lab.focusAreas.map((f) => (
                <li key={f}><Badge tone="accent">{f}</Badge></li>
              ))}
            </ul>
          </div>
          {lab.lead ? (
            <Link href={`/faculty/${lab.lead.slug}`} className="flex items-center gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:bg-surface-2">
              <Avatar name={lab.lead.name} src={lab.lead.photoUrl} size="lg" />
              <div>
                <p className="eyebrow">Lab lead</p>
                <p className="mt-1 text-[1.0625rem] font-semibold text-ink">{lab.lead.name}</p>
                <p className="text-sm text-ink-muted">{lab.lead.title}</p>
              </div>
            </Link>
          ) : null}
        </div>
      </header>

      <div className="container-x grid gap-14 py-14 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          <Markdown content={lab.description} />

          <section className="mt-12" aria-labelledby="pubs-title">
            <h2 id="pubs-title" className="eyebrow">Publications</h2>
            {lab.publications.length ? (
              <ol className="mt-2 border-b border-line">
                {lab.publications.map((p) => (
                  <PublicationRow key={p.id} pub={{ ...p, lab: null }} />
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">No publications listed yet.</p>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="projects-title">
            <h2 id="projects-title" className="text-sm font-semibold text-ink">Projects</h2>
            <ul className="mt-3 space-y-4">
              {lab.projects.map((p) => {
                const s = STATUS[p.status] ?? STATUS.ACTIVE!;
                return (
                  <li key={p.id} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[0.9375rem] font-semibold leading-snug text-ink">{p.title}</p>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">{p.summary}</p>
                    <p className="mt-2 text-[0.75rem] text-ink-subtle">
                      {p.status === "PLANNED" ? "Starts" : "Since"} {formatDate(p.startedAt, { month: "short", year: "numeric" })}
                      {p.endedAt ? ` · ended ${formatDate(p.endedAt, { month: "short", year: "numeric" })}` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </article>
  );
}
