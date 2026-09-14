import type { Metadata } from "next";
import { requireEnterpriseManager } from "@/server/auth/dal";
import { getAreasFor } from "@/server/auth/areas";
import { AppShell } from "@/components/app/app-shell";

export const metadata: Metadata = { title: { default: "Enterprise portal", template: "%s · Enterprise · PIOAI" }, robots: { index: false } };

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, contexts } = await requireEnterpriseManager("/enterprise/portal");
  const areas = await getAreasFor(user);
  const primary = contexts[0];
  const roleLabel = primary ? `${primary.membershipRole === "OWNER" ? "Owner" : "Manager"} · ${primary.org.name}` : undefined;
  return (
    <AppShell area="enterprise" user={user} areas={areas} contextLabel="Manage teams" roleLabel={roleLabel}>
      {children}
    </AppShell>
  );
}
