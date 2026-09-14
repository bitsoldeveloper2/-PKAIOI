import type { Metadata } from "next";
import { searchSite } from "@/server/queries/search";
import { SearchUI } from "./search-ui";

export const metadata: Metadata = {
  title: "Search",
  description: "Search programs, courses, research, faculty and the journal.",
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const initial = q.trim().length >= 2 ? await searchSite(q, 20) : [];

  return (
    <div className="container-narrow py-12 md:py-16">
      <p className="eyebrow">Search</p>
      <h1 className="mt-4 font-display text-display-md text-ink">Find anything at the institute.</h1>
      <p className="mt-3 text-[0.9375rem] text-ink-muted">Programs, courses, research, faculty and the journal. Results update as you type.</p>
      <SearchUI initialQuery={q} initialHits={initial} className="mt-8" />
    </div>
  );
}
