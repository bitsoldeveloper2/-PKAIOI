import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/dal";
import { getLead, listReviewers } from "@/server/queries/admin";
import { assignLeadOwnerAction, updateLeadStageFormAction } from "@/server/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { formatDateTime, formatPkr } from "@/lib/utils";
import { LeadForm } from "../lead-form";
import { LeadActivityForm } from "./lead-activity-form";

export const metadata: Metadata = { title: "Lead" };

const STAGES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;
const STAGE_TONE: Record<string, "neutral" | "info" | "warning" | "gold" | "success" | "outline"> = { NEW: "neutral", CONTACTED: "info", QUALIFIED: "warning", PROPOSAL: "gold", WON: "success", LOST: "outline" };
const TYPE_LABEL: Record<string, string> = { NOTE: "Note", CALL: "Call", EMAIL: "Email", MEETING: "Meeting", STAGE: "Stage change" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [, lead, staff] = await Promise.all([requirePermission("crm:manage", `/admin/crm/${id}`), getLead(id), listReviewers()]);
  if (!lead) notFound();

  return (
    <div className="container-wide py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/admin/crm" className="hover:text-ink">CRM</Link> <span aria-hidden>/</span> {lead.name}
      </nav>
      <header className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-ink">{lead.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {lead.organization ?? "Individual"}{lead.role ? ` · ${lead.role}` : ""} · <a href={`mailto:${lead.email}`} className="text-accent hover:underline">{lead.email}</a>{lead.phone ? ` · ${lead.phone}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={STAGE_TONE[lead.stage] ?? "neutral"}>{lead.stage.toLowerCase()}</Badge>
          {lead.value ? <Badge tone="outline">{formatPkr(lead.value)}</Badge> : null}
          <LeadForm
            trigger="edit"
            lead={{ id: lead.id, name: lead.name, email: lead.email, phone: lead.phone ?? "", organization: lead.organization ?? "", role: lead.role ?? "", source: lead.source, interest: lead.interest ?? "", stage: lead.stage, value: lead.value, message: lead.message ?? "" }}
          />
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {lead.message ? (
            <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="msg">
              <h2 id="msg" className="eyebrow">Original message</h2>
              <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] text-ink">{lead.message}</p>
            </section>
          ) : null}
          <LeadActivityForm leadId={lead.id} />
          <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="activity">
            <h2 id="activity" className="eyebrow">Activity</h2>
            {lead.activities.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No activity yet.</p>
            ) : (
              <ol className="mt-4 space-y-4">
                {lead.activities.map((a) => (
                  <li key={a.id} className="flex gap-3 text-sm">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                    <div className="min-w-0">
                      <p className="whitespace-pre-wrap text-ink">{a.body}</p>
                      <p className="text-xs text-ink-muted">{TYPE_LABEL[a.type] ?? a.type} · {a.author?.name ?? "System"} · {formatDateTime(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <form action={updateLeadStageFormAction} className="rounded-xl border border-line bg-surface p-5">
            <input type="hidden" name="leadId" value={lead.id} />
            <label htmlFor="lead-stage" className="text-sm font-semibold text-ink">Stage</label>
            <Select id="lead-stage" name="stage" defaultValue={lead.stage} className="mt-2">
              {STAGES.map((s) => (
                <option key={s} value={s}>{s.toLowerCase()}</option>
              ))}
            </Select>
            <Button type="submit" className="mt-3 w-full">Update stage</Button>
          </form>
          <form action={assignLeadOwnerAction} className="rounded-xl border border-line bg-surface p-5">
            <input type="hidden" name="leadId" value={lead.id} />
            <label htmlFor="lead-owner" className="text-sm font-semibold text-ink">Owner</label>
            <Select id="lead-owner" name="ownerId" defaultValue={lead.owner?.id ?? ""} className="mt-2">
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
            <Button type="submit" variant="outline" className="mt-3 w-full">Assign</Button>
          </form>
          <dl className="rounded-xl border border-line bg-surface p-5 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-ink-muted">Source</dt><dd className="text-ink">{lead.source}</dd></div>
            <div className="mt-2 flex justify-between gap-3"><dt className="text-ink-muted">Interest</dt><dd className="text-right text-ink">{lead.interest ?? "—"}</dd></div>
            <div className="mt-2 flex justify-between gap-3"><dt className="text-ink-muted">Created</dt><dd className="text-ink">{formatDateTime(lead.createdAt)}</dd></div>
            <div className="mt-2 flex justify-between gap-3"><dt className="text-ink-muted">Updated</dt><dd className="text-ink">{formatDateTime(lead.updatedAt)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
