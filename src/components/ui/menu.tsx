"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export type MenuItem =
  | { type?: "item"; label: React.ReactNode; icon?: React.ComponentType<{ className?: string }>; href?: Route; onSelect?: () => void; tone?: "default" | "danger" }
  | { type: "separator" }
  | { type: "label"; label: string };

/**
 * Dropdown menu with a proper `menu` role, arrow-key navigation, outside-click
 * and Escape dismissal. Rendered in-flow (absolute), no portal needed.
 */
export function Menu({
  trigger,
  items,
  align = "end",
  side = "bottom",
  className,
}: {
  trigger: (props: { open: boolean; toggle: () => void; "aria-haspopup": "menu"; "aria-expanded": boolean; "aria-controls": string }) => React.ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  /** Open below the trigger (default) or above it, for triggers near the bottom of the screen. */
  side?: "bottom" | "top";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    const first = list.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(list.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const idx = nodes.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      nodes[(idx + 1) % nodes.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nodes[(idx - 1 + nodes.length) % nodes.length]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={root} className={cn("relative", className)}>
      {trigger({ open, toggle: () => setOpen((o) => !o), "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": id })}
      {open ? (
        <div
          ref={list}
          id={id}
          role="menu"
          onKeyDown={onKeyDown}
          className={cn(
            "absolute z-50 min-w-52 overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-pop animate-fade-in",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, i) => {
            if (item.type === "separator") return <div key={i} role="separator" className="my-1 h-px bg-line" />;
            if (item.type === "label")
              return (
                <p key={i} className="px-2.5 pb-1 pt-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">
                  {item.label}
                </p>
              );
            const Icon = item.icon;
            const cls = cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-ink outline-none transition-colors hover:bg-surface-2 focus-visible:bg-surface-2",
              item.tone === "danger" && "text-danger",
            );
            const content = (
              <>
                {Icon ? <Icon className="size-4 text-ink-muted" aria-hidden /> : null}
                <span className="flex-1">{item.label}</span>
              </>
            );
            return item.href ? (
              <Link key={i} role="menuitem" href={item.href} className={cls} onClick={() => setOpen(false)}>
                {content}
              </Link>
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                className={cls}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
