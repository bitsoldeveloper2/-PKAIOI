import Link from "next/link";
import { cn } from "@/lib/utils";

/** Institute mark: a ring holding a crescent lattice — nodes joined into one form. */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect x="2" y="2" width="60" height="60" rx="16" className="fill-accent" />
      <path
        d="M39 18.5c-7.5 0-13.5 6-13.5 13.5S31.5 45.5 39 45.5c2.4 0 4.6-.6 6.5-1.7C42.7 47.9 38 50.5 32.7 50.5 22.5 50.5 14.2 42.2 14.2 32S22.5 13.5 32.7 13.5c5.3 0 10 2.6 12.8 6.7-1.9-1.1-4.1-1.7-6.5-1.7z"
        className="fill-accent-ink"
      />
      <circle cx="44.5" cy="24" r="2.4" className="fill-accent-ink" />
      <circle cx="49" cy="32" r="2.4" className="fill-accent-ink" />
      <circle cx="44.5" cy="40" r="2.4" className="fill-accent-ink" />
      <path d="M44.5 24l4.5 8-4.5 8" stroke="var(--accent-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".8" />
    </svg>
  );
}

export function Logo({
  className,
  invert,
  compact,
  href = "/",
}: {
  className?: string;
  invert?: boolean;
  compact?: boolean;
  href?: "/" | "/campus" | "/studio" | "/admin";
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5 rounded-md", className)} aria-label="Pakistan Institute of AI — home">
      <LogoMark size={30} className="transition-transform duration-300 ease-out-quart group-hover:-rotate-6" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[1.1875rem] tracking-tight", invert ? "text-white" : "text-ink")}>PIOAI</span>
        {!compact ? (
          <span className={cn("mt-0.5 text-[0.625rem] font-medium uppercase tracking-[0.18em]", invert ? "text-white/70" : "text-ink-muted")}>
            Pakistan Institute of AI
          </span>
        ) : null}
      </span>
    </Link>
  );
}
