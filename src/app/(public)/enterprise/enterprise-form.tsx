"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { enterpriseInquiryAction, type ActionState } from "@/server/actions/leads";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

import { ActionForm } from "@/components/ui/action-form";
export function EnterpriseForm() {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(enterpriseInquiryAction, undefined);

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
        <Field label="Your name" error={errors.name} required>{(b) => <Input {...b} name="name" autoComplete="name" />}</Field>
        <Field label="Work email" error={errors.email} required>{(b) => <Input {...b} name="email" type="email" autoComplete="email" />}</Field>
        <Field label="Organisation" error={errors.organization} required>{(b) => <Input {...b} name="organization" autoComplete="organization" />}</Field>
        <Field label="Your role" error={errors.role}>{(b) => <Input {...b} name="role" autoComplete="organization-title" />}</Field>
      </div>
      <Field label="How many people would you like to train?" error={errors.teamSize} required>
        {(b) => (
          <Select {...b} name="teamSize" defaultValue="11-50">
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="201-1000">201–1,000</option>
            <option value="1000+">More than 1,000</option>
          </Select>
        )}
      </Field>
      <Field label="What are you trying to achieve?" error={errors.message} hint="Optional, but the more specific the better.">
        {(b) => <Textarea {...b} name="message" rows={4} />}
      </Field>
      <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">Request a proposal</Button>
    </ActionForm>
  );
}
