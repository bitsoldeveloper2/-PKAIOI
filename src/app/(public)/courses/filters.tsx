"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { Search, X } from "lucide-react";
import { Chip } from "@/components/ui/badge";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Current = { q: string; category: string; level: string; sort: string };

export function CatalogFilters({ categories, current, className }: { categories: { category: string; count: number }[]; current: Current; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(current.q);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = (next: Partial<Current>) => {
    const merged = { ...current, q, ...next };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.category) params.set("category", merged.category);
    if (merged.level) params.set("level", merged.level);
    if (merged.sort && merged.sort !== "featured") params.set("sort", merged.sort);
    const qs = params.toString();
    startTransition(() => router.replace((qs ? `${pathname}?${qs}` : pathname) as Route, { scroll: false }));
  };

  useEffect(() => {
    if (q === current.q) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => push({ q }), 350);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className={cn("space-y-4", className)} aria-busy={pending}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <label htmlFor="catalog-search" className="sr-only">
            Search courses
          </label>
          <input
            id="catalog-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, topic or category"
            className="h-11 w-full rounded-md border border-line-strong bg-surface pl-10 pr-10 text-[0.9375rem] text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
          {q ? (
            <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-subtle hover:bg-surface-2 hover:text-ink" aria-label="Clear search">
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 md:w-auto md:grid-cols-2">
          <div>
            <label htmlFor="catalog-level" className="sr-only">
              Level
            </label>
            <Select id="catalog-level" value={current.level} onChange={(e) => push({ level: e.target.value })} className="h-11">
              <option value="">All levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </Select>
          </div>
          <div>
            <label htmlFor="catalog-sort" className="sr-only">
              Sort
            </label>
            <Select id="catalog-sort" value={current.sort} onChange={(e) => push({ sort: e.target.value })} className="h-11">
              <option value="featured">Featured first</option>
              <option value="newest">Newest</option>
              <option value="popular">Most enrolled</option>
              <option value="shortest">Shortest</option>
            </Select>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Chip active={!current.category} onClick={() => push({ category: "" })}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c.category} active={current.category === c.category} onClick={() => push({ category: current.category === c.category ? "" : c.category })}>
            {c.category}
            <span className="text-ink-subtle tabular">{c.count}</span>
          </Chip>
        ))}
      </div>
    </div>
  );
}
