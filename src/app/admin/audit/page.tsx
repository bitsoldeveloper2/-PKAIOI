import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { requirePermission } from "@/server/auth/dal";
import { listAuditLog } from "@/server/queries/admin";
import { PageHeader } from "@/components/ui/section-heading";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const [, params] = await Promise.all([requirePermission("audit:read", "/admin/audit"), searchParams]);
  const q = params.q?.trim().slice(0, 80) || undefined;
  const { entries, total, page, pages } = await listAuditLog({ q, page: Number(params.page) || 1 });

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Platform" title="Audit log" lede={`${total} entries. Every privileged action is recorded with actor, target and origin address; entries are append-only.`} />

      <form className="mt-8 flex gap-3" action="/admin/audit" method="get">
        <label htmlFor="audit-q" className="sr-only">Search actions</label>
        <Input id="audit-q" name="q" defaultValue={q} placeholder="Filter by action, entity or id (e.g. auth.login, Course)" className="max-w-md" />
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-line align-top last:border-b-0">
                <td className="whitespace-nowrap px-4 py-2.5 text-ink-muted tabular">{formatDateTime(e.createdAt)}</td>
                <td className="px-4 py-2.5 text-ink">{e.actor ? <span title={e.actor.email}>{e.actor.name}</span> : <span className="text-ink-subtle">system</span>}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-ink">{e.action}</td>
                <td className="px-4 py-2.5 text-ink-muted">{e.entity}{e.entityId ? <span className="font-mono text-xs"> · {e.entityId}</span> : null}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-ink-subtle">{e.meta ? JSON.stringify(e.meta).slice(0, 120) : ""}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-ink-subtle">{e.ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav className="mt-4 flex items-center justify-between text-sm text-ink-muted" aria-label="Pagination">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 ? <Link href={`/admin/audit?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}` as Route} className="rounded-md border border-line px-3 py-1.5 hover:bg-surface-2">Previous</Link> : null}
            {page < pages ? <Link href={`/admin/audit?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}` as Route} className="rounded-md border border-line px-3 py-1.5 hover:bg-surface-2">Next</Link> : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
