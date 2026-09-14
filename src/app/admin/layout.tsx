import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/dal";
import { getAreasFor } from "@/server/auth/areas";
import { AppShell } from "@/components/app/app-shell";

export const metadata: Metadata = { title: { default: "Console", template: "%s · Console · PIOAI" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePermission("admin:access", "/admin");
  const areas = await getAreasFor(user);
  return (
    <AppShell area="admin" user={user} areas={areas}>
      {children}
    </AppShell>
  );
}
