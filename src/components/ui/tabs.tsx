"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type TabItem = { id: string; label: React.ReactNode; content: React.ReactNode; count?: number };

/** WAI-ARIA tabs with roving tabindex and arrow-key navigation. */
export function Tabs({
  items,
  defaultId,
  className,
  variant = "underline",
  onChange,
}: {
  items: TabItem[];
  defaultId?: string;
  className?: string;
  variant?: "underline" | "pills";
  onChange?: (id: string) => void;
}) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id ?? "");
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string, index: number) => {
    setActive(id);
    onChange?.(id);
    refs.current[index]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    const item = items[next];
    if (item) select(item.id, next);
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        className={cn(
          "flex gap-1 overflow-x-auto",
          variant === "underline" && "border-b border-line",
          variant === "pills" && "rounded-lg bg-surface-2 p-1",
        )}
      >
        {items.map((item, i) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id, i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors",
                variant === "underline" &&
                  cn(
                    "-mb-px border-b-2 px-3 py-2.5",
                    selected ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink",
                  ),
                variant === "pills" &&
                  cn(
                    "rounded-md px-3 py-1.5",
                    selected ? "bg-surface text-ink shadow-soft" : "text-ink-muted hover:text-ink",
                  ),
              )}
            >
              {item.label}
              {typeof item.count === "number" ? (
                <span className="rounded-full bg-surface-3 px-1.5 text-[0.6875rem] tabular text-ink-muted">{item.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="pt-5 focus-visible:outline-none"
        >
          {item.id === active ? item.content : null}
        </div>
      ))}
    </div>
  );
}
