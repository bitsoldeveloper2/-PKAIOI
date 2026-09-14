import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/dal";
import { getOrganizationBySlug } from "@/server/queries/admin";
import { regenerateInviteCodeAction } from "@/server/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { OrgForm } from "../org-form";
import { MemberForms, MemberRow } from "./member-forms";

export const metadata: Metadata = { title: "Organisation" };

export default async function AdminOrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [, org] = await Promise.all([requirePermission("enterprise:manage", `/admin/enterprise/${slug}`), getOrganizationBySlug(slug)]);
  if (!org) notFound();

  const byUser = new Map<string, { active: number; completed: number; certificates: number; lastActive: Date | null; lessons: number }>();
  for (const m of org.memberships) byUser.set(m.userId, { active: 0, completed: 0, certificates: 0, lastActive: null, lessons: 0 });
  for (const e of org.enrollments) {
    const s = byUser.get(e.userId);
    if (!s) continue;
    if (e.status === "COMPLETED") s.completed += 1;
    else if (e.status === "ACTIVE") s.active += 1;
  }
  for (const c of org.certificates) {
    const s = byUser.get(c.userId);
    if (s) s.certificates += 1;
  }
  for (const p of org.progress) {
    const s = byUser.get(p.userId);
    if (s) {
      s.lessons = p._count._all;
      s.lastActive = p._max.updatedAt;
    }
  }

  return (
    <div className="container-wide py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/admin/enterprise" className="hover:text-ink">Enterprise</Link> <span aria-hidden>/</span> {org.name}
      </nav>
      <header className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-ink">{org.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">{org.domain ?? "No domain"} · partner since {formatDate(org.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={org.plan === "ENTERPRISE" ? "gold" : "neutral"}>{org.plan.toLowerCase()}</Badge>
          <Badge tone="outline">{org.memberships.length}/{org.seats} seats</Badge>
          <OrgForm trigger="edit" org={{ id: org.id, name: org.name, domain: org.domain ?? "", plan: org.plan, seats: org.seats }} />
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section className="overflow-x-auto rounded-xl border border-line bg-surface" aria-labelledby="members-title">
          <h2 id="members-title" className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">People</h2>
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Active</th>
                <th className="px-4 py-3 text-right">Completed</th>
                <th className="px-4 py-3 text-right">Lessons</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {org.memberships.map((m) => (
                <MemberRow key={m.id} membershipId={m.id} role={m.role} user={m.user} stats={byUser.get(m.userId)!} />
              ))}
            </tbody>
          </table>
        </section>

        <aside className="space-y-5">
          <MemberForms orgId={org.id} />
          <form action={regenerateInviteCodeAction} className="rounded-xl border border-line bg-surface p-5">
            <input type="hidden" name="orgId" value={org.id} />
            <h2 className="text-sm font-semibold text-ink">Invite code</h2>
            <p className="mt-2 font-mono text-lg text-ink">{org.inviteCode}</p>
            <p className="mt-1 text-xs text-ink-muted">New members enter this at registration to join with a seat. Rotate it if it leaks.</p>
            <Button type="submit" variant="outline" size="sm" className="mt-3">Rotate code</Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
