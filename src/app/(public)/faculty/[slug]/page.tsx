import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getFacultyBySlug } from "@/server/queries/research";
import { Markdown } from "@/components/markdown";
import { accentFor, levelLabel } from "@/components/site/cards";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const member = await getFacultyBySlug(slug);
  if (!member) return { title: "Faculty member not found" };
  return { title: member.name, description: `${member.title} at the Pakistan Institute of AI.`, alternates: { canonical: `/faculty/${member.slug}` } };
}

export default async function FacultyMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await getFacultyBySlug(slug);
  if (!member) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.title,
    worksFor: { "@type": "CollegeOrUniversity", name: siteConfig.name },
    knowsAbout: member.expertise,
    url: `${siteConfig.url}/faculty/${member.slug}`,
  };

  return (
    <article className="container-x py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/faculty" className="hover:text-ink">Faculty</Link> <span aria-hidden>/</span> {member.department}
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-6">
          <Avatar name={member.name} src={member.photoUrl} size="xl" className="size-40 text-4xl" />
          <div>
            <h1 className="font-display text-display-sm text-ink">{member.name}</h1>
            <p className="mt-2 text-[0.9375rem] text-ink-muted">{member.title}</p>
            <Badge tone="accent" className="mt-3">{member.department}</Badge>
          </div>
          <div>
            <p className="eyebrow">Expertise</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {member.expertise.map((e) => (
                <li key={e} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.8125rem] text-ink-muted">{e}</li>
              ))}
            </ul>
          </div>
          {member.links.length ? (
            <div>
              <p className="eyebrow">Links</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {member.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 link">
                      {l.label} <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>

        <div className="min-w-0">
          <Markdown content={member.bio} />

          {member.labsLed.length ? (
            <section className="mt-12" aria-labelledby="labs-title">
              <h2 id="labs-title" className="eyebrow">Leads</h2>
              <ul className="mt-4 space-y-3">
                {member.labsLed.map((lab) => (
                  <li key={lab.slug}>
                    <Link href={`/research/${lab.slug}`} className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:bg-surface-2">
                      <span>
                        <span className="block text-[1.0625rem] font-semibold text-ink">{lab.name}</span>
                        <span className="block text-sm text-ink-muted">{lab.tagline}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {member.courses.length ? (
            <section className="mt-12" aria-labelledby="teaches-title">
              <h2 id="teaches-title" className="eyebrow">Teaches</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {member.courses.map((c) => {
                  const accent = accentFor(c.accent);
                  return (
                    <li key={c.slug}>
                      <Link href={`/courses/${c.slug}`} className="group flex gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2">
                        <span className="mt-1 size-3 shrink-0 rounded-full" style={{ background: accent.bg }} aria-hidden />
                        <span className="min-w-0">
                          <span className="block text-[0.9375rem] font-semibold text-ink group-hover:text-accent">{c.title}</span>
                          <span className="block text-sm text-ink-muted">{c.subtitle}</span>
                          <span className="mt-2 block text-[0.75rem] text-ink-subtle">{levelLabel(c.level)} · {c.durationHours}h</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
