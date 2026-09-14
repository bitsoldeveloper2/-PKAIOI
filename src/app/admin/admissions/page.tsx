import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ClipboardList } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { listApplications } from "@/server/queries/admin";
import { listProgramOptions } from "@/server/queries/academy";
import { PageHeader } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { levelLabel } from "@/components/site/cards";
import { formatDate } from "@/lib/utils";
import type { ApplicationStatus } from "@/generated/prisma/enums";
import { STATUSES, STATUS_TONE, statusLabel } from "./constants";

export const metadata: Metadata = { title: "Admissions" };

export default async function AdmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string; program?: string; q?: string }> }) {
  const [, params] = await Promise.all([requirePermission("admissions:manage", "/admin/admissions"), searchParams]);
  const status = params.status && (STATUSES as string[]).includes(params.status) ? (params.status as ApplicationStatus) : undefined;
  const q = params.q?.trim().slice(0, 80) || undefined;
  const [applications, programs] = await Promise.all([listApplications({ status, programId: params.program || undefined, q }), listProgramOptions()]);
  const counts = STATUSES.map((s) => ({ s, n: applications.filter((a) => a.status === s).length }));

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Institution" title="Admissions" lede="Applications move from submitted to review, interview and decision. Every change is timestamped on the application." />

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        <Link href="/admin/admissions" className={`rounded-full px-3 py-1 text-sm ${!status ? "bg-ink text-bg" : "border border-line-strong text-ink-muted hover:text-ink"}`}>All</Link>
        {counts.map(({ s, n }) => (
          <Link key={s} href={`/admin/admissions?status=${s}` as Route} className={`rounded-full px-3 py-1 text-sm ${status === s ? "bg-ink text-bg" : "border border-line-strong text-ink-muted hover:text-ink"}`}>
            {statusLabel(s)} {!status ? <span className="tabular opacity-60">{n}</span> : null}
          </Link>
        ))}
      </div>

      <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" action="/admin/admissions" method="get">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="flex-1">
          <label htmlFor="adm-q" className="text-sm font-medium text-ink">Search</label>
          <Input id="adm-q" name="q" defaultValue={q} placeholder="Name, email or city" className="mt-1" />
        </div>
        <div className="sm:w-72">
          <label htmlFor="adm-program" className="text-sm font-medium text-ink">Program</label>
          <Select id="adm-program" name="program" defaultValue={params.program ?? ""} className="mt-1">
            <option value="">All programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {applications.length === 0 ? (
        <EmptyState className="mt-8" icon={ClipboardList} title="No applications match" />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[60rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3">Reviewer</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <Link href={`/admin/admissions/${a.id}` as Route} className="font-medium text-ink hover:text-accent">{a.firstName} {a.lastName}</Link>
                    <p className="text-xs text-ink-muted">{a.email} · {a.city}, {a.country}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{a.program.title}<span className="block text-xs">{levelLabel(a.program.level)}</span></td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[a.status]}>{statusLabel(a.status)}</Badge></td>
                  <td className="px-4 py-3 text-right tabular text-ink">{a.score ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{a.reviewer?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
