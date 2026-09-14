import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ShieldCheck } from "lucide-react";
import { requireEnterpriseManager } from "@/server/auth/dal";
import { getPortalGovernance, resolvePortalOrg } from "@/server/queries/enterprise";
import { PageHeader } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { OrgSwitcher } from "../org-switcher";

export const metadata: Metadata = { title: "Governance" };

const STATUS_TONE: Record<string, "success" | "info" | "neutral"> = { COMPLETED: "success", ACTIVE: "info", NOT_STARTED: "neutral", DROPPED: "neutral" };

export default async function PortalGovernancePage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const [{ user, contexts }, { org: orgSlug }] = await Promise.all([requireEnterpriseManager("/enterprise/portal/governance"), searchParams]);
  const { org, options } = await resolvePortalOrg(user, contexts, orgSlug);
  if (!org) {
    return (
      <div className="container-wide py-8 md:py-10">
        <EmptyState icon={Building2} title="No organisation to manage" />
      </div>
    );
  }
  const g = await getPortalGovernance(org.id);
  const completed = g.roster.filter((r) => r.status === "COMPLETED").length;
  const pct = g.roster.length ? Math.round((completed / g.roster.length) * 100) : 0;

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow={org.name} title="Governance" lede="The institute asks every enterprise cohort to complete the safety, alignment and governance course. This page tracks it, and summarises how the platform handles your data." meta={<OrgSwitcher options={options} current={org.slug} basePath="/enterprise/portal/governance" />} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section className="overflow-x-auto rounded-xl border border-line bg-surface" aria-labelledby="roster-title">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 id="roster-title" className="inline-flex items-center gap-2 text-sm font-semibold text-ink"><ShieldCheck className="size-4 text-accent" aria-hidden />{g.governanceCourse?.title ?? "Governance course"}</h2>
            <span className="text-xs tabular text-ink-muted">{completed}/{g.roster.length} complete · {pct}%</span>
          </div>
          <div className="px-4 py-3"><ProgressBar value={pct} label="Governance course completion" /></div>
          <table className="w-full min-w-[36rem] text-sm">
            <thead><tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted"><th className="px-4 py-3">Member</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Progress</th></tr></thead>
            <tbody>
              {g.roster.map((r) => (
                <tr key={r.email} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3"><p className="font-medium text-ink">{r.name}</p><p className="text-xs text-ink-muted">{r.email}</p></td>
                  <td className="px-4 py-3 text-ink-muted">{r.role.toLowerCase()}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status.replace("_", " ").toLowerCase()}</Badge></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><ProgressBar value={r.progress} label={`${r.name} progress`} size="sm" className="w-24" /><span className="tabular text-ink-muted">{r.progress}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {g.governanceCourse ? (
            <p className="border-t border-line px-4 py-3 text-xs text-ink-muted">Members enrol from the <Link href={`/courses/${g.governanceCourse.slug}`} className="text-accent hover:underline">course page</Link>; completion issues a verifiable certificate.</p>
          ) : null}
        </section>

        <aside className="space-y-5 text-sm">
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="data-title">
            <h2 id="data-title" className="font-semibold text-ink">How the platform handles your data</h2>
            <ul className="mt-3 space-y-2 text-ink-muted">
              <li>· Managers see progress and completion for members of this organisation only.</li>
              <li>· Learners’ notes and tutor conversations are private to them and never shown here.</li>
              <li>· Certificates are verifiable by code without an account.</li>
              <li>· AI tutor conversations are processed under a data-processing agreement and are not used to train models.</li>
              <li>· Sessions are revocable; privileged actions are logged.</li>
            </ul>
          </section>
          <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="policy-title">
            <h2 id="policy-title" className="font-semibold text-ink">Recommended internal policy</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-muted">
              <li>Name an accountable owner for each AI system in production.</li>
              <li>Require an evaluation on your own data before procurement.</li>
              <li>Keep a use-case register and an incident playbook.</li>
              <li>Provide an appeals path for people affected by automated decisions.</li>
            </ol>
            <p className="mt-3 text-xs text-ink-subtle">Adapted from the institute’s public-sector evaluation guide.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
