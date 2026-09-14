import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { requirePermission } from "@/server/auth/dal";
import { listOrganizations } from "@/server/queries/admin";
import { PageHeader } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { OrgForm } from "./org-form";

export const metadata: Metadata = { title: "Enterprise" };

export default async function AdminEnterprisePage() {
  await requirePermission("enterprise:manage", "/admin/enterprise");
  const orgs = await listOrganizations();

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Institution" title="Enterprise partners" lede="Organisations with seats on the platform. Managers see their own portal; you see everything." actions={<OrgForm trigger="new" />} />

      <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[52rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Seats</th>
              <th className="px-4 py-3 text-right">Enrolments</th>
              <th className="px-4 py-3">Invite code</th>
              <th className="px-4 py-3">Since</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/admin/enterprise/${o.slug}` as Route} className="font-medium text-ink hover:text-accent">{o.name}</Link>
                  <p className="text-xs text-ink-muted">{o.domain ?? "—"}</p>
                </td>
                <td className="px-4 py-3"><Badge tone={o.plan === "ENTERPRISE" ? "gold" : "neutral"}>{o.plan.toLowerCase()}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={(o._count.memberships / o.seats) * 100} label={`${o.name} seat usage`} size="sm" className="w-24" />
                    <span className="tabular text-ink-muted">{o._count.memberships}/{o.seats}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular text-ink">{o._count.enrollments}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">{o.inviteCode}</td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
