"use client";

import { useActionState, useState } from "react";
import { registerAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { ActionForm } from "@/components/ui/action-form";
export function RegisterForm({ className, inviteCode }: { className?: string; inviteCode?: string }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(registerAction, undefined);
  const [showInvite, setShowInvite] = useState(Boolean(inviteCode));

  return (
    <ActionForm action={action} className={cn("space-y-5", className)} noValidate>
      {state?.message && !state.ok ? (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-3.5 py-3 text-sm text-danger">
          {state.message}
        </div>
      ) : null}

      <Field label="Full name" error={state?.errors?.name} required>
        {(b) => <Input {...b} name="name" autoComplete="name" placeholder="Your name as it should appear on certificates" />}
      </Field>

      <Field label="Email" error={state?.errors?.email} required>
        {(b) => <Input {...b} name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" />}
      </Field>

      <Field label="Password" error={state?.errors?.password} hint="At least 10 characters with a letter and a number." required>
        {(b) => <Input {...b} name="password" type="password" autoComplete="new-password" />}
      </Field>

      {showInvite ? (
        <Field label="Organisation invite code" error={state?.errors?.inviteCode} hint="Provided by your employer’s programme manager.">
          {(b) => <Input {...b} name="inviteCode" defaultValue={inviteCode} autoComplete="off" className="font-mono uppercase" placeholder="e.g. NEXUS-2026" />}
        </Field>
      ) : (
        <button type="button" onClick={() => setShowInvite(true)} className="text-sm link">
          Have an organisation invite code?
        </button>
      )}

      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Create account
      </Button>

      <p className="text-center text-[0.8125rem] text-ink-muted">
        By continuing you agree to the institute’s terms of use and privacy policy.
      </p>
    </ActionForm>
  );
}
