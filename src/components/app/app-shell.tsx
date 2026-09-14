import type { SessionUser } from "@/server/auth/dal";
import type { AreaLink } from "@/server/auth/areas";
import { AREA_META, AREA_NAV, type AreaKey } from "@/lib/app-nav";
import { ROLE_LABELS } from "@/server/auth/permissions";
import { SidebarNav, type SidebarGroup } from "./sidebar-nav";
import { AmbientLattice } from "@/components/three/ambient-lattice";

/**
 * Authenticated workspace shell: a persistent sidebar with the area's
 * navigation, a workspace switcher, and the user's account menu. Icons are
 * rendered here (server) and passed down as elements so the client nav stays
 * serialisable.
 */
export function AppShell({
  area,
  user,
  areas,
  children,
  contextLabel,
  roleLabel,
}: {
  area: AreaKey;
  user: SessionUser;
  areas: AreaLink[];
  children: React.ReactNode;
  /** Optional line under the area title (e.g. organisation name). */
  contextLabel?: string;
  /** Overrides the role shown under the user's name (e.g. "Owner · Nexus Bank"). */
  roleLabel?: string;
}) {
  const groups: SidebarGroup[] = AREA_NAV[area].map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({
      label: item.label,
      href: item.href,
      exact: item.exact,
      icon: <item.icon className="size-4" aria-hidden />,
    })),
  }));

  return (
    <div className="flex min-h-dvh">
      <AmbientLattice intensity={0.6} />
      <SidebarNav
        area={{ key: area, label: AREA_META[area].label, description: contextLabel ?? AREA_META[area].description }}
        areas={areas}
        groups={groups}
        user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl, role: roleLabel ?? ROLE_LABELS[user.role] }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-14 lg:hidden" aria-hidden />
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
