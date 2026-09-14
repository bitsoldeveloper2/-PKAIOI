"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { upsertOrganizationAction, type ActionState } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { FormStatus } from "@/components/app/form-status";

import { ActionForm } from "@/components/ui/action-form";
type OrgValues = { id: string; name: string; domain: string; plan: string; seats: number };

export function OrgForm({ trigger, org }: { trigger: "new" | "edit"; org?: OrgValues }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertOrganizationAction, undefined);
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
        {trigger === "new" ? "New organisation" : "Edit"}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={trigger === "new" ? "New organisation" : "Edit organisation"}>
        <ActionForm action={action} className="space-y-5" noValidate>
          {org ? <input type="hidden" name="orgId" value={org.id} /> : null}
          <FormStatus state={state} />
          <Field label="Name" error={errors.name} required>{(b) => <Input {...b} name="name" defaultValue={org?.name} autoFocus />}</Field>
          <Field label="Email domain" error={errors.domain} hint="Optional; shown on the portal.">{(b) => <Input {...b} name="domain" defaultValue={org?.domain} placeholder="company.com" />}</Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Plan" error={errors.plan} required>{(b) => (
              <Select {...b} name="plan" defaultValue={org?.plan ?? "TEAM"}>
                <option value="TEAM">Team</option>
                <option value="ENTERPRISE">Enterprise</option>
              </Select>
            )}</Field>
            <Field label="Seats" error={errors.seats} required>{(b) => <Input {...b} name="seats" type="number" min={1} max={100000} defaultValue={org?.seats ?? 25} />}</Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={pending}>{trigger === "new" ? "Create" : "Save"}</Button>
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
