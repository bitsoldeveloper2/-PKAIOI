import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { getAdminOverview } from "@/server/queries/admin";
import { PageHeader } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { firstName, formatNumber, formatPkr, relativeTime } from "@/lib/utils";

const APP_TONE: Record<string, "neutral" | "info" | "warning" | "success" | "gold" | "danger" | "outline"> = {
  SUBMITTED: "neutral", UNDER_REVIEW: "info", INTERVIEW: "warning", OFFER: "gold", ACCEPTED: "success", WAITLISTED: "outline", REJECTED: "danger", WITHDRAWN: "outline",
};
const STAGE_TONE: Record<string, "neutral" | "info" | "warning" | "success" | "gold" | "danger" | "outline"> = {
  NEW: "neutral", CONTACTED: "info", QUALIFIED: "warning", PROPOSAL: "gold", WON: "success", LOST: "outline",
};

export default async function AdminHome() {
  const user = await requirePermission("admin:access", "/admin");
  const o = await getAdminOverview();

  const tiles = [
    { label: "Learners", value: formatNumber(o.users.students), hint: `${o.users.new7d} new this week`, href: "/admin/users" },
    { label: "Open applications", value: o.admissions.open, hint: `${o.admissions.offers} offers · ${o.admissions.accepted} accepted`, href: "/admin/admissions" },
    { label: "Pipeline", value: formatPkr(o.crm.pipelineValue), hint: `${o.crm.open} open leads · ${o.crm.won} won`, href: "/admin/crm" },
    { label: "Enrolments", value: formatNumber(o.academy.enrollments), hint: `${o.academy.certificates} certificates · ${o.academy.courses} live courses`, href: "/admin/academy" },
  ];

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Console" title={`The institute at a glance, ${firstName(user.name)}.`} lede="Admissions, pipeline, academy and platform health. Everything here writes to the audit log." />

      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href as Route} className="group block rounded-xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">{t.label}</p>
              <p className="mt-2 font-display text-3xl tabular text-ink">{t.value}</p>
              <p className="mt-0.5 flex items-center justify-between text-xs text-ink-subtle">{t.hint}<ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden /></p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-line bg-surface" aria-labelledby="recent-apps">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 id="recent-apps" className="text-sm font-semibold text-ink">Latest applications</h2>
            <Link href="/admin/admissions" className="text-xs text-accent hover:underline">All</Link>
          </div>
          <ul className="divide-y divide-line">
            {o.recentApps.map((a) => (
              <li key={a.id} className="px-5 py-3">
                <Link href={`/admin/admissions/${a.id}` as Route} className="block">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{a.firstName} {a.lastName}</p>
                    <Badge tone={APP_TONE[a.status] ?? "neutral"}>{a.status.replace("_", " ").toLowerCase()}</Badge>
                  </div>
                  <p className="text-xs text-ink-muted">{a.program.title} · {relativeTime(a.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-line bg-surface" aria-labelledby="recent-leads">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 id="recent-leads" className="text-sm font-semibold text-ink">Pipeline activity</h2>
            <Link href="/admin/crm" className="text-xs text-accent hover:underline">Board</Link>
          </div>
          <ul className="divide-y divide-line">
            {o.recentLeads.map((l) => (
              <li key={l.id} className="px-5 py-3">
                <Link href={`/admin/crm/${l.id}` as Route} className="block">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{l.name}</p>
                    <Badge tone={STAGE_TONE[l.stage] ?? "neutral"}>{l.stage.toLowerCase()}</Badge>
                  </div>
                  <p className="text-xs text-ink-muted">{l.organization ?? "Individual"}{l.value ? ` · ${formatPkr(l.value)}` : ""} · {relativeTime(l.updatedAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-line bg-surface" aria-labelledby="recent-audit">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 id="recent-audit" className="text-sm font-semibold text-ink">Audit log</h2>
            <Link href="/admin/audit" className="text-xs text-accent hover:underline">All</Link>
          </div>
          <ul className="divide-y divide-line">
            {o.recentAudit.map((e) => (
              <li key={e.id} className="px-5 py-3">
                <p className="font-mono text-xs text-ink">{e.action}</p>
                <p className="text-xs text-ink-muted">{e.actor?.name ?? "system"} · {e.entity}{e.entityId ? ` ${e.entityId.slice(-6)}` : ""} · {relativeTime(e.createdAt)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Platform totals">
        {[
          { label: "Accounts", value: o.users.total, hint: `${o.users.instructors} instructors · ${o.users.staff} staff` },
          { label: "Organisations", value: o.academy.orgs, hint: "enterprise partners" },
          { label: "Published posts", value: o.academy.posts, hint: "journal" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface px-4 py-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">{s.label}</p>
            <p className="mt-1 text-xl tabular text-ink">{s.value} <span className="text-xs text-ink-subtle">{s.hint}</span></p>
          </div>
        ))}
      </section>
    </div>
  );
}
