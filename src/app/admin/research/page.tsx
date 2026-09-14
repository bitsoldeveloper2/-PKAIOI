import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Plus } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { listResearchAdmin } from "@/server/queries/admin";
import { PageHeader } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Research" };

export default async function AdminResearchPage() {
  await requirePermission("research:manage", "/admin/research");
  const { labs, publications, projects, faculty } = await listResearchAdmin();

  const table = (rows: React.ReactNode, head: string[]) => (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[40rem] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
            {head.map((h) => (
              <th key={h} className="px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Institution" title="Research" lede="Labs, publications, projects and faculty profiles shown on the public site." />
      <Tabs
        className="mt-8"
        items={[
          {
            id: "labs",
            label: "Labs",
            count: labs.length,
            content: (
              <div className="space-y-4">
                <ButtonLink href={"/admin/research/labs/new" as Route} size="sm"><Plus className="size-4" aria-hidden />New lab</ButtonLink>
                {table(
                  labs.map((l) => (
                    <tr key={l.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                      <td className="px-4 py-3"><Link href={`/admin/research/labs/${l.id}` as Route} className="font-medium text-ink hover:text-accent">{l.name}</Link><p className="text-xs text-ink-muted">{l.tagline}</p></td>
                      <td className="px-4 py-3 text-ink-muted">{l.lead?.name ?? "—"}</td>
                      <td className="px-4 py-3 tabular text-ink-muted">{l._count.publications} pubs · {l._count.projects} projects</td>
                      <td className="px-4 py-3">{l.published ? <Badge tone="success">published</Badge> : <Badge tone="neutral">hidden</Badge>}</td>
                    </tr>
                  )),
                  ["Lab", "Lead", "Output", "Status"],
                )}
              </div>
            ),
          },
          {
            id: "publications",
            label: "Publications",
            count: publications.length,
            content: (
              <div className="space-y-4">
                <ButtonLink href={"/admin/research/publications/new" as Route} size="sm"><Plus className="size-4" aria-hidden />New publication</ButtonLink>
                {table(
                  publications.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                      <td className="px-4 py-3"><Link href={`/admin/research/publications/${p.id}` as Route} className="font-medium text-ink hover:text-accent">{p.title}</Link><p className="text-xs text-ink-muted">{p.venue} · {p.lab?.name ?? "No lab"}</p></td>
                      <td className="px-4 py-3 tabular text-ink-muted">{p.year}</td>
                      <td className="px-4 py-3 text-ink-muted">{p.type.toLowerCase()}</td>
                      <td className="px-4 py-3 space-x-1">{p.featured ? <Badge tone="gold">featured</Badge> : null}{p.published ? <Badge tone="success">published</Badge> : <Badge tone="neutral">hidden</Badge>}</td>
                    </tr>
                  )),
                  ["Publication", "Year", "Type", "Status"],
                )}
              </div>
            ),
          },
          {
            id: "projects",
            label: "Projects",
            count: projects.length,
            content: (
              <div className="space-y-4">
                <ButtonLink href={"/admin/research/projects/new" as Route} size="sm"><Plus className="size-4" aria-hidden />New project</ButtonLink>
                {table(
                  projects.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                      <td className="px-4 py-3"><Link href={`/admin/research/projects/${p.id}` as Route} className="font-medium text-ink hover:text-accent">{p.title}</Link></td>
                      <td className="px-4 py-3 text-ink-muted">{p.lab.name}</td>
                      <td className="px-4 py-3 text-ink-muted">{p.status.toLowerCase()}</td>
                      <td className="px-4 py-3">{p.published ? <Badge tone="success">published</Badge> : <Badge tone="neutral">hidden</Badge>}</td>
                    </tr>
                  )),
                  ["Project", "Lab", "Status", "Visibility"],
                )}
              </div>
            ),
          },
          {
            id: "faculty",
            label: "Faculty",
            count: faculty.length,
            content: (
              <div className="space-y-4">
                <ButtonLink href={"/admin/research/faculty/new" as Route} size="sm"><Plus className="size-4" aria-hidden />New profile</ButtonLink>
                {table(
                  faculty.map((f) => (
                    <tr key={f.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                      <td className="px-4 py-3"><Link href={`/admin/research/faculty/${f.id}` as Route} className="font-medium text-ink hover:text-accent">{f.name}</Link><p className="text-xs text-ink-muted">{f.title}</p></td>
                      <td className="px-4 py-3 text-ink-muted">{f.department}</td>
                      <td className="px-4 py-3 text-ink-muted">{f.user?.email ?? "No account linked"}</td>
                      <td className="px-4 py-3">{f.featured ? <Badge tone="gold">featured</Badge> : null}</td>
                    </tr>
                  )),
                  ["Faculty", "Department", "Account", ""],
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
