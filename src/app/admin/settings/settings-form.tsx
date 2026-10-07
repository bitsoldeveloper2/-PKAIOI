"use client";

import { useActionState } from "react";
import { updateSettingsAction, type ActionState } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { FormStatus } from "@/components/app/form-status";

import { ActionForm } from "@/components/ui/action-form";
type Settings = {
  banner: { enabled: boolean; text: string; href: string };
  intakes: Record<string, string>;
  ai: { tutorEnabled: boolean; labHintsEnabled: boolean; dailyMessageCap: number };
  promotion: { active: boolean; percentOff: number; label: string };
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(updateSettingsAction, undefined);
  const errors = state?.errors ?? {};

  return (
    <ActionForm action={action} className="space-y-8" noValidate>
      <FormStatus state={state} />

      <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="banner-title">
        <h2 id="banner-title" className="text-[1.0625rem] font-semibold text-ink">Homepage banner</h2>
        <p className="mt-1 text-sm text-ink-muted">A single line above the hero for time-sensitive notices such as admissions deadlines.</p>
        <div className="mt-5 space-y-5">
          <Checkbox name="bannerEnabled" defaultChecked={settings.banner.enabled} label="Show the banner" />
          <Field label="Text" error={errors.bannerText}>{(b) => <Input {...b} name="bannerText" defaultValue={settings.banner.text} maxLength={160} />}</Field>
          <Field label="Link" error={errors.bannerHref} hint="Relative path, e.g. /apply">{(b) => <Input {...b} name="bannerHref" defaultValue={settings.banner.href} />}</Field>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="intake-title">
        <h2 id="intake-title" className="text-[1.0625rem] font-semibold text-ink">Intake dates</h2>
        <p className="mt-1 text-sm text-ink-muted">Shown on the admissions page.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Professional Diploma" error={errors.intakeDiploma}>{(b) => <Input {...b} name="intakeDiploma" defaultValue={settings.intakes.diploma ?? ""} />}</Field>
          <Field label="LLM certificate" error={errors.intakeLlm}>{(b) => <Input {...b} name="intakeLlm" defaultValue={settings.intakes.llm ?? ""} />}</Field>
          <Field label="Executive programme" error={errors.intakeExecutive}>{(b) => <Input {...b} name="intakeExecutive" defaultValue={settings.intakes.executive ?? ""} />}</Field>
          <Field label="Foundations" error={errors.intakeFoundations}>{(b) => <Input {...b} name="intakeFoundations" defaultValue={settings.intakes.foundations ?? ""} />}</Field>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="promo-title">
        <h2 id="promo-title" className="text-[1.0625rem] font-semibold text-ink">Fees and offers</h2>
        <p className="mt-1 text-sm text-ink-muted">A percentage taken off every program fee wherever it is shown. Program records keep their full fee.</p>
        <div className="mt-5 space-y-5">
          <Checkbox name="promotionActive" defaultChecked={settings.promotion.active} label="Offer is on" />
          <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
            <Field label="Percent off" error={errors.promotionPercent}>{(b) => <Input {...b} name="promotionPercent" type="number" min={0} max={90} defaultValue={settings.promotion.percentOff} />}</Field>
            <Field label="Label" error={errors.promotionLabel} hint="Shown on the programs page, e.g. 50% off all programs">{(b) => <Input {...b} name="promotionLabel" defaultValue={settings.promotion.label} maxLength={80} />}</Field>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="ai-title">
        <h2 id="ai-title" className="text-[1.0625rem] font-semibold text-ink">AI on campus</h2>
        <p className="mt-1 text-sm text-ink-muted">Feature switches for the tutor and lab reviewer. The API key itself is set in the environment.</p>
        <div className="mt-5 space-y-5">
          <Checkbox name="tutorEnabled" defaultChecked={settings.ai.tutorEnabled} label="Tutor available to learners" />
          <Checkbox name="labHintsEnabled" defaultChecked={settings.ai.labHintsEnabled} label="Hints and reviews in the coding lab" />
          <Field label="Daily message cap per learner" error={errors.dailyMessageCap}>{(b) => <Input {...b} name="dailyMessageCap" type="number" min={10} max={5000} defaultValue={settings.ai.dailyMessageCap} className="max-w-40" />}</Field>
        </div>
      </section>

      <Button type="submit" loading={pending}>Save settings</Button>
    </ActionForm>
  );
}
