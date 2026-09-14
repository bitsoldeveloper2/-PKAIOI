"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { ActionForm } from "@/components/ui/action-form";
const TIMEZONES = ["Asia/Karachi", "Asia/Dubai", "Asia/Riyadh", "Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles", "Asia/Singapore", "Australia/Sydney"];

export function ProfileForm({ defaults, className }: { defaults: { name: string; headline: string; bio: string; timezone: string }; className?: string }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(updateProfileAction, undefined);
  const errors = state?.errors ?? {};
  return (
    <ActionForm action={action} className={cn("space-y-5", className)} noValidate>
      {state?.message ? (
        <p role="status" className={cn("rounded-md px-3.5 py-2.5 text-sm", state.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>{state.message}</p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.name} hint="Appears on certificates." required>{(b) => <Input {...b} name="name" defaultValue={defaults.name} autoComplete="name" />}</Field>
        <Field label="Time zone" error={errors.timezone}>
          {(b) => (
            <Select {...b} name="timezone" defaultValue={defaults.timezone}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field label="Headline" error={errors.headline} hint="Role and city, e.g. “Data analyst · Karachi”.">{(b) => <Input {...b} name="headline" defaultValue={defaults.headline} maxLength={120} />}</Field>
      <Field label="About you" error={errors.bio}>{(b) => <Textarea {...b} name="bio" defaultValue={defaults.bio} rows={4} maxLength={1000} />}</Field>
      <Button type="submit" loading={pending}>Save profile</Button>
    </ActionForm>
  );
}
