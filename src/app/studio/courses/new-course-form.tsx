"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createCourseAction, type ActionState } from "@/server/actions/studio";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";

import { ActionForm } from "@/components/ui/action-form";
export function NewCourseForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(createCourseAction, undefined);
  const errors = state?.errors ?? {};

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden />New course</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Create a course" description="You can change everything later. The course starts as a draft with one empty module.">
        <ActionForm id="new-course-form" action={action} className="space-y-5" noValidate>
          {state?.message && !state.ok ? <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{state.message}</p> : null}
          <Field label="Title" error={errors.title} required>{(b) => <Input {...b} name="title" placeholder="e.g. Time-series forecasting in practice" autoFocus />}</Field>
          <Field label="Subtitle" error={errors.subtitle} hint="One line that says what changes for the learner." required>{(b) => <Input {...b} name="subtitle" />}</Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" error={errors.category} required>{(b) => <Input {...b} name="category" placeholder="Machine Learning" list="category-options" />}</Field>
            <Field label="Level" error={errors.level} required>
              {(b) => (
                <Select {...b} name="level" defaultValue="BEGINNER">
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </Select>
              )}
            </Field>
          </div>
          <datalist id="category-options">
            {["Machine Learning", "Deep Learning", "Language", "Vision", "Engineering", "Safety & Policy"].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={pending}>Create draft</Button>
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
