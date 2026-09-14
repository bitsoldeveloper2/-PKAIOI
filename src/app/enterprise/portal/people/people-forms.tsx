"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, RefreshCw } from "lucide-react";
import { portalAddMemberAction, portalRemoveMemberAction, portalRotateInviteAction, portalSetRoleAction, type ActionState } from "@/server/actions/enterprise";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ProgressBar } from "@/components/ui/progress";
import { FormStatus } from "@/components/app/form-status";
import { useToast } from "@/components/ui/toast";
import { relativeTime } from "@/lib/utils";

import { ActionForm } from "@/components/ui/action-form";
type Person = {
  membershipId: string;
  role: "MEMBER" | "MANAGER" | "OWNER";
  user: { id: string; name: string; email: string; avatarUrl: string | null; headline: string | null };
  activeCourses: number;
  completedCourses: number;
  avgProgress: number;
  certificates: number;
  lastActive: Date | null;
  currentCourses: string[];
};

export function PersonRow({ orgId, person: p, isSelf }: { orgId: string; person: Person; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const locked = p.role === "OWNER" || isSelf;
  const run = (fn: () => Promise<void>, success: string) =>
    startTransition(async () => {
      try {
        await fn();
        toast({ title: success, variant: "success" });
        router.refresh();
      } catch (err) {
        toast({ title: "Not allowed", description: (err as Error).message, variant: "error" });
      }
    });

  return (
    <tr className="border-b border-line last:border-b-0" aria-busy={pending}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={p.user.name} src={p.user.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-ink">{p.user.name}{isSelf ? <span className="text-xs text-ink-subtle"> (you)</span> : null}</p>
            <p className="truncate text-xs text-ink-muted">{p.user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {locked ? (
          <Badge tone={p.role === "OWNER" ? "gold" : "info"}>{p.role.toLowerCase()}</Badge>
        ) : (
          <Select aria-label={`Role for ${p.user.name}`} defaultValue={p.role} className="h-8 w-32 text-xs" onChange={(e) => { const fd = new FormData(); fd.set("orgId", orgId); fd.set("membershipId", p.membershipId); fd.set("role", e.target.value); run(() => portalSetRoleAction(fd), "Role updated"); }}>
            <option value="MEMBER">member</option>
            <option value="MANAGER">manager</option>
          </Select>
        )}
      </td>
      <td className="px-4 py-3 text-ink-muted">
        <span className="tabular">{p.activeCourses} active · {p.completedCourses} done</span>
        {p.currentCourses.length ? <p className="max-w-56 truncate text-xs text-ink-subtle" title={p.currentCourses.join(", ")}>{p.currentCourses.join(", ")}</p> : null}
      </td>
      <td className="px-4 py-3"><div className="flex items-center gap-2"><ProgressBar value={p.avgProgress} label={`${p.user.name} progress`} size="sm" className="w-24" /><span className="tabular text-ink-muted">{p.avgProgress}%</span></div></td>
      <td className="px-4 py-3 text-right tabular text-ink">{p.certificates}</td>
      <td className="px-4 py-3 text-ink-muted">{p.lastActive ? relativeTime(p.lastActive) : "—"}</td>
      <td className="px-4 py-3 text-right">
        {!locked ? (
          <Button size="sm" variant="ghost" className="text-danger" onClick={() => { if (!confirm(`Remove ${p.user.name}? Their learning record is kept.`)) return; const fd = new FormData(); fd.set("orgId", orgId); fd.set("membershipId", p.membershipId); run(() => portalRemoveMemberAction(fd), "Member removed"); }}>Remove</Button>
        ) : null}
      </td>
    </tr>
  );
}

export function AddMemberForm({ orgId }: { orgId: string }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(portalAddMemberAction, undefined);
  const errors = state?.errors ?? {};
  return (
    <ActionForm action={action} className="rounded-xl border border-line bg-surface p-5" noValidate>
      <input type="hidden" name="orgId" value={orgId} />
      <h2 className="text-sm font-semibold text-ink">Add a member</h2>
      <FormStatus state={state} className="mt-3" />
      <Field label="Campus account email" error={errors.email} className="mt-3">{(b) => <Input {...b} name="email" type="email" />}</Field>
      <Field label="Role" error={errors.role} className="mt-3">{(b) => (
        <Select {...b} name="role" defaultValue="MEMBER">
          <option value="MEMBER">Member (learner)</option>
          <option value="MANAGER">Manager (portal access)</option>
        </Select>
      )}</Field>
      <Button type="submit" className="mt-4 w-full" loading={pending}>Add member</Button>
    </ActionForm>
  );
}

export function InviteCard({ orgId, inviteCode, seatsLeft }: { orgId: string; inviteCode: string; seatsLeft: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">Invite code</h2>
      <p className="mt-2 font-mono text-lg text-ink">{inviteCode}</p>
      <p className="mt-1 text-xs text-ink-muted">New colleagues enter this when they register at pioai.edu.pk/register. {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left.</p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/register?invite=${inviteCode}`); toast({ title: "Invite link copied", variant: "success" }); } catch { toast({ title: "Could not copy", variant: "error" }); } }}><Copy className="size-3.5" aria-hidden />Copy link</Button>
        <Button size="sm" variant="ghost" loading={pending} onClick={() => { if (!confirm("Rotate the invite code? The old one stops working immediately.")) return; const fd = new FormData(); fd.set("orgId", orgId); startTransition(async () => { await portalRotateInviteAction(fd); toast({ title: "Invite code rotated", variant: "success" }); router.refresh(); }); }}><RefreshCw className="size-3.5" aria-hidden />Rotate</Button>
      </div>
    </div>
  );
}
