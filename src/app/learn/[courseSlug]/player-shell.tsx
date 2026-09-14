"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, FileText, FlaskConical, HelpCircle, ListTree, PlayCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProgressRing } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { AmbientLattice } from "@/components/three/ambient-lattice";

type Lesson = { id: string; title: string; type: "VIDEO" | "ARTICLE" | "QUIZ" | "LAB"; durationMinutes: number; isPreview: boolean; completed: boolean };
type Module = { id: string; title: string; summary: string | null; lessons: Lesson[] };

const ICON = { VIDEO: PlayCircle, ARTICLE: FileText, QUIZ: HelpCircle, LAB: FlaskConical } as const;

function Curriculum({ courseSlug, modules, enrolled, onNavigate }: { courseSlug: string; modules: Module[]; enrolled: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Curriculum" className="pb-6">
      {modules.map((m, mi) => (
        <section key={m.id} className="border-b border-line py-4 last:border-b-0" aria-labelledby={`mod-${m.id}`}>
          <h2 id={`mod-${m.id}`} className="px-4 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">
            {String(mi + 1).padStart(2, "0")} · {m.title}
          </h2>
          <ol className="mt-2">
            {m.lessons.map((l) => {
              const Icon = ICON[l.type];
              const href = `/learn/${courseSlug}/${l.id}` as Route;
              const active = pathname === href;
              const locked = !enrolled && !l.isPreview;
              return (
                <li key={l.id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    aria-disabled={locked || undefined}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                      active ? "bg-accent-soft text-accent-strong" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                      locked && "opacity-60",
                    )}
                  >
                    {l.completed ? <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Completed" /> : <Circle className="size-4 shrink-0 text-ink-subtle" aria-hidden />}
                    <span className="min-w-0 flex-1 truncate">{l.title}</span>
                    <Icon className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
                    <span className="w-9 shrink-0 text-right text-[0.6875rem] tabular text-ink-subtle">{l.durationMinutes}m</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </nav>
  );
}

export function PlayerShell({
  course,
  modules,
  progressPct,
  completedLessons,
  totalLessons,
  enrolled,
  user,
  children,
}: {
  course: { id: string; slug: string; title: string; accent: string; instructorName: string };
  modules: Module[];
  progressPct: number;
  completedLessons: number;
  totalLessons: number;
  enrolled: boolean;
  user: { name: string; avatarUrl: string | null };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const sidebarHeader = (
    <div className="flex items-center gap-3 px-4 py-4">
      <ProgressRing value={progressPct} size={44} stroke={4} label={`${course.title} progress`} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{course.title}</p>
        <p className="text-xs text-ink-muted tabular">{completedLessons} of {totalLessons} lessons · {course.instructorName}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <AmbientLattice intensity={0.5} />
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface px-3 sm:px-4">
        <Link href="/campus" className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink" aria-label="Back to campus">
          <ArrowLeft className="size-4" aria-hidden />
          <span className="hidden sm:inline">Campus</span>
        </Link>
        <span className="hidden h-5 w-px bg-line sm:block" aria-hidden />
        <Link href="/" className="hidden sm:block" aria-label="Pakistan Institute of AI — home">
          <LogoMark size={24} />
        </Link>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{course.title}</p>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink lg:hidden" aria-label="Open curriculum">
          <ListTree className="size-4" aria-hidden />
          <span className="hidden sm:inline">Curriculum</span>
        </button>
        <ThemeToggle />
        <Link href="/account" className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Account settings">
          <Avatar name={user.name} src={user.avatarUrl} size="sm" />
        </Link>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[19rem] shrink-0 overflow-y-auto scroll-thin border-r border-line bg-surface lg:block" aria-label="Course curriculum">
          {sidebarHeader}
          <Curriculum courseSlug={course.slug} modules={modules} enrolled={enrolled} />
        </aside>

        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Curriculum" side="left" className="[&>div:first-child]:hidden">
        <div className="-mx-6 -my-5">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Curriculum</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 text-ink-subtle hover:bg-surface-2" aria-label="Close curriculum"><X className="size-4" aria-hidden /></button>
          </div>
          {sidebarHeader}
          <Curriculum courseSlug={course.slug} modules={modules} enrolled={enrolled} onNavigate={() => setOpen(false)} />
        </div>
      </Dialog>
    </div>
  );
}
