"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { SearchHit } from "@/server/queries/search";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<SearchHit["type"], string> = {
  course: "Course",
  program: "Program",
  post: "Journal",
  publication: "Publication",
  faculty: "Faculty",
  lab: "Research lab",
  page: "Page",
};

export function SearchUI({ initialQuery, initialHits, className }: { initialQuery: string; initialHits: SearchHit[]; className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [hits, setHits] = useState<SearchHit[]>(initialHits);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const abort = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q === initialQuery.trim() && hits.length) return;
    const timer = setTimeout(async () => {
      if (q.length < 2) {
        setHits([]);
        return;
      }
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (res.ok) {
          const data = (await res.json()) as { hits: SearchHit[] };
          setHits(data.hits);
          setActive(-1);
        }
      } catch {
        /* aborted or offline — keep the previous results */
      } finally {
        if (abort.current === controller) setLoading(false);
      }
      window.history.replaceState(null, "", q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    }, 220);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(hits.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter" && active >= 0 && hits[active]) {
      e.preventDefault();
      router.push(hits[active].href as Route);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-subtle" aria-hidden />
        <label htmlFor="site-search" className="sr-only">Search the institute</label>
        <input
          ref={inputRef}
          id="site-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Try “evaluation”, “Urdu”, or a faculty name"
          role="combobox"
          aria-expanded={hits.length > 0}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          className="h-14 w-full rounded-xl border border-line-strong bg-surface pl-12 pr-4 text-lg text-ink shadow-soft placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </div>

      <p className="mt-3 text-sm text-ink-muted" role="status" aria-live="polite">
        {loading ? "Searching…" : query.trim().length < 2 ? "Type at least two characters." : hits.length === 0 ? "No results." : `${hits.length} results`}
      </p>

      <ul id={listId} role="listbox" aria-label="Search results" className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
        {hits.map((hit, i) => (
          <li key={hit.href} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
            <Link
              href={hit.href as Route}
              onMouseEnter={() => setActive(i)}
              className={cn("flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-2", i === active && "bg-surface-2")}
            >
              <span className="mt-1 w-24 shrink-0 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">{TYPE_LABEL[hit.type]}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.0625rem] font-semibold text-ink">{hit.title}</span>
                <span className="block truncate text-sm text-ink-muted">{hit.subtitle}</span>
              </span>
              {hit.meta ? <span className="hidden shrink-0 text-[0.8125rem] text-ink-subtle sm:block">{hit.meta}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
