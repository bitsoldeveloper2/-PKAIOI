"use client";

import { useActionState } from "react";
import { changePasswordAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { ActionForm } from "@/components/ui/action-form";
export function PasswordForm({ className }: { className?: string }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(changePasswordAction, undefined);
  const errors = state?.errors ?? {};
  return (
    <ActionForm action={action} className={cn("space-y-5", className)} noValidate>
      {state?.message ? (
        <p role="status" className={cn("rounded-md px-3.5 py-2.5 text-sm", state.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>{state.message}</p>
      ) : null}
      <Field label="Current password" error={errors.current} required>{(b) => <Input {...b} name="current" type="password" autoComplete="current-password" />}</Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="New password" error={errors.password} hint="At least 10 characters with a letter and a number." required>{(b) => <Input {...b} name="password" type="password" autoComplete="new-password" />}</Field>
        <Field label="Confirm new password" error={errors.confirm} required>{(b) => <Input {...b} name="confirm" type="password" autoComplete="new-password" />}</Field>
      </div>
      <Button type="submit" variant="outline" loading={pending}>Change password</Button>
    </ActionForm>
  );
}
