"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { ActionForm } from "@/components/ui/action-form";
export function LoginForm({ next, className }: { next?: string; className?: string }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(loginAction, undefined);

  return (
    <ActionForm action={action} className={cn("space-y-5", className)} noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state?.message && !state.ok ? (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-3.5 py-3 text-sm text-danger">
          {state.message}
        </div>
      ) : null}

      <Field label="Email" error={state?.errors?.email} required>
        {(b) => <Input {...b} name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" autoFocus />}
      </Field>

      <Field label="Password" error={state?.errors?.password} required>
        {(b) => <Input {...b} name="password" type="password" autoComplete="current-password" placeholder="••••••••••" />}
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Sign in
      </Button>

      <p className="text-center text-[0.8125rem] text-ink-muted">
        Forgot your password? Contact the registrar at{" "}
        <a href="mailto:registrar@pioai.edu.pk" className="link">
          registrar@pioai.edu.pk
        </a>
        .
      </p>
    </ActionForm>
  );
}
