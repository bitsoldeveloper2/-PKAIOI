"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAnnouncementAction, deleteEventAction, upsertAnnouncementAction, upsertEventAction, type ActionState } from "@/server/actions/content";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/app/form-status";
import { useToast } from "@/components/ui/toast";

import { ActionForm } from "@/components/ui/action-form";
export function AnnouncementForm() {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertAnnouncementAction, undefined);
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) {
      form.current?.reset();
      router.refresh();
    }
  }, [state, router]);
  const e = state?.errors ?? {};
  return (
    <ActionForm ref={form} action={action} className="space-y-4 rounded-xl border border-line bg-surface p-5" noValidate>
      <h3 className="text-sm font-semibold text-ink">New announcement</h3>
      <FormStatus state={state} />
      <Field label="Title" error={e.title} required>{(b) => <Input {...b} name="title" />}</Field>
      <Field label="Body" error={e.body} required>{(b) => <Textarea {...b} name="body" rows={3} />}</Field>
      <Field label="Audience" error={e.audience} hint="ALL, STUDENTS, INSTRUCTORS or ORG:<organisation id>" required>{(b) => (
        <Select {...b} name="audience" defaultValue="ALL">
          <option value="ALL">Everyone</option><option value="STUDENTS">Students</option><option value="INSTRUCTORS">Instructors</option>
        </Select>
      )}</Field>
      <Field label="Expires" error={e.expiresAt}>{(b) => <Input {...b} name="expiresAt" type="date" />}</Field>
      <Button type="submit" loading={pending} className="w-full">Publish announcement</Button>
    </ActionForm>
  );
}

export function EventForm({ courses }: { courses: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertEventAction, undefined);
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) {
      form.current?.reset();
      router.refresh();
    }
  }, [state, router]);
  const e = state?.errors ?? {};
  return (
    <ActionForm ref={form} action={action} className="space-y-4 rounded-xl border border-line bg-surface p-5" noValidate>
      <h3 className="text-sm font-semibold text-ink">New event</h3>
      <FormStatus state={state} />
      <Field label="Title" error={e.title} required>{(b) => <Input {...b} name="title" />}</Field>
      <Field label="Description" error={e.description} required>{(b) => <Textarea {...b} name="description" rows={2} />}</Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" error={e.type} required>{(b) => (
          <Select {...b} name="type" defaultValue="LECTURE">
            {["LECTURE", "WORKSHOP", "SEMINAR", "DEADLINE", "COHORT"].map((t) => <option key={t} value={t}>{t.toLowerCase()}</option>)}
          </Select>
        )}</Field>
        <Field label="Location" error={e.location} required>{(b) => <Input {...b} name="location" />}</Field>
        <Field label="Starts" error={e.startsAt} required>{(b) => <Input {...b} name="startsAt" type="datetime-local" />}</Field>
        <Field label="Ends" error={e.endsAt} required>{(b) => <Input {...b} name="endsAt" type="datetime-local" />}</Field>
      </div>
      <Field label="Course" error={e.courseId}>{(b) => (
        <Select {...b} name="courseId" defaultValue="">
          <option value="">Institute-wide</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </Select>
      )}</Field>
      <Checkbox name="published" defaultChecked label="Published" />
      <Button type="submit" loading={pending} className="w-full">Add event</Button>
    </ActionForm>
  );
}

export function DeleteNoticeButton({ kind, id }: { kind: "announcement" | "event"; id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete this ${kind}?`)) return;
        const fd = new FormData();
        fd.set("id", id);
        startTransition(async () => {
          await (kind === "announcement" ? deleteAnnouncementAction(fd) : deleteEventAction(fd));
          toast({ title: `${kind === "announcement" ? "Announcement" : "Event"} deleted`, variant: "success" });
          router.refresh();
        });
      }}
      className="rounded-md p-1.5 text-ink-subtle hover:bg-danger-soft hover:text-danger"
      aria-label={`Delete ${kind}`}
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
