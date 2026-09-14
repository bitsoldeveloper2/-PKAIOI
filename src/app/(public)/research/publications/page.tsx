import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { FileText } from "lucide-react";
import { listLabs, listPublicationYears, listPublications } from "@/server/queries/research";
import { PublicationRow } from "@/components/site/cards";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { PublicationType } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Publications",
  description: "Papers, preprints, reports and datasets from the institute’s research labs.",
  alternates: { canonical: "/research/publications" },
};

const TYPES = new Set<string>(["PAPER", "PREPRINT", "REPORT", "DATASET"]);
const TYPE_LABEL: Record<string, string> = { PAPER: "Papers", PREPRINT: "Preprints", REPORT: "Reports", DATASET: "Datasets" };

function href(next: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
  const qs = params.toString();
  return (qs ? `/research/publications?${qs}` : "/research/publications") as Route;
}

export default async function PublicationsPage({ searchParams }: { searchParams: Promise<{ year?: string; type?: string; lab?: string; q?: string }> }) {
  const params = await searchParams;
  const year = params.year && /^\d{4}$/.test(params.year) ? Number(params.year) : undefined;
  const type = params.type && TYPES.has(params.type) ? (params.type as PublicationType) : undefined;
  const lab = params.lab?.slice(0, 60) || undefined;
  const q = params.q?.trim().slice(0, 80) || undefined;

  const [publications, years, labs] = await Promise.all([listPublications({ year, type, lab, q }), listPublicationYears(), listLabs()]);
  const current = { year: params.year, type: params.type, lab: params.lab, q };

  return (
    <div className="container-x py-12 md:py-16">
      <header className="max-w-2xl">
        <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
          <Link href="/research" className="hover:text-ink">Research</Link> <span aria-hidden>/</span> Publications
        </nav>
        <h1 className="mt-4 font-display text-display-lg text-ink">Publications</h1>
        <p className="mt-4 text-[1.0625rem] text-ink-muted">Everything the labs have published, with abstracts. Datasets and reports are released under open licences wherever partners allow.</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <aside className="space-y-6 text-sm">
          <form action="/research/publications" method="get" className="space-y-2">
            {params.type ? <input type="hidden" name="type" value={params.type} /> : null}
            {params.lab ? <input type="hidden" name="lab" value={params.lab} /> : null}
            <label htmlFor="pub-search" className="eyebrow">Search</label>
            <input id="pub-search" name="q" type="search" defaultValue={q} placeholder="Title, venue…" className="h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25" />
          </form>
          <nav aria-label="Type">
            <p className="eyebrow">Type</p>
            <ul className="mt-2 space-y-1">
              <li><Link href={href({ ...current, type: undefined })} className={cn("block rounded-md px-2 py-1", !type ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink")}>All</Link></li>
              {Object.entries(TYPE_LABEL).map(([k, v]) => (
                <li key={k}><Link href={href({ ...current, type: k })} className={cn("block rounded-md px-2 py-1", type === k ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink")}>{v}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Year">
            <p className="eyebrow">Year</p>
            <ul className="mt-2 flex flex-wrap gap-1.5 lg:flex-col lg:gap-1">
              <li><Link href={href({ ...current, year: undefined })} className={cn("block rounded-md px-2 py-1", !year ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink")}>All</Link></li>
              {years.map((y) => (
                <li key={y.year}><Link href={href({ ...current, year: String(y.year) })} className={cn("block rounded-md px-2 py-1 tabular", year === y.year ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink")}>{y.year} <span className="opacity-60">{y.count}</span></Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Lab">
            <p className="eyebrow">Lab</p>
            <ul className="mt-2 space-y-1">
              <li><Link href={href({ ...current, lab: undefined })} className={cn("block rounded-md px-2 py-1", !lab ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink")}>All labs</Link></li>
              {labs.map((l) => (
                <li key={l.slug}><Link href={href({ ...current, lab: l.slug })} className={cn("block rounded-md px-2 py-1", lab === l.slug ? "bg-surface-2 font-medium text-ink" : "text-ink-muted hover:text-ink")}>{l.name}</Link></li>
              ))}
            </ul>
          </nav>
        </aside>

        <div>
          <p className="text-sm text-ink-muted" role="status">{publications.length} {publications.length === 1 ? "result" : "results"}</p>
          {publications.length ? (
            <ol className="mt-2 border-b border-line">
              {publications.map((p) => (
                <PublicationRow key={p.id} pub={p} />
              ))}
            </ol>
          ) : (
            <EmptyState className="mt-4" icon={FileText} title="No publications match" description="Try removing a filter." />
          )}
        </div>
      </div>
    </div>
  );
}
