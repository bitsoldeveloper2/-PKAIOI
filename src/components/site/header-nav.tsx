"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { ArrowUpRight, ChevronDown, LayoutDashboard, LogOut, Menu as MenuIcon, Search, Settings } from "lucide-react";
import { publicNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Menu } from "@/components/ui/menu";
import { Avatar } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/badge";
import { logoutAction } from "@/server/actions/auth";

type NavUser = { name: string; avatarUrl: string | null; home: "/campus" | "/studio" | "/admin"; role: string };

/** Routes whose first screen is a dark hero, so the transparent header renders in white. */
const DARK_HERO_ROUTES = new Set(["/", "/enterprise"]);

export function HeaderNav({ user, invert }: { user: NavUser | null; invert: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
  }

  useEffect(() => {
    if (!openMenu) return;
    const onDoc = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const dark = (invert || DARK_HERO_ROUTES.has(pathname)) && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300",
        scrolled ? "glass border-b border-line shadow-soft" : "border-b border-transparent",
        dark && "text-white",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <Logo invert={dark} compact />

        <nav ref={navRef} aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {publicNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasChildren = "children" in item && item.children.length > 0;
            if (!hasChildren) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    dark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                    active && (dark ? "text-white" : "text-ink"),
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            }
            const open = openMenu === item.label;
            return (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(open ? null : item.label)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    dark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                    (active || open) && (dark ? "text-white" : "text-ink"),
                  )}
                >
                  {item.label}
                  <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
                </button>
                {open ? (
                  <div className="absolute left-0 top-full z-50 mt-2 w-[22rem] rounded-xl border border-line bg-surface p-2 text-ink shadow-pop animate-fade-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-surface-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink">{child.label}</p>
                          <p className="mt-0.5 text-[0.8125rem] leading-snug text-ink-muted">{child.description}</p>
                        </div>
                        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/search"
            className={cn(
              "hidden h-9 items-center gap-2 rounded-md border px-3 text-sm md:inline-flex",
              dark
                ? "border-white/15 text-white/80 hover:bg-white/10 hover:text-white"
                : "border-line-strong text-ink-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden xl:inline">Search</span>
            <Kbd className={cn("hidden xl:inline-flex", dark && "border-white/20 bg-transparent text-white/70")}>⌘K</Kbd>
          </Link>
          <ThemeToggle invert={dark} />

          {user ? (
            <Menu
              trigger={(p) => (
                <button
                  type="button"
                  onClick={p.toggle}
                  aria-haspopup={p["aria-haspopup"]}
                  aria-expanded={p["aria-expanded"]}
                  aria-controls={p["aria-controls"]}
                  className="ml-1 rounded-full ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Account menu for ${user.name}`}
                >
                  <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                </button>
              )}
              items={[
                { type: "label", label: user.name },
                { label: "Go to workspace", icon: LayoutDashboard, href: user.home },
                { label: "Account settings", icon: Settings, href: "/account" as Route },
                { type: "separator" },
                { label: "Sign out", icon: LogOut, tone: "danger", onSelect: () => void logoutAction() },
              ]}
            />
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "hidden rounded-md px-3 py-2 text-sm font-medium md:inline-flex",
                  dark ? "text-white/80 hover:text-white" : "text-ink-muted hover:text-ink",
                )}
              >
                Sign in
              </Link>
              <ButtonLink href="/apply" size="sm" variant={dark ? "inverse" : "primary"} className="hidden md:inline-flex">
                Apply
              </ButtonLink>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={cn(
              "grid size-9 place-items-center rounded-md lg:hidden",
              dark ? "text-white hover:bg-white/10" : "text-ink hover:bg-surface-2",
            )}
            aria-label="Open navigation"
          >
            <MenuIcon className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} title="Navigate" side="right">
        <nav aria-label="Mobile" className="flex flex-col gap-6">
          {publicNav.map((item) => (
            <div key={item.label}>
              <Link href={item.href} className="font-display text-2xl text-ink">
                {item.label}
              </Link>
              {"children" in item ? (
                <ul className="mt-2 space-y-1 border-l border-line pl-4">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} className="block py-1.5 text-sm text-ink-muted hover:text-ink">
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-line pt-6">
            {user ? (
              <>
                <Link href={user.home} className={buttonClasses("primary", "lg")}>
                  Go to workspace
                </Link>
                <button type="button" onClick={() => void logoutAction()} className={buttonClasses("outline", "lg")}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/apply" className={buttonClasses("primary", "lg")}>
                  Apply to PIOAI
                </Link>
                <Link href="/login" className={buttonClasses("outline", "lg")}>
                  Sign in
                </Link>
              </>
            )}
            <Link href="/search" className={buttonClasses("ghost", "lg")}>
              <Search className="size-4" aria-hidden /> Search the institute
            </Link>
          </div>
        </nav>
      </Dialog>
    </header>
  );
}
