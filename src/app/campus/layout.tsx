import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/dal";
import { getAreasFor } from "@/server/auth/areas";
import { AppShell } from "@/components/app/app-shell";

export const metadata: Metadata = { title: { default: "Campus", template: "%s · Campus · PIOAI" }, robots: { index: false } };

export default async function CampusLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePermission("campus:access", "/campus");
  const areas = await getAreasFor(user);
  return (
    <AppShell area="campus" user={user} areas={areas}>
      {children}
    </AppShell>
  );
}
