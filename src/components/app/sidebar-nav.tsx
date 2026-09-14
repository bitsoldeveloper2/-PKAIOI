"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, Globe, LogOut, Menu as MenuIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { Menu } from "@/components/ui/menu";
import { logoutAction } from "@/server/actions/auth";

export type SidebarItem = { label: string; href: Route; exact?: boolean; icon: React.ReactNode };
export type SidebarGroup = { label?: string; items: SidebarItem[] };
type Area = { key: string; label: string; description: string };
type AreaLink = { key: string; label: string; home: string; description: string };
type User = { name: string; email: string; avatarUrl: string | null; role: string };

function NavList({ groups, onNavigate }: { groups: SidebarGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Workspace" className="flex flex-col gap-6">
      {groups.map((group, gi) => (
        <div key={group.label ?? gi}>
          {group.label ? <p className="mb-2 px-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-subtle">{group.label}</p> : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      active ? "bg-accent-soft font-medium text-accent-strong" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                    )}
                  >
                    <span className={cn(active ? "text-accent-strong" : "text-ink-subtle")}>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function AreaSwitcher({ area, areas }: { area: Area; areas: AreaLink[] }) {
  if (areas.length <= 1) {
    return (
      <div className="px-3">
        <p className="text-[0.9375rem] font-semibold text-ink">{area.label}</p>
        <p className="text-xs text-ink-muted">{area.description}</p>
      </div>
    );
  }
  return (
    <Menu
      align="start"
      className="w-full"
      trigger={(p) => (
        <button
          type="button"
          onClick={p.toggle}
          aria-haspopup={p["aria-haspopup"]}
          aria-expanded={p["aria-expanded"]}
          aria-controls={p["aria-controls"]}
          className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-surface-2"
        >
          <span>
            <span className="block text-[0.9375rem] font-semibold text-ink">{area.label}</span>
            <span className="block text-xs text-ink-muted">{area.description}</span>
          </span>
          <ChevronsUpDown className="size-4 text-ink-subtle" aria-hidden />
        </button>
      )}
      items={[
        { type: "label", label: "Switch workspace" },
        ...areas.map((a) => ({ label: `${a.label} · ${a.description}`, href: a.home as Route })),
        { type: "separator" as const },
        { label: "Public site", icon: Globe, href: "/" as Route },
      ]}
    />
  );
}

function UserMenu({ user }: { user: User }) {
  return (
    <Menu
      align="start"
      side="top"
      className="w-full"
      trigger={(p) => (
        <button
          type="button"
          onClick={p.toggle}
          aria-haspopup={p["aria-haspopup"]}
          aria-expanded={p["aria-expanded"]}
          aria-controls={p["aria-controls"]}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-surface-2"
          aria-label={`Account menu for ${user.name}`}
        >
          <Avatar name={user.name} src={user.avatarUrl} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{user.name}</span>
            <span className="block truncate text-xs text-ink-muted">{user.role}</span>
          </span>
        </button>
      )}
      items={[
        { type: "label", label: user.email },
        { label: "Account settings", icon: Settings, href: "/account" as Route },
        { type: "separator" },
        { label: "Sign out", icon: LogOut, tone: "danger", onSelect: () => void logoutAction() },
      ]}
    />
  );
}

export function SidebarNav({ area, areas, groups, user }: { area: Area; areas: AreaLink[]; groups: SidebarGroup[]; user: User }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const content = (
    <>
      <div className="flex items-center gap-3 px-3 pb-4">
        <Link href="/" aria-label="Pakistan Institute of AI — home">
          <LogoMark size={28} />
        </Link>
        <div className="flex-1">
          <AreaSwitcher area={area} areas={areas} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin px-2">
        <NavList groups={groups} onNavigate={() => setOpen(false)} />
      </div>
      <div className="mt-4 space-y-1 border-t border-line px-2 pt-4">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-ink-subtle">Theme</span>
          <ThemeToggle />
        </div>
        <UserMenu user={user} />
      </div>
    </>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface py-5 lg:flex" aria-label="Sidebar">
        {content}
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="Pakistan Institute of AI — home">
          <LogoMark size={26} />
          <span className="font-display text-lg text-ink">{area.label}</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-md text-ink hover:bg-surface-2" aria-label="Open navigation">
          <MenuIcon className="size-5" aria-hidden />
        </button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={area.label} side="left">
        <div className="flex h-full flex-col">{content}</div>
      </Dialog>
    </>
  );
}
