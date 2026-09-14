"use client";

import { useActionState } from "react";
import { deleteResearchItemAction, upsertFacultyAction, upsertLabAction, upsertProjectAction, upsertPublicationAction, type ActionState } from "@/server/actions/content";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/app/form-status";

import { ActionForm } from "@/components/ui/action-form";
/** Forms cannot nest, so the delete button lives inside the editor and targets a sibling form by id. */
function DeleteButton({ kind, id }: { kind: string; id: string }) {
  return (
    <Button type="submit" form={`delete-${kind}-${id}`} variant="ghost" className="text-danger">Delete</Button>
  );
}

function DeleteForm({ kind, id, label }: { kind: string; id: string; label: string }) {
  return (
    <form id={`delete-${kind}-${id}`} action={deleteResearchItemAction} onSubmit={(e) => { if (!confirm(`Delete this ${label}? This cannot be undone.`)) e.preventDefault(); }}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
    </form>
  );
}

type Option = { id: string; name: string };

export function LabForm({ lab, faculty }: { lab: { id: string; name: string; tagline: string; description: string; focusAreas: string[]; leadId: string; published: boolean; order: number } | null; faculty: Option[] }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertLabAction, undefined);
  const e = state?.errors ?? {};
  return (
    <>
    <ActionForm action={action} className="space-y-5" noValidate>
      {lab ? <input type="hidden" name="id" value={lab.id} /> : null}
      <FormStatus state={state} />
      <Field label="Name" error={e.name} required>{(b) => <Input {...b} name="name" defaultValue={lab?.name} />}</Field>
      <Field label="Tagline" error={e.tagline} required>{(b) => <Input {...b} name="tagline" defaultValue={lab?.tagline} />}</Field>
      <Field label="Description" error={e.description} hint="Markdown." required>{(b) => <Textarea {...b} name="description" defaultValue={lab?.description} rows={10} />}</Field>
      <Field label="Focus areas" error={e.focusAreas} hint="One per line.">{(b) => <Textarea {...b} name="focusAreas" defaultValue={lab?.focusAreas.join("\n")} rows={4} />}</Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Lead" error={e.leadId}>{(b) => (
          <Select {...b} name="leadId" defaultValue={lab?.leadId ?? ""}>
            <option value="">No lead</option>
            {faculty.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
        )}</Field>
        <Field label="Order" error={e.order}>{(b) => <Input {...b} name="order" type="number" min={0} defaultValue={lab?.order ?? 0} />}</Field>
      </div>
      <Checkbox name="published" defaultChecked={lab?.published ?? true} label="Published on the public site" />
      <div className="flex items-center justify-between gap-3">
        <Button type="submit" loading={pending}>{lab ? "Save lab" : "Create lab"}</Button>
        {lab ? <DeleteButton kind="labs" id={lab.id} /> : null}
      </div>
    </ActionForm>
    {lab ? <DeleteForm kind="labs" id={lab.id} label="lab" /> : null}
    </>
  );
}

