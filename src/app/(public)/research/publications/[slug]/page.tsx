import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getPublicationBySlug } from "@/server/queries/research";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site";

const PUB_TYPE: Record<string, string> = { PAPER: "Paper", PREPRINT: "Preprint", REPORT: "Report", DATASET: "Dataset" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) return { title: "Publication not found" };
  return { title: pub.title, description: pub.abstract.slice(0, 160), alternates: { canonical: `/research/publications/${pub.slug}` } };
}

export default async function PublicationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug);
  if (!pub) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": pub.type === "DATASET" ? "Dataset" : "ScholarlyArticle",
    name: pub.title,
    headline: pub.title,
    abstract: pub.abstract,
    author: pub.authors.map((name) => ({ "@type": "Person", name })),
    datePublished: String(pub.year),
    publisher: { "@type": "Organization", name: siteConfig.name },
    ...(pub.url ? { url: pub.url } : {}),
  };

  return (
    <article className="container-narrow py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/research" className="hover:text-ink">Research</Link> <span aria-hidden>/</span>{" "}
        <Link href="/research/publications" className="hover:text-ink">Publications</Link>
      </nav>
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="outline">{PUB_TYPE[pub.type] ?? pub.type}</Badge>
          <span className="text-sm text-ink-muted tabular">{pub.year}</span>
          {pub.lab ? (
            <Link href={`/research/${pub.lab.slug}`} className="text-sm link">{pub.lab.name}</Link>
          ) : null}
        </div>
        <h1 className="mt-4 font-display text-display-md text-ink">{pub.title}</h1>
        <p className="mt-4 text-[0.9375rem] text-ink-muted">{pub.authors.join(", ")}</p>
        <p className="mt-1 text-[0.9375rem] italic text-ink-muted">{pub.venue}</p>
      </header>

      <section className="mt-10" aria-labelledby="abstract-title">
        <h2 id="abstract-title" className="eyebrow">Abstract</h2>
        <p className="prose-pio mt-3 text-[1.0625rem]">{pub.abstract}</p>
      </section>

      {pub.url ? (
        <a href={pub.url} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-ink hover:bg-accent-strong">
          Read the full text <ArrowUpRight className="size-4" aria-hidden />
        </a>
      ) : null}

      <section className="mt-12 rounded-xl border border-line bg-surface p-5 text-sm" aria-labelledby="cite-title">
        <h2 id="cite-title" className="font-semibold text-ink">Cite</h2>
        <p className="mt-2 font-mono text-[0.8125rem] leading-relaxed text-ink-muted">
          {pub.authors.join(", ")} ({pub.year}). {pub.title}. <em>{pub.venue}</em>.
        </p>
      </section>
    </article>
  );
}
