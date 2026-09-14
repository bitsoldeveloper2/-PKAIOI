"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { contactAction, type ActionState } from "@/server/actions/leads";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

import { ActionForm } from "@/components/ui/action-form";
export function ContactForm() {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(contactAction, undefined);

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-success/30 bg-success-soft p-8" role="status">
        <CheckCircle2 className="size-7 text-success" aria-hidden />
        <p className="mt-4 text-[1.0625rem] text-ink">{state.message}</p>
      </div>
    );
  }
  const errors = state?.errors ?? {};

  return (
    <ActionForm action={action} className="space-y-5 rounded-xl border border-line bg-surface p-6 md:p-8" noValidate>
      {state?.message && !state.ok ? <div role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{state.message}</div> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name} required>{(b) => <Input {...b} name="name" autoComplete="name" />}</Field>
        <Field label="Email" error={errors.email} required>{(b) => <Input {...b} name="email" type="email" autoComplete="email" />}</Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organisation" error={errors.organization}>{(b) => <Input {...b} name="organization" autoComplete="organization" />}</Field>
        <Field label="I’m asking about" error={errors.interest} required>
          {(b) => (
            <Select {...b} name="interest" defaultValue="program">
              <option value="program">A program</option>
              <option value="course">A course</option>
              <option value="enterprise">Enterprise training</option>
              <option value="research">Research collaboration</option>
              <option value="media">Media</option>
              <option value="other">Something else</option>
            </Select>
          )}
        </Field>
      </div>
      <Field label="Message" error={errors.message} required>{(b) => <Textarea {...b} name="message" rows={6} />}</Field>
      <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">Send message</Button>
    </ActionForm>
  );
}
