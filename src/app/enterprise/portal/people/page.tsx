import type { Metadata } from "next";
import { requireEnterpriseManager } from "@/server/auth/dal";
import { getPortalPeople, resolvePortalOrg } from "@/server/queries/enterprise";
import { PageHeader } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";
import { OrgSwitcher } from "../org-switcher";
import { AddMemberForm, InviteCard, PersonRow } from "./people-forms";

export const metadata: Metadata = { title: "People" };

export default async function PortalPeoplePage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const [{ user, contexts }, { org: orgSlug }] = await Promise.all([requireEnterpriseManager("/enterprise/portal/people"), searchParams]);
  const { org, options } = await resolvePortalOrg(user, contexts, orgSlug);
  if (!org) {
    return (
      <div className="container-wide py-8 md:py-10">
        <EmptyState icon={Building2} title="No organisation to manage" />
      </div>
    );
  }
  const people = await getPortalPeople(org.id);

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow={org.name} title="People" lede={`${people.length} of ${org.seats} seats in use. Managers can add members with an existing campus account, or share the invite code.`} meta={<OrgSwitcher options={options} current={org.slug} basePath="/enterprise/portal/people" />} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section className="overflow-x-auto rounded-xl border border-line bg-surface" aria-label="Members">
          <table className="w-full min-w-[56rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3 text-right">Certificates</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <PersonRow key={p.membershipId} orgId={org.id} person={p} isSelf={p.user.id === user.id} />
              ))}
            </tbody>
          </table>
        </section>
        <aside className="space-y-5">
          <AddMemberForm orgId={org.id} />
          <InviteCard orgId={org.id} inviteCode={org.inviteCode} seatsLeft={Math.max(0, org.seats - people.length)} />
        </aside>
      </div>
    </div>
  );
}
