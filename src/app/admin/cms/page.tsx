import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Plus } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { listCmsAdmin } from "@/server/queries/admin";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { formatDate, formatDateTime } from "@/lib/utils";
import { AnnouncementForm, DeleteNoticeButton, EventForm } from "./notice-forms";

export const metadata: Metadata = { title: "CMS" };

const STATUS_TONE = { DRAFT: "neutral", PUBLISHED: "success", ARCHIVED: "outline" } as const;

export default async function CmsPage() {
  await requirePermission("cms:manage", "/admin/cms");
  const [{ posts, pages, announcements, events }, courses] = await Promise.all([listCmsAdmin(), db.course.findMany({ where: { status: "PUBLISHED" }, select: { id: true, title: true }, orderBy: { title: "asc" } })]);

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Content" title="CMS" lede="The journal, institutional pages, campus announcements and the events calendar." />
      <Tabs
        className="mt-8"
        items={[
          {
            id: "posts",
            label: "Journal",
            count: posts.length,
            content: (
              <div className="space-y-4">
                <ButtonLink href={"/admin/cms/posts/new" as Route} size="sm"><Plus className="size-4" aria-hidden />New post</ButtonLink>
                <div className="overflow-x-auto rounded-xl border border-line bg-surface">
                  <table className="w-full min-w-[44rem] text-sm">
                    <thead><tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted"><th className="px-4 py-3">Post</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Published</th><th className="px-4 py-3">Author</th></tr></thead>
                    <tbody>
                      {posts.map((p) => (
                        <tr key={p.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                          <td className="px-4 py-3"><Link href={`/admin/cms/posts/${p.id}` as Route} className="font-medium text-ink hover:text-accent">{p.title}</Link><p className="font-mono text-xs text-ink-subtle">/journal/{p.slug}</p></td>
                          <td className="px-4 py-3 text-ink-muted">{p.category}</td>
                          <td className="px-4 py-3"><Badge tone={STATUS_TONE[p.status]}>{p.status.toLowerCase()}</Badge></td>
                          <td className="px-4 py-3 text-ink-muted">{p.publishedAt ? formatDate(p.publishedAt) : "—"}</td>
                          <td className="px-4 py-3 text-ink-muted">{p.author.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ),
          },
          {
            id: "pages",
            label: "Pages",
            count: pages.length,
            content: (
              <div className="space-y-4">
                <ButtonLink href={"/admin/cms/pages/new" as Route} size="sm"><Plus className="size-4" aria-hidden />New page</ButtonLink>
                <div className="overflow-x-auto rounded-xl border border-line bg-surface">
                  <table className="w-full min-w-[36rem] text-sm">
                    <thead><tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted"><th className="px-4 py-3">Page</th><th className="px-4 py-3">Path</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th></tr></thead>
                    <tbody>
                      {pages.map((p) => (
                        <tr key={p.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                          <td className="px-4 py-3"><Link href={`/admin/cms/pages/${p.id}` as Route} className="font-medium text-ink hover:text-accent">{p.title}</Link></td>
                          <td className="px-4 py-3 font-mono text-xs text-ink-muted">/{p.slug}</td>
                          <td className="px-4 py-3"><Badge tone={STATUS_TONE[p.status]}>{p.status.toLowerCase()}</Badge></td>
                          <td className="px-4 py-3 text-ink-muted">{formatDate(p.updatedAt)}{p.updatedBy ? ` · ${p.updatedBy.name}` : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ),
          },
          {
            id: "announcements",
            label: "Announcements",
            count: announcements.length,
            content: (
              <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                <ul className="space-y-3">
                  {announcements.map((a) => (
                    <li key={a.id} className="rounded-xl border border-line bg-surface p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink">{a.title}</p>
                          <p className="mt-1 text-sm text-ink-muted">{a.body}</p>
                          <p className="mt-2 text-xs text-ink-subtle">{a.audience} · {a.author.name} · {formatDate(a.publishedAt)}{a.expiresAt ? ` · expires ${formatDate(a.expiresAt)}` : ""}</p>
                        </div>
                        <DeleteNoticeButton kind="announcement" id={a.id} />
                      </div>
                    </li>
                  ))}
                </ul>
                <AnnouncementForm />
              </div>
            ),
          },
          {
            id: "events",
            label: "Events",
            count: events.length,
            content: (
              <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                <ul className="space-y-3">
                  {events.map((e) => (
                    <li key={e.id} className="rounded-xl border border-line bg-surface p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink">{e.title}</p>
                          <p className="mt-1 text-xs text-ink-muted">{e.type.toLowerCase()} · {formatDateTime(e.startsAt)} – {formatDateTime(e.endsAt)} · {e.location}{e.course ? ` · ${e.course.title}` : ""}{e.published ? "" : " · hidden"}</p>
                        </div>
                        <DeleteNoticeButton kind="event" id={e.id} />
                      </div>
                    </li>
                  ))}
                </ul>
                <EventForm courses={courses} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
