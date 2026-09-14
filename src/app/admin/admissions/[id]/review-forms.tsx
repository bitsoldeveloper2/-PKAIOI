"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addApplicationNoteAction, assignReviewerAction, scoreApplicationAction, updateApplicationStatusAction, type ActionState } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/app/form-status";
import { useToast } from "@/components/ui/toast";
import { STATUSES, statusLabel } from "../constants";

export function ReviewForms({ applicationId, status, score, reviewNotes, reviewerId, reviewers }: { applicationId: string; status: string; score: number | null; reviewNotes: string; reviewerId: string; reviewers: { id: string; name: string }[] }) {
  const [scoreState, scoreAction, scoring] = useActionState<ActionState | undefined, FormData>(scoreApplicationAction, undefined);
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
    <aside className="space-y-5" aria-busy={pending}>
      <form className="rounded-xl border border-line bg-surface p-5" action={(fd) => run(() => updateApplicationStatusAction(fd), "Status updated")}>
        <input type="hidden" name="applicationId" value={applicationId} />
        <h2 className="text-sm font-semibold text-ink">Decision</h2>
        <Field label="Status" className="mt-3">{(b) => (
          <Select {...b} name="status" defaultValue={status}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </Select>
        )}</Field>
        <Field label="Note to timeline" className="mt-3" hint="Optional; visible to staff only.">{(b) => <Input {...b} name="note" maxLength={1000} />}</Field>
        <Button type="submit" className="mt-4 w-full" loading={pending}>Apply status</Button>
      </form>

      <form className="rounded-xl border border-line bg-surface p-5" action={scoreAction} noValidate>
        <input type="hidden" name="applicationId" value={applicationId} />
        <h2 className="text-sm font-semibold text-ink">Review</h2>
        <FormStatus state={scoreState} className="mt-3" />
        <Field label="Score (0–100)" error={scoreState?.errors?.score} className="mt-3">{(b) => <Input {...b} name="score" type="number" min={0} max={100} defaultValue={score ?? ""} />}</Field>
        <Field label="Reviewer notes" error={scoreState?.errors?.reviewNotes} className="mt-3">{(b) => <Textarea {...b} name="reviewNotes" defaultValue={reviewNotes} rows={5} />}</Field>
        <Button type="submit" variant="outline" className="mt-4 w-full" loading={scoring}>Save review</Button>
      </form>

      <form className="rounded-xl border border-line bg-surface p-5" action={(fd) => run(() => assignReviewerAction(fd), "Reviewer updated")}>
        <input type="hidden" name="applicationId" value={applicationId} />
        <h2 className="text-sm font-semibold text-ink">Reviewer</h2>
        <Field label="Assigned to" className="mt-3">{(b) => (
          <Select {...b} name="reviewerId" defaultValue={reviewerId}>
            <option value="">Unassigned</option>
            {reviewers.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
        )}</Field>
        <Button type="submit" variant="outline" className="mt-4 w-full" loading={pending}>Assign</Button>
      </form>

      <form className="rounded-xl border border-line bg-surface p-5" action={(fd) => run(() => addApplicationNoteAction(fd), "Note added")}>
        <input type="hidden" name="applicationId" value={applicationId} />
        <h2 className="text-sm font-semibold text-ink">Add a note</h2>
        <Field label="Note" className="mt-3">{(b) => <Textarea {...b} name="body" rows={3} required maxLength={2000} />}</Field>
        <Button type="submit" variant="ghost" className="mt-3 w-full" loading={pending}>Post note</Button>
      </form>
    </aside>
  );
}
