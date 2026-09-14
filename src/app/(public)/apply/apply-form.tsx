"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { applyAction, type ApplyState } from "@/server/actions/admissions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { ActionForm } from "@/components/ui/action-form";
export function ApplyForm({
  programs,
  preselectedProgramId,
  defaults,
  className,
}: {
  programs: { id: string; title: string }[];
  preselectedProgramId?: string;
  defaults?: { name: string; email: string };
  className?: string;
}) {
  const [state, action, pending] = useActionState<ApplyState | undefined, FormData>(applyAction, undefined);
  const [firstName, ...rest] = (defaults?.name ?? "").split(" ");

  if (state?.ok) {
    return (
      <div className={cn("rounded-xl border border-success/30 bg-success-soft p-8", className)} role="status">
        <CheckCircle2 className="size-8 text-success" aria-hidden />
        <h2 className="mt-4 font-display text-display-sm text-ink">Application received.</h2>
        <p className="mt-3 text-[1.0625rem] text-ink">{state.message}</p>
        <p className="mt-4 text-sm text-ink-muted">
          Your reference: <span className="font-mono font-semibold text-ink">{state.reference}</span>. Keep it for any correspondence with admissions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/register" variant="primary">Create a campus account</ButtonLink>
          <ButtonLink href="/courses" variant="outline">Browse courses while you wait</ButtonLink>
        </div>
      </div>
    );
  }

  const errors = state?.errors ?? {};

  return (
    <ActionForm action={action} className={cn("space-y-10", className)} noValidate>
      {state?.message && !state.ok ? (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{state.message}</div>
      ) : null}

      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ink">Program</legend>
        <Field label="Which program are you applying to?" error={errors.programId} required>
          {(b) => (
            <Select {...b} name="programId" defaultValue={preselectedProgramId ?? ""}>
              <option value="" disabled>Choose a program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </Select>
          )}
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ink">About you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName} required>{(b) => <Input {...b} name="firstName" autoComplete="given-name" defaultValue={firstName} />}</Field>
          <Field label="Last name" error={errors.lastName} required>{(b) => <Input {...b} name="lastName" autoComplete="family-name" defaultValue={rest.join(" ")} />}</Field>
          <Field label="Email" error={errors.email} required>{(b) => <Input {...b} name="email" type="email" autoComplete="email" defaultValue={defaults?.email} />}</Field>
          <Field label="Phone" error={errors.phone} hint="Include the country code." required>{(b) => <Input {...b} name="phone" type="tel" autoComplete="tel" placeholder="+92 3xx xxxxxxx" />}</Field>
          <Field label="Country" error={errors.country} required>{(b) => <Input {...b} name="country" autoComplete="country-name" defaultValue="Pakistan" />}</Field>
          <Field label="City" error={errors.city} required>{(b) => <Input {...b} name="city" autoComplete="address-level2" />}</Field>
        </div>
        <Field label="LinkedIn profile" error={errors.linkedinUrl} hint="Optional. A CV link works too.">{(b) => <Input {...b} name="linkedinUrl" type="url" inputMode="url" placeholder="https://www.linkedin.com/in/…" />}</Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ink">Background</legend>
        <Field label="Highest education" error={errors.education} hint="Degree, institution and year — or ‘self-taught’ with what you built." required>
          {(b) => <Input {...b} name="education" placeholder="BSc Computer Science, FAST-NUCES (2022)" />}
        </Field>
        <Field label="Relevant experience" error={errors.experience} hint="A few sentences on what you do now and what you have shipped." required>
          {(b) => <Textarea {...b} name="experience" rows={4} />}
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ink">Statement</legend>
        <Field label="Describe a problem you want to solve with AI" error={errors.statement} hint="At least 100 characters. Specific beats impressive." required>
          {(b) => <Textarea {...b} name="statement" rows={9} />}
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <Checkbox
          name="consent"
          label={
            <>
              I confirm the information is accurate and agree to the institute’s <Link href="/terms" className="link">terms</Link> and{" "}
              <Link href="/privacy" className="link">privacy policy</Link>.
            </>
          }
          aria-invalid={errors.consent ? true : undefined}
        />
        {errors.consent ? <p role="alert" className="text-[0.8125rem] font-medium text-danger">{errors.consent[0]}</p> : null}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" loading={pending}>Submit application</Button>
        <p className="text-sm text-ink-muted">Admissions replies within ten working days.</p>
      </div>
    </ActionForm>
  );
}
