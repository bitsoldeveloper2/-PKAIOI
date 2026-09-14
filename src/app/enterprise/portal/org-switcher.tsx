import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

/** Organisation selector for users who manage more than one (or institute staff). */
export function OrgSwitcher({ options, current, basePath }: { options: { slug: string; name: string }[]; current: string; basePath: string }) {
  if (options.length <= 1) return null;
  return (
    <nav aria-label="Organisation" className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Link
          key={o.slug}
          href={`${basePath}?org=${o.slug}` as Route}
          aria-current={o.slug === current ? "page" : undefined}
          className={cn("rounded-full px-3 py-1 text-sm", o.slug === current ? "bg-ink text-bg" : "border border-line-strong text-ink-muted hover:text-ink")}
        >
          {o.name}
        </Link>
      ))}
    </nav>
  );
}
