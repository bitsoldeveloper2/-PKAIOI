import Link from "next/link";
import type { Route } from "next";
import { Building2 } from "lucide-react";
import { requireEnterpriseManager } from "@/server/auth/dal";
import { getPortalOverview, resolvePortalOrg } from "@/server/queries/enterprise";
import { PageHeader } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { relativeTime } from "@/lib/utils";
import { OrgSwitcher } from "./org-switcher";

export default async function PortalHome({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const [{ user, contexts }, { org: orgSlug }] = await Promise.all([requireEnterpriseManager("/enterprise/portal"), searchParams]);
  const { org, options } = await resolvePortalOrg(user, contexts, orgSlug);

  if (!org) {
    return (
      <div className="container-wide py-8 md:py-10">
        <PageHeader eyebrow="Enterprise" title="No organisation yet" />
        <EmptyState className="mt-8" icon={Building2} title="No organisations to manage" description="Create one from the console, or ask partnerships to set up your organisation." action={<ButtonLink href="/enterprise" variant="outline">About enterprise</ButtonLink>} />
      </div>
    );
  }

  const data = await getPortalOverview(org.id, org.seats);
  const q = `?org=${org.slug}`;

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader
        eyebrow="Enterprise portal"
        title={org.name}
        lede={`${org.plan === "ENTERPRISE" ? "Enterprise" : "Team"} plan · ${data.stats.members} of ${org.seats} seats in use${org.domain ? ` · ${org.domain}` : ""}`}
        meta={<OrgSwitcher options={options} current={org.slug} basePath="/enterprise/portal" />}
        actions={<ButtonLink href={`/enterprise/portal/people${q}` as Route} variant="outline">Manage people</ButtonLink>}
      />

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Active this week", value: data.stats.active7d, hint: `of ${data.stats.members} members` },
          { label: "Enrolments", value: data.stats.enrollments, hint: `${data.stats.completions} completed` },
          { label: "Certificates", value: data.stats.certificates, hint: "verifiable" },
          { label: "Average progress", value: `${data.stats.avgProgress}%`, hint: "across active courses" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">{s.label}</dt>
            <dd className="mt-2 font-display text-3xl tabular text-ink">{s.value}</dd>
            <dd className="mt-0.5 text-xs text-ink-subtle">{s.hint}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="courses-title">
          <div className="flex items-baseline justify-between">
            <h2 id="courses-title" className="font-display text-display-sm text-ink">Courses in progress</h2>
            <Link href={`/enterprise/portal/reports${q}` as Route} className="text-sm link">Full report</Link>
          </div>
          {data.courses.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No enrolments yet. Members enrol from the catalog; their progress appears here.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.courses.map((c) => (
                <li key={c.slug} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/courses/${c.slug}`} className="text-[0.9375rem] font-semibold text-ink hover:text-accent">{c.title}</Link>
                    <span className="text-xs tabular text-ink-muted">{c.enrolled} enrolled · {c.completed} completed</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar value={c.avgProgress} label={`${c.title} average progress`} size="sm" />
                    <span className="text-xs tabular text-ink-muted">{c.avgProgress}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="people-title">
            <h2 id="people-title" className="text-sm font-semibold text-ink">People</h2>
            <ul className="mt-3 space-y-3">
              {data.people.map((p) => (
                <li key={p.membershipId} className="flex items-center gap-3">
                  <Avatar name={p.user.name} src={p.user.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.user.name}</p>
                    <p className="truncate text-xs text-ink-muted">{p.activeCourses} active · {p.lastActive ? relativeTime(p.lastActive) : "not started"}</p>
                  </div>
                  <Badge tone={p.role === "OWNER" ? "gold" : p.role === "MANAGER" ? "info" : "neutral"}>{p.role.toLowerCase()}</Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="recent-title">
            <h2 id="recent-title" className="text-sm font-semibold text-ink">Recent activity</h2>
            {data.recent.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">Nothing yet.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {data.recent.map((r, i) => (
                  <li key={i} className="border-t border-line pt-3 text-sm first:border-t-0 first:pt-0">
                    <p className="text-ink"><span className="font-medium">{r.user.name}</span> completed “{r.lesson.title}”</p>
                    <p className="text-xs text-ink-muted">{r.lesson.module.course.title} · {relativeTime(r.updatedAt)}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
