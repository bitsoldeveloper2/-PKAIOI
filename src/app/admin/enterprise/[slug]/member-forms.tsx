"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addOrganizationMemberAction, removeMembershipAction, setMembershipRoleAction, type ActionState } from "@/server/actions/admin";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { FormStatus } from "@/components/app/form-status";
import { useToast } from "@/components/ui/toast";
import { relativeTime } from "@/lib/utils";

import { ActionForm } from "@/components/ui/action-form";
export function MemberForms({ orgId }: { orgId: string }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(addOrganizationMemberAction, undefined);
  const errors = state?.errors ?? {};
  return (
    <ActionForm action={action} className="rounded-xl border border-line bg-surface p-5" noValidate>
      <input type="hidden" name="orgId" value={orgId} />
      <h2 className="text-sm font-semibold text-ink">Add a member</h2>
      <FormStatus state={state} className="mt-3" />
      <Field label="Account email" error={errors.email} className="mt-3" hint="They must already have a campus account.">{(b) => <Input {...b} name="email" type="email" />}</Field>
      <Field label="Role" error={errors.role} className="mt-3">{(b) => (
        <Select {...b} name="role" defaultValue="MEMBER">
          <option value="MEMBER">Member (learner)</option>
          <option value="MANAGER">Manager (portal access)</option>
          <option value="OWNER">Owner</option>
        </Select>
      )}</Field>
      <Button type="submit" className="mt-4 w-full" loading={pending}>Add member</Button>
    </ActionForm>
  );
}

export function MemberRow({ membershipId, role, user, stats }: { membershipId: string; role: string; user: { id: string; name: string; email: string; avatarUrl: string | null; headline: string | null; lastLoginAt: Date | null }; stats: { active: number; completed: number; certificates: number; lastActive: Date | null; lessons: number } }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const run = (fn: () => Promise<void>, success: string) =>
    startTransition(async () => {
      try {
        await fn();
        toast({ title: success, variant: "success" });
        router.refresh();
      } catch (err) {
        toast({ title: "Could not update", description: (err as Error).message, variant: "error" });
      }
    });

  return (
    <tr className="border-b border-line last:border-b-0" aria-busy={pending}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Select
          aria-label={`Role for ${user.name}`}
          defaultValue={role}
          className="h-8 w-32 text-xs"
          onChange={(e) => {
            const fd = new FormData();
            fd.set("membershipId", membershipId);
            fd.set("role", e.target.value);
            run(() => setMembershipRoleAction(fd), "Role updated");
          }}
        >
          <option value="MEMBER">member</option>
          <option value="MANAGER">manager</option>
          <option value="OWNER">owner</option>
        </Select>
      </td>
      <td className="px-4 py-3 text-right tabular text-ink">{stats.active}</td>
      <td className="px-4 py-3 text-right tabular text-ink">{stats.completed}</td>
      <td className="px-4 py-3 text-right tabular text-ink">{stats.lessons}</td>
      <td className="px-4 py-3 text-ink-muted">{stats.lastActive ? relativeTime(stats.lastActive) : "—"}</td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="ghost"
          className="text-danger"
          onClick={() => {
            if (!confirm(`Remove ${user.name} from the organisation? Their enrolments are kept.`)) return;
            const fd = new FormData();
            fd.set("membershipId", membershipId);
            run(() => removeMembershipAction(fd), "Member removed");
          }}
        >
          Remove
        </Button>
      </td>
    </tr>
  );
}
