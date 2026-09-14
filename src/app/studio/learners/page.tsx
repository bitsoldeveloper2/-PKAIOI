import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Users } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { listStudioLearners } from "@/server/queries/studio";
import { PageHeader } from "@/components/ui/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Learners" };

export default async function StudioLearnersPage({ searchParams }: { searchParams: Promise<{ course?: string; q?: string }> }) {
  const [user, params] = await Promise.all([requirePermission("studio:access", "/studio/learners"), searchParams]);
  const q = params.q?.trim().slice(0, 80) || undefined;
  const { courses, enrollments } = await listStudioLearners(user, { courseId: params.course || undefined, q });

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Studio" title="Learners" lede="Everyone enrolled on your courses, with progress and quiz performance." />

      <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end" action="/studio/learners" method="get">
        <div className="flex-1">
          <label htmlFor="learner-q" className="text-sm font-medium text-ink">Search</label>
          <Input id="learner-q" name="q" defaultValue={q} placeholder="Name or email" className="mt-1" />
        </div>
        <div className="sm:w-72">
          <label htmlFor="learner-course" className="text-sm font-medium text-ink">Course</label>
          <Select id="learner-course" name="course" defaultValue={params.course ?? ""} className="mt-1">
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {enrollments.length === 0 ? (
        <EmptyState className="mt-8" icon={Users} title="No learners match" description="Learners appear here as soon as they enrol on one of your published courses." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[56rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
                <th className="px-4 py-3">Learner</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3 text-right">Quiz avg</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last active</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={e.user.name} src={e.user.avatarUrl} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{e.user.name}</p>
                        <p className="truncate text-xs text-ink-muted">{e.user.email}{e.org ? ` · ${e.org.name}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Link href={`/studio/courses/${e.course.id}` as Route} className="text-ink hover:text-accent">{e.course.title}</Link></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={e.progressPct} label={`${e.user.name} progress`} size="sm" className="w-28" />
                      <span className="tabular text-ink-muted">{e.progressPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular text-ink">{e.avgQuizPct != null ? `${e.avgQuizPct}%` : "—"}</td>
                  <td className="px-4 py-3"><Badge tone={e.status === "COMPLETED" ? "gold" : e.status === "ACTIVE" ? "success" : "neutral"}>{e.status.toLowerCase()}</Badge></td>
                  <td className="px-4 py-3 text-ink-muted">{relativeTime(e.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
