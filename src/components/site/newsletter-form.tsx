"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { subscribeAction, type ActionState } from "@/server/actions/leads";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { ActionForm } from "@/components/ui/action-form";
export function NewsletterForm({ className, interest }: { className?: string; interest?: string }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(subscribeAction, undefined);

  if (state?.ok) {
    return (
      <p className={cn("rounded-md border border-line bg-surface px-3.5 py-3 text-sm text-ink", className)} role="status">
        {state.message}
      </p>
    );
  }

  return (
    <ActionForm action={action} className={cn("flex flex-col gap-2", className)} noValidate>
      {interest ? <input type="hidden" name="interest" value={interest} /> : null}
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@organisation.com"
          aria-invalid={state?.errors?.email ? true : undefined}
          aria-describedby={state?.errors?.email ? "newsletter-error" : undefined}
          className="h-10 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3.5 text-sm text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
        <Button type="submit" loading={pending} aria-label="Subscribe" size="md">
          {!pending ? <ArrowRight className="size-4" aria-hidden /> : null}
        </Button>
      </div>
      {state?.errors?.email ? (
        <p id="newsletter-error" role="alert" className="text-[0.8125rem] font-medium text-danger">
          {state.errors.email[0]}
        </p>
      ) : null}
      {state?.ok === false && state.message ? (
        <p role="alert" className="text-[0.8125rem] font-medium text-danger">
          {state.message}
        </p>
      ) : null}
    </ActionForm>
  );
}
