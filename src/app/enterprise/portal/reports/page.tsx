import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Building2 } from "lucide-react";
import { requireEnterpriseManager } from "@/server/auth/dal";
import { getPortalReports, resolvePortalOrg } from "@/server/queries/enterprise";
import { PageHeader } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart, ChartFrame, HBars } from "@/components/charts/charts";
import { formatDate } from "@/lib/utils";
import { OrgSwitcher } from "../org-switcher";

export const metadata: Metadata = { title: "Reports" };

export default async function PortalReportsPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const [{ user, contexts }, { org: orgSlug }] = await Promise.all([requireEnterpriseManager("/enterprise/portal/reports"), searchParams]);
  const { org, options } = await resolvePortalOrg(user, contexts, orgSlug);
  if (!org) {
    return (
      <div className="container-wide py-8 md:py-10">
        <EmptyState icon={Building2} title="No organisation to manage" />
      </div>
    );
  }
  const r = await getPortalReports(org.id);
  const labels = r.weeks.map((w) => w.label);

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow={org.name} title="Reports" lede="Twelve weeks of activity, completion by course, and every certificate earned by your people." meta={<OrgSwitcher options={options} current={org.slug} basePath="/enterprise/portal/reports" />} />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ChartFrame
          title="Enrolments and lesson completions"
          description="Per week, last twelve weeks."
          labels={labels}
          series={[
            { name: "Enrolments", values: r.weeks.map((w) => w.enrollments) },
            { name: "Lessons completed", values: r.weeks.map((w) => w.completions) },
          ]}
          className="lg:col-span-2"
        >
          <BarChart labels={labels} series={[{ name: "Enrolments", values: r.weeks.map((w) => w.enrollments) }, { name: "Lessons completed", values: r.weeks.map((w) => w.completions) }]} height={220} />
        </ChartFrame>

        <ChartFrame title="Completion rate by course" description="Share of enrolments that finished." labels={r.courses.map((c) => c.title)} series={[{ name: "Completion %", values: r.courses.map((c) => c.completionRate) }]}>
          <HBars labels={r.courses.map((c) => c.title)} values={r.courses.map((c) => c.completionRate)} max={100} unit="%" />
        </ChartFrame>

        <ChartFrame title="Average progress by course" description="Mean progress across all enrolled members." labels={r.courses.map((c) => c.title)} series={[{ name: "Progress %", values: r.courses.map((c) => c.avgProgress) }]}>
          <HBars labels={r.courses.map((c) => c.title)} values={r.courses.map((c) => c.avgProgress)} max={100} unit="%" tone={1} />
        </ChartFrame>
      </div>

      <section className="mt-8 overflow-x-auto rounded-xl border border-line bg-surface" aria-labelledby="certs-title">
        <h2 id="certs-title" className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">Certificates earned</h2>
        {r.certificates.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">No certificates yet.</p>
        ) : (
          <table className="w-full min-w-[40rem] text-sm">
            <thead><tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted"><th className="px-4 py-3">Member</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Grade</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Code</th></tr></thead>
            <tbody>
              {r.certificates.map((c) => (
                <tr key={c.code} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 text-ink">{c.user.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{c.course.title}</td>
                  <td className="px-4 py-3 text-ink-muted">{c.grade ?? "Pass"}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(c.issuedAt)}</td>
                  <td className="px-4 py-3"><Link href={`/verify/${c.code}` as Route} className="font-mono text-xs text-accent hover:underline">{c.code}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
