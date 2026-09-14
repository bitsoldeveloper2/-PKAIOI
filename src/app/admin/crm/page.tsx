import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/dal";
import { listLeads, listReviewers } from "@/server/queries/admin";
import { PageHeader } from "@/components/ui/section-heading";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { formatPkr } from "@/lib/utils";
import { CrmBoard } from "./crm-board";
import { LeadForm } from "./lead-form";

export const metadata: Metadata = { title: "CRM" };

export default async function CrmPage({ searchParams }: { searchParams: Promise<{ q?: string; owner?: string }> }) {
  const [, params] = await Promise.all([requirePermission("crm:manage", "/admin/crm"), searchParams]);
  const q = params.q?.trim().slice(0, 80) || undefined;
  const [leads, staff] = await Promise.all([listLeads({ q, ownerId: params.owner || undefined }), listReviewers()]);
  const open = leads.filter((l) => l.stage !== "WON" && l.stage !== "LOST");
  const pipeline = open.reduce((n, l) => n + (l.value ?? 0), 0);

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader
        eyebrow="Institution"
        title="CRM"
        lede={`${open.length} open leads · ${formatPkr(pipeline)} in pipeline. Drag cards between stages; every move is logged on the lead.`}
        actions={<LeadForm trigger="new" />}
      />

      <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end" action="/admin/crm" method="get">
        <div className="flex-1">
          <label htmlFor="crm-q" className="text-sm font-medium text-ink">Search</label>
          <Input id="crm-q" name="q" defaultValue={q} placeholder="Name, email or organisation" className="mt-1" />
        </div>
        <div className="sm:w-60">
          <label htmlFor="crm-owner" className="text-sm font-medium text-ink">Owner</label>
          <Select id="crm-owner" name="owner" defaultValue={params.owner ?? ""} className="mt-1">
            <option value="">Anyone</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      <div className="mt-6">
        <CrmBoard
          leads={leads.map((l) => ({
            id: l.id,
            name: l.name,
            organization: l.organization,
            interest: l.interest,
            source: l.source,
            stage: l.stage,
            value: l.value,
            owner: l.owner?.name ?? null,
            activities: l._count.activities,
            updatedAt: l.updatedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
