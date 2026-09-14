"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCourseAction, type ActionState } from "@/server/actions/studio";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ACCENTS } from "@/components/site/cards";

import { ActionForm } from "@/components/ui/action-form";
type CourseSettings = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  category: string;
  language: string;
  durationHours: number;
  accent: string;
  programId: string;
  tags: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  featured: boolean;
};

export function CourseSettingsForm({ course, programs, canFeature }: { course: CourseSettings; programs: { id: string; title: string }[]; canFeature: boolean }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(updateCourseAction, undefined);
  const router = useRouter();
  const { toast } = useToast();
  const errors = state?.errors ?? {};

  useEffect(() => {
    if (state?.ok) {
      toast({ title: state.message ?? "Saved", variant: "success" });
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <ActionForm action={action} className="grid gap-8 lg:grid-cols-[1fr_18rem]" noValidate>
      <input type="hidden" name="courseId" value={course.id} />
      <div className="space-y-6">
        {state?.message && !state.ok ? <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{state.message}</p> : null}
        <Field label="Title" error={errors.title} required>{(b) => <Input {...b} name="title" defaultValue={course.title} />}</Field>
        <Field label="Subtitle" error={errors.subtitle} required>{(b) => <Input {...b} name="subtitle" defaultValue={course.subtitle} />}</Field>
        <Field label="Description" error={errors.description} hint="Markdown. This is the public course page copy." required>{(b) => <Textarea {...b} name="description" defaultValue={course.description} rows={10} className="font-mono text-[0.8125rem]" />}</Field>
        <Field label="Learning outcomes" error={errors.learningOutcomes} hint="One per line.">{(b) => <Textarea {...b} name="learningOutcomes" defaultValue={course.learningOutcomes.join("\n")} rows={4} />}</Field>
        <Field label="Prerequisites" error={errors.prerequisites} hint="One per line.">{(b) => <Textarea {...b} name="prerequisites" defaultValue={course.prerequisites.join("\n")} rows={3} />}</Field>
        <Field label="Tags" error={errors.tags} hint="Comma-separated.">{(b) => <Input {...b} name="tags" defaultValue={course.tags.join(", ")} />}</Field>
      </div>
      <aside className="space-y-5">
        <Field label="Category" error={errors.category} required>{(b) => <Input {...b} name="category" defaultValue={course.category} />}</Field>
        <Field label="Level" error={errors.level} required>
          {(b) => (
            <Select {...b} name="level" defaultValue={course.level}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </Select>
          )}
        </Field>
        <Field label="Language" error={errors.language}>{(b) => <Input {...b} name="language" defaultValue={course.language} />}</Field>
        <Field label="Effort (hours)" error={errors.durationHours} required>{(b) => <Input {...b} name="durationHours" type="number" min={0} max={500} defaultValue={course.durationHours} />}</Field>
        <Field label="Program" error={errors.programId}>
          {(b) => (
            <Select {...b} name="programId" defaultValue={course.programId}>
              <option value="">Not part of a program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Card colour" error={errors.accent}>
          {(b) => (
            <Select {...b} name="accent" defaultValue={course.accent}>
              {Object.keys(ACCENTS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </Select>
          )}
        </Field>
        {canFeature ? <Checkbox name="featured" defaultChecked={course.featured} label="Featured on the homepage and catalog" /> : null}
        <Button type="submit" loading={pending} className="w-full">Save settings</Button>
      </aside>
    </ActionForm>
  );
}
