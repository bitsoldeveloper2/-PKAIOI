import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/dal";
import { getAreasFor } from "@/server/auth/areas";
import { AppShell } from "@/components/app/app-shell";

export const metadata: Metadata = { title: { default: "Studio", template: "%s · Studio · PIOAI" }, robots: { index: false } };

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePermission("studio:access", "/studio");
  const areas = await getAreasFor(user);
  return (
    <AppShell area="studio" user={user} areas={areas}>
      {children}
    </AppShell>
  );
}
