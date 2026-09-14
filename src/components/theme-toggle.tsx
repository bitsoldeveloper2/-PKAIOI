"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, SunMoon } from "lucide-react";
import { cn } from "@/lib/utils";

const ORDER = ["system", "light", "dark"] as const;
const LABEL: Record<(typeof ORDER)[number], string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

export function ThemeToggle({ className, invert }: { className?: string; invert?: boolean }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const current = (ORDER.includes(theme as (typeof ORDER)[number]) ? theme : "system") as (typeof ORDER)[number];
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length] ?? "system";
  const Icon = current === "dark" ? Moon : current === "light" ? Sun : SunMoon;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={cn(
        "grid size-9 place-items-center rounded-md transition-colors",
        invert ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
        className,
      )}
      aria-label={mounted ? `${LABEL[current]}. Switch to ${LABEL[next].toLowerCase()}` : "Toggle theme"}
      title={mounted ? LABEL[current] : undefined}
    >
      <Icon className="size-[18px]" aria-hidden />
    </button>
  );
}
