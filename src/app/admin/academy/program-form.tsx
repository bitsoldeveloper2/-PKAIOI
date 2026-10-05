"use client";

import { useActionState } from "react";
import { upsertProgramAction, type ActionState } from "@/server/actions/content";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/app/form-status";

import { ActionForm } from "@/components/ui/action-form";
type ProgramValues = {
  id: string;
  title: string;
  tagline: string;
  level: string;
  format: string;
  durationWeeks: number;
  tuitionPkr: number | null;
  summary: string;
  description: string;
  outcomes: string[];
  curriculum: string;
  intake: string;
  deadline: string;
  requirements: string[];
  featured: boolean;
  published: boolean;
  order: number;
};

export function ProgramForm({ program }: { program: ProgramValues | null }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertProgramAction, undefined);
  const e = state?.errors ?? {};
  const p = program;
  return (
    <ActionForm action={action} className="grid gap-8 lg:grid-cols-[1fr_18rem]" noValidate>
      {p ? <input type="hidden" name="id" value={p.id} /> : null}
      <div className="space-y-6">
        <FormStatus state={state} />
        <Field label="Title" error={e.title} required>{(b) => <Input {...b} name="title" defaultValue={p?.title} className="text-lg" />}</Field>
        <Field label="Tagline" error={e.tagline} required>{(b) => <Input {...b} name="tagline" defaultValue={p?.tagline} />}</Field>
        <Field label="Summary" error={e.summary} hint="Shown on cards and the programs list." required>{(b) => <Textarea {...b} name="summary" defaultValue={p?.summary} rows={3} />}</Field>
        <Field label="Description" error={e.description} hint="Markdown." required>{(b) => <Textarea {...b} name="description" defaultValue={p?.description} rows={10} className="font-mono text-[0.8125rem]" />}</Field>
        <Field label="Outcomes" error={e.outcomes} hint="One per line.">{(b) => <Textarea {...b} name="outcomes" defaultValue={p?.outcomes.join("\n")} rows={4} />}</Field>
        <Field label="Curriculum" error={e.curriculum} hint={<>Blocks start with <code className="font-mono"># Block title</code>; following lines are items.</>}>{(b) => <Textarea {...b} name="curriculum" defaultValue={p?.curriculum} rows={10} className="font-mono text-[0.8125rem]" />}</Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Intake" error={e.intake}>{(b) => <Input {...b} name="intake" defaultValue={p?.intake} placeholder="September and January cohorts" />}</Field>
          <Field label="Deadline" error={e.deadline}>{(b) => <Input {...b} name="deadline" defaultValue={p?.deadline} placeholder="Eight weeks before intake" />}</Field>
        </div>
        <Field label="Requirements" error={e.requirements} hint="One per line.">{(b) => <Textarea {...b} name="requirements" defaultValue={p?.requirements.join("\n")} rows={4} />}</Field>
      </div>
      <aside className="space-y-5">
        <Field label="Level" error={e.level} required>{(b) => (
          <Select {...b} name="level" defaultValue={p?.level ?? "PROFESSIONAL"}>
            {["FOUNDATION", "PROFESSIONAL", "ADVANCED", "EXECUTIVE", "RESEARCH", "SHORT_COURSE"].map((l) => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase().replace("_", " ")}</option>)}
          </Select>
        )}</Field>
        <Field label="Format" error={e.format} required>{(b) => <Input {...b} name="format" defaultValue={p?.format} placeholder="Hybrid · Evenings" />}</Field>
        <Field label="Duration (weeks)" error={e.durationWeeks} required>{(b) => <Input {...b} name="durationWeeks" type="number" min={1} max={200} defaultValue={p?.durationWeeks ?? 12} />}</Field>
        <Field label="Tuition (PKR)" error={e.tuitionPkr} hint="Leave empty for fully funded.">{(b) => <Input {...b} name="tuitionPkr" type="number" min={0} defaultValue={p?.tuitionPkr ?? ""} />}</Field>
        <Field label="Order" error={e.order}>{(b) => <Input {...b} name="order" type="number" min={0} defaultValue={p?.order ?? 0} />}</Field>
        <Checkbox name="featured" defaultChecked={p?.featured ?? false} label="Featured" />
        <Checkbox name="published" defaultChecked={p?.published ?? true} label="Published" />
        <Button type="submit" loading={pending} className="w-full">{p ? "Save program" : "Create program"}</Button>
      </aside>
    </ActionForm>
  );
}
