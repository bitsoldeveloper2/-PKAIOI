import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Newspaper } from "lucide-react";
import { listPostCategories, listPosts } from "@/server/queries/cms";
import { PostCard } from "@/components/site/cards";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Journal",
  description: "Research notes, admissions news and perspectives from the Pakistan Institute of AI.",
  alternates: { canonical: "/journal" },
};

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [posts, categories] = await Promise.all([listPosts({ category: category || undefined }), listPostCategories()]);
  const [lead, ...rest] = posts;

  return (
    <div className="container-x py-12 md:py-16">
      <header className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="eyebrow">Journal</p>
          <h1 className="mt-4 font-display text-display-lg text-ink">Notes from the institute.</h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-ink-muted">Research findings, what admissions is planning, and honest perspectives on where the field is going.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">The Letter</p>
          <p className="mt-1 text-sm text-ink-muted">One considered note a month. No noise.</p>
          <NewsletterForm className="mt-3" interest="Journal" />
        </div>
      </header>

      <nav aria-label="Categories" className="mt-10 flex flex-wrap gap-2 border-y border-line py-4">
        <Link href="/journal" className={cn("rounded-full px-3 py-1 text-sm", !category ? "bg-ink text-bg" : "text-ink-muted hover:text-ink")}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.category}
            href={`/journal?category=${encodeURIComponent(c.category)}` as Route}
            className={cn("rounded-full px-3 py-1 text-sm", category === c.category ? "bg-ink text-bg" : "text-ink-muted hover:text-ink")}
          >
            {c.category} <span className="tabular opacity-60">{c.count}</span>
          </Link>
        ))}
      </nav>

      {!lead ? (
        <EmptyState className="mt-8" icon={Newspaper} title="No posts in this category yet" />
      ) : (
        <div className="mt-10 grid gap-x-10 gap-y-12 lg:grid-cols-3">
          <PostCard post={lead} featured />
          {rest.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
