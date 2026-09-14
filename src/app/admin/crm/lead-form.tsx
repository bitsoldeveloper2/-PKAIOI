"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { upsertLeadAction, type ActionState } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/app/form-status";

import { ActionForm } from "@/components/ui/action-form";
type LeadValues = { id: string; name: string; email: string; phone: string; organization: string; role: string; source: string; interest: string; stage: string; value: number | null; message: string };

export function LeadForm({ trigger, lead }: { trigger: "new" | "edit"; lead?: LeadValues }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertLeadAction, undefined);
  const router = useRouter();
  const errors = state?.errors ?? {};

  const [handledState, setHandledState] = useState<ActionState | undefined>(undefined);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.ok) setOpen(false);
  }
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <>
      <Button variant={trigger === "new" ? "primary" : "outline"} size={trigger === "new" ? "md" : "sm"} onClick={() => setOpen(true)}>
        {trigger === "new" ? <Plus className="size-4" aria-hidden /> : <Pencil className="size-3.5" aria-hidden />}
        {trigger === "new" ? "New lead" : "Edit"}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={trigger === "new" ? "New lead" : "Edit lead"} size="lg">
        <ActionForm action={action} className="space-y-5" noValidate>
          {lead ? <input type="hidden" name="leadId" value={lead.id} /> : null}
          <FormStatus state={state} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" error={errors.name} required>{(b) => <Input {...b} name="name" defaultValue={lead?.name} autoFocus />}</Field>
            <Field label="Email" error={errors.email} required>{(b) => <Input {...b} name="email" type="email" defaultValue={lead?.email} />}</Field>
            <Field label="Phone" error={errors.phone}>{(b) => <Input {...b} name="phone" defaultValue={lead?.phone} />}</Field>
            <Field label="Organisation" error={errors.organization}>{(b) => <Input {...b} name="organization" defaultValue={lead?.organization} />}</Field>
            <Field label="Role" error={errors.role}>{(b) => <Input {...b} name="role" defaultValue={lead?.role} />}</Field>
            <Field label="Source" error={errors.source} required>{(b) => <Input {...b} name="source" defaultValue={lead?.source ?? "Manual"} />}</Field>
            <Field label="Interest" error={errors.interest}>{(b) => <Input {...b} name="interest" defaultValue={lead?.interest} placeholder="Program, course or enterprise" />}</Field>
            <Field label="Stage" error={errors.stage}>{(b) => (
              <Select {...b} name="stage" defaultValue={lead?.stage ?? "NEW"}>
                {["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"].map((s) => (
                  <option key={s} value={s}>{s.toLowerCase()}</option>
                ))}
              </Select>
            )}</Field>
            <Field label="Value (PKR)" error={errors.value}>{(b) => <Input {...b} name="value" type="number" min={0} defaultValue={lead?.value ?? ""} />}</Field>
          </div>
          <Field label="Notes" error={errors.message}>{(b) => <Textarea {...b} name="message" defaultValue={lead?.message} rows={4} />}</Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={pending}>{trigger === "new" ? "Create lead" : "Save changes"}</Button>
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
