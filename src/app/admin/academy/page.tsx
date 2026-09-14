import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Plus } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { listAcademyAdmin } from "@/server/queries/admin";
import { PageHeader } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { levelLabel } from "@/components/site/cards";
import { formatDate, formatPkr } from "@/lib/utils";
import { CourseGovernance } from "./course-governance";

export const metadata: Metadata = { title: "Academy" };

const STATUS_TONE = { DRAFT: "neutral", REVIEW: "info", PUBLISHED: "success", ARCHIVED: "outline" } as const;

export default async function AdminAcademyPage() {
  await requirePermission("academy:manage", "/admin/academy");
  const { programs, courses, instructors } = await listAcademyAdmin();

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Content" title="Academy" lede="Programs are governed here. Courses are built in the studio; this view sets featuring and ownership across all instructors." />
      <Tabs
        className="mt-8"
        items={[
          {
            id: "programs",
            label: "Programs",
            count: programs.length,
            content: (
              <div className="space-y-4">
                <ButtonLink href={"/admin/academy/programs/new" as Route} size="sm"><Plus className="size-4" aria-hidden />New program</ButtonLink>
                <div className="overflow-x-auto rounded-xl border border-line bg-surface">
                  <table className="w-full min-w-[48rem] text-sm">
                    <thead><tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted"><th className="px-4 py-3">Program</th><th className="px-4 py-3">Level</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Tuition</th><th className="px-4 py-3 text-right">Courses</th><th className="px-4 py-3 text-right">Applications</th><th className="px-4 py-3">Status</th></tr></thead>
                    <tbody>
                      {programs.map((p) => (
                        <tr key={p.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                          <td className="px-4 py-3"><Link href={`/admin/academy/programs/${p.id}` as Route} className="font-medium text-ink hover:text-accent">{p.title}</Link></td>
                          <td className="px-4 py-3 text-ink-muted">{levelLabel(p.level)}</td>
                          <td className="px-4 py-3 tabular text-ink-muted">{p.durationWeeks} weeks</td>
                          <td className="px-4 py-3 tabular text-ink-muted">{p.tuitionPkr ? formatPkr(p.tuitionPkr) : "Funded"}</td>
                          <td className="px-4 py-3 text-right tabular text-ink">{p._count.courses}</td>
                          <td className="px-4 py-3 text-right tabular text-ink">{p._count.applications}</td>
                          <td className="px-4 py-3 space-x-1">{p.featured ? <Badge tone="gold">featured</Badge> : null}{p.published ? <Badge tone="success">published</Badge> : <Badge tone="neutral">hidden</Badge>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ),
          },
          {
            id: "courses",
            label: "Courses",
            count: courses.length,
            content: (
              <div className="overflow-x-auto rounded-xl border border-line bg-surface">
                <table className="w-full min-w-[56rem] text-sm">
                  <thead><tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted"><th className="px-4 py-3">Course</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Program</th><th className="px-4 py-3 text-right">Learners</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3">Governance</th></tr></thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id} className="border-b border-line last:border-b-0">
                        <td className="px-4 py-3"><Link href={`/studio/courses/${c.id}` as Route} className="font-medium text-ink hover:text-accent">{c.title}</Link><p className="text-xs text-ink-muted">{c.category} · {levelLabel(c.level)}</p></td>
                        <td className="px-4 py-3"><Badge tone={STATUS_TONE[c.status]}>{c.status.toLowerCase()}</Badge></td>
                        <td className="px-4 py-3 text-ink-muted">{c.program?.title ?? "—"}</td>
                        <td className="px-4 py-3 text-right tabular text-ink">{c._count.enrollments}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatDate(c.updatedAt)}</td>
                        <td className="px-4 py-3"><CourseGovernance courseId={c.id} featured={c.featured} instructorId={c.instructor.id} instructors={instructors} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
