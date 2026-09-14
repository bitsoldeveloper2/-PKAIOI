"use client";

import { useActionState, useState } from "react";
import { deletePostAction, upsertPageAction, upsertPostAction, type ActionState } from "@/server/actions/content";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/app/form-status";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

import { ActionForm } from "@/components/ui/action-form";
function MarkdownField({ name, label, defaultValue, error, rows = 18 }: { name: string; label: string; defaultValue: string; error?: string[]; rows?: number }) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={`md-${name}`} className="text-sm font-medium text-ink">{label} <span className="font-normal text-ink-muted">(Markdown)</span></label>
        <div role="group" aria-label="Editor mode" className="flex rounded-md border border-line p-0.5 text-xs">
          <button type="button" onClick={() => setPreview(false)} aria-pressed={!preview} className={cn("rounded px-2 py-1", !preview ? "bg-ink text-bg" : "text-ink-muted")}>Write</button>
          <button type="button" onClick={() => setPreview(true)} aria-pressed={preview} className={cn("rounded px-2 py-1", preview ? "bg-ink text-bg" : "text-ink-muted")}>Preview</button>
        </div>
      </div>
      <input type="hidden" name={name} value={value} />
      {preview ? (
        <div className="min-h-64 rounded-lg border border-line bg-surface-2 p-5"><Markdown content={value || "_Nothing to preview yet._"} /></div>
      ) : (
        <Textarea id={`md-${name}`} value={value} onChange={(e) => setValue(e.target.value)} rows={rows} className="font-mono text-[0.8125rem]" aria-invalid={error ? true : undefined} />
      )}
      {error ? <p role="alert" className="text-[0.8125rem] font-medium text-danger">{error[0]}</p> : null}
    </div>
  );
}

export function PostEditor({ post }: { post: { id: string; title: string; excerpt: string; body: string; category: string; tags: string[]; status: string; publishedAt: string } | null }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertPostAction, undefined);
  const e = state?.errors ?? {};
  return (
    <>
    <ActionForm action={action} className="grid gap-8 lg:grid-cols-[1fr_18rem]" noValidate>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="space-y-6">
        <FormStatus state={state} />
        <Field label="Title" error={e.title} required>{(b) => <Input {...b} name="title" defaultValue={post?.title} className="text-lg" />}</Field>
        <Field label="Excerpt" error={e.excerpt} hint="One or two sentences shown on cards and in search." required>{(b) => <Textarea {...b} name="excerpt" defaultValue={post?.excerpt} rows={2} />}</Field>
        <MarkdownField name="body" label="Body" defaultValue={post?.body ?? ""} error={e.body} />
      </div>
      <aside className="space-y-5">
        <Field label="Status" error={e.status} required>{(b) => (
          <Select {...b} name="status" defaultValue={post?.status ?? "DRAFT"}>
            <option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option>
          </Select>
        )}</Field>
        <Field label="Publish date" error={e.publishedAt} hint="Defaults to now when publishing.">{(b) => <Input {...b} name="publishedAt" type="date" defaultValue={post?.publishedAt} />}</Field>
        <Field label="Category" error={e.category} required>{(b) => <Input {...b} name="category" defaultValue={post?.category ?? "News"} list="post-categories" />}</Field>
        <datalist id="post-categories">{["News", "Research", "Admissions", "Perspectives"].map((c) => <option key={c} value={c} />)}</datalist>
        <Field label="Tags" error={e.tags} hint="Comma-separated.">{(b) => <Input {...b} name="tags" defaultValue={post?.tags.join(", ")} />}</Field>
        <Button type="submit" loading={pending} className="w-full">{post ? "Save post" : "Create post"}</Button>
        {/* Forms cannot nest: the delete button targets its own form rendered after the editor. */}
        {post ? <Button type="submit" form="delete-post-form" variant="ghost" className="w-full text-danger">Delete post</Button> : null}
      </aside>
    </ActionForm>
    {post ? (
      <form id="delete-post-form" action={deletePostAction} onSubmit={(ev) => { if (!confirm("Delete this post permanently?")) ev.preventDefault(); }}>
        <input type="hidden" name="id" value={post.id} />
      </form>
    ) : null}
    </>
  );
}

export function PageEditor({ page }: { page: { id: string; slug: string; title: string; body: string; seoTitle: string; seoDescription: string; status: string } | null }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(upsertPageAction, undefined);
  const e = state?.errors ?? {};
  return (
    <ActionForm action={action} className="grid gap-8 lg:grid-cols-[1fr_18rem]" noValidate>
      {page ? <input type="hidden" name="id" value={page.id} /> : null}
      <div className="space-y-6">
        <FormStatus state={state} />
        <Field label="Title" error={e.title} required>{(b) => <Input {...b} name="title" defaultValue={page?.title} className="text-lg" />}</Field>
        <MarkdownField name="body" label="Body" defaultValue={page?.body ?? ""} error={e.body} />
      </div>
      <aside className="space-y-5">
        <Field label="Path" error={e.slug} hint="Served at /path. Lowercase letters, numbers and hyphens." required>{(b) => <Input {...b} name="slug" defaultValue={page?.slug} className="font-mono" />}</Field>
        <Field label="Status" error={e.status} required>{(b) => (
          <Select {...b} name="status" defaultValue={page?.status ?? "PUBLISHED"}>
            <option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option>
          </Select>
        )}</Field>
        <Field label="SEO title" error={e.seoTitle}>{(b) => <Input {...b} name="seoTitle" defaultValue={page?.seoTitle} maxLength={120} />}</Field>
        <Field label="SEO description" error={e.seoDescription}>{(b) => <Textarea {...b} name="seoDescription" defaultValue={page?.seoDescription} rows={3} maxLength={200} />}</Field>
        <Button type="submit" loading={pending} className="w-full">{page ? "Save page" : "Create page"}</Button>
      </aside>
    </ActionForm>
  );
}