export function PublicationForm({ publication, labs }: { publication: { id: string; title: string; abstract: string; authors: string[]; venue: string; year: number; type: string; url: string; labId: string; featured: boolean; published: boolean } | null; labs: Option[] }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertPublicationAction, undefined);
  const e = state?.errors ?? {};
  const p = publication;
  return (
    <>
    <ActionForm action={action} className="space-y-5" noValidate>
      {p ? <input type="hidden" name="id" value={p.id} /> : null}
      <FormStatus state={state} />
      <Field label="Title" error={e.title} required>{(b) => <Input {...b} name="title" defaultValue={p?.title} />}</Field>
      <Field label="Abstract" error={e.abstract} required>{(b) => <Textarea {...b} name="abstract" defaultValue={p?.abstract} rows={6} />}</Field>
      <Field label="Authors" error={e.authors} hint="Comma-separated, in order." required>{(b) => <Input {...b} name="authors" defaultValue={p?.authors.join(", ")} />}</Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Venue" error={e.venue} required className="sm:col-span-2">{(b) => <Input {...b} name="venue" defaultValue={p?.venue} />}</Field>
        <Field label="Year" error={e.year} required>{(b) => <Input {...b} name="year" type="number" min={2000} max={2100} defaultValue={p?.year ?? new Date().getFullYear()} />}</Field>
        <Field label="Type" error={e.type} required>{(b) => (
          <Select {...b} name="type" defaultValue={p?.type ?? "PAPER"}>
            <option value="PAPER">Paper</option><option value="PREPRINT">Preprint</option><option value="REPORT">Report</option><option value="DATASET">Dataset</option>
          </Select>
        )}</Field>
        <Field label="Lab" error={e.labId}>{(b) => (
          <Select {...b} name="labId" defaultValue={p?.labId ?? ""}>
            <option value="">No lab</option>
            {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}</Field>
        <Field label="URL" error={e.url}>{(b) => <Input {...b} name="url" type="url" defaultValue={p?.url} />}</Field>
      </div>
      <div className="flex flex-wrap gap-6">
        <Checkbox name="featured" defaultChecked={p?.featured ?? false} label="Featured" />
        <Checkbox name="published" defaultChecked={p?.published ?? true} label="Published" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Button type="submit" loading={pending}>{p ? "Save publication" : "Create publication"}</Button>
        {p ? <DeleteButton kind="publications" id={p.id} /> : null}
      </div>
    </ActionForm>
    {p ? <DeleteForm kind="publications" id={p.id} label="publication" /> : null}
    </>
  );
}

export function ProjectForm({ project, labs }: { project: { id: string; title: string; summary: string; description: string; status: string; labId: string; startedAt: string; endedAt: string; published: boolean } | null; labs: Option[] }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertProjectAction, undefined);
  const e = state?.errors ?? {};
  const p = project;
  return (
    <>
    <ActionForm action={action} className="space-y-5" noValidate>
      {p ? <input type="hidden" name="id" value={p.id} /> : null}
      <FormStatus state={state} />
      <Field label="Title" error={e.title} required>{(b) => <Input {...b} name="title" defaultValue={p?.title} />}</Field>
      <Field label="Summary" error={e.summary} required>{(b) => <Input {...b} name="summary" defaultValue={p?.summary} />}</Field>
      <Field label="Description" error={e.description} required>{(b) => <Textarea {...b} name="description" defaultValue={p?.description} rows={6} />}</Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Lab" error={e.labId} required>{(b) => (
          <Select {...b} name="labId" defaultValue={p?.labId ?? ""}>
            <option value="" disabled>Choose a lab</option>
            {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}</Field>
        <Field label="Status" error={e.status} required>{(b) => (
          <Select {...b} name="status" defaultValue={p?.status ?? "ACTIVE"}>
            <option value="PLANNED">Planned</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option>
          </Select>
        )}</Field>
        <Field label="Started" error={e.startedAt} required>{(b) => <Input {...b} name="startedAt" type="date" defaultValue={p?.startedAt ?? new Date().toISOString().slice(0, 10)} />}</Field>
        <Field label="Ended" error={e.endedAt}>{(b) => <Input {...b} name="endedAt" type="date" defaultValue={p?.endedAt} />}</Field>
      </div>
      <Checkbox name="published" defaultChecked={p?.published ?? true} label="Published" />
      <div className="flex items-center justify-between gap-3">
        <Button type="submit" loading={pending}>{p ? "Save project" : "Create project"}</Button>
        {p ? <DeleteButton kind="projects" id={p.id} /> : null}
      </div>
    </ActionForm>
    {p ? <DeleteForm kind="projects" id={p.id} label="project" /> : null}
    </>
  );
}

export function FacultyForm({ member }: { member: { id: string; name: string; title: string; department: string; bio: string; expertise: string[]; links: { label: string; url: string }[]; userEmail: string; featured: boolean; order: number } | null }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertFacultyAction, undefined);
  const e = state?.errors ?? {};
  const m = member;
  return (
    <>
    <ActionForm action={action} className="space-y-5" noValidate>
      {m ? <input type="hidden" name="id" value={m.id} /> : null}
      <FormStatus state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={e.name} required>{(b) => <Input {...b} name="name" defaultValue={m?.name} />}</Field>
        <Field label="Department" error={e.department} required>{(b) => <Input {...b} name="department" defaultValue={m?.department} />}</Field>
      </div>
      <Field label="Title" error={e.title} required>{(b) => <Input {...b} name="title" defaultValue={m?.title} />}</Field>
      <Field label="Biography" error={e.bio} hint="Markdown." required>{(b) => <Textarea {...b} name="bio" defaultValue={m?.bio} rows={8} />}</Field>
      <Field label="Expertise" error={e.expertise} hint="Comma-separated.">{(b) => <Input {...b} name="expertise" defaultValue={m?.expertise.join(", ")} />}</Field>
      <Field label="Links" error={e.links} hint="One per line as Label | https://url">{(b) => <Textarea {...b} name="links" defaultValue={m?.links.map((l) => `${l.label} | ${l.url}`).join("\n")} rows={3} />}</Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Linked account email" error={e.userEmail} hint="Connects taught courses to this profile.">{(b) => <Input {...b} name="userEmail" type="email" defaultValue={m?.userEmail} />}</Field>
        <Field label="Order" error={e.order}>{(b) => <Input {...b} name="order" type="number" min={0} defaultValue={m?.order ?? 0} />}</Field>
      </div>
      <Checkbox name="featured" defaultChecked={m?.featured ?? false} label="Featured on the homepage" />
      <div className="flex items-center justify-between gap-3">
        <Button type="submit" loading={pending}>{m ? "Save profile" : "Create profile"}</Button>
        {m ? <DeleteButton kind="faculty" id={m.id} /> : null}
      </div>
    </ActionForm>
    {m ? <DeleteForm kind="faculty" id={m.id} label="profile" /> : null}
    </>
  );
}
