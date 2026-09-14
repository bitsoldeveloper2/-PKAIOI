import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { requirePermission } from "@/server/auth/dal";
import { getApplication, listReviewers } from "@/server/queries/admin";
import { Badge } from "@/components/ui/badge";
import { levelLabel } from "@/components/site/cards";
import { formatDate, formatDateTime } from "@/lib/utils";
import { STATUS_TONE, statusLabel } from "../constants";
import { ReviewForms } from "./review-forms";

export const metadata: Metadata = { title: "Application" };

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [, application, reviewers] = await Promise.all([requirePermission("admissions:manage", `/admin/admissions/${id}`), getApplication(id), listReviewers()]);
  if (!application) notFound();
  const a = application;

  return (
    <div className="container-wide py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/admin/admissions" className="hover:text-ink">Admissions</Link> <span aria-hidden>/</span> {a.firstName} {a.lastName}
      </nav>
      <header className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-ink">{a.firstName} {a.lastName}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {a.program.title} · {levelLabel(a.program.level)} · submitted {formatDate(a.createdAt)} · ref <span className="font-mono">{a.id.slice(-8).toUpperCase()}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={STATUS_TONE[a.status]}>{statusLabel(a.status)}</Badge>
          {a.score != null ? <Badge tone="outline">Score {a.score}/100</Badge> : null}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="statement">
            <h2 id="statement" className="eyebrow">Statement</h2>
            <p className="prose-pio mt-3 whitespace-pre-wrap text-[1rem]">{a.statement}</p>
          </section>
          <section className="grid gap-6 rounded-xl border border-line bg-surface p-6 sm:grid-cols-2" aria-labelledby="background">
            <h2 id="background" className="eyebrow sm:col-span-2">Background</h2>
            <div><p className="text-sm font-medium text-ink">Education</p><p className="mt-1 text-sm text-ink-muted">{a.education}</p></div>
            <div><p className="text-sm font-medium text-ink">Location</p><p className="mt-1 text-sm text-ink-muted">{a.city}, {a.country}</p></div>
            <div className="sm:col-span-2"><p className="text-sm font-medium text-ink">Experience</p><p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted">{a.experience}</p></div>
            <div><p className="text-sm font-medium text-ink">Contact</p><p className="mt-1 text-sm text-ink-muted"><a href={`mailto:${a.email}`} className="text-accent hover:underline">{a.email}</a><br />{a.phone}</p></div>
            {a.linkedinUrl ? (
              <div><p className="text-sm font-medium text-ink">Profile</p><a href={a.linkedinUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-accent hover:underline">LinkedIn <ArrowUpRight className="size-3.5" aria-hidden /></a></div>
            ) : null}
            {a.applicant ? <div><p className="text-sm font-medium text-ink">Campus account</p><p className="mt-1 text-sm text-ink-muted">{a.applicant.name} · {a.applicant.email}</p></div> : null}
          </section>
          <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="timeline">
            <h2 id="timeline" className="eyebrow">Timeline</h2>
            <ol className="mt-4 space-y-4">
              {a.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                  <div>
                    <p className="text-ink">{e.body}</p>
                    <p className="text-xs text-ink-muted">{e.actor?.name ?? "Applicant"} · {formatDateTime(e.createdAt)} · {e.type.toLowerCase()}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <ReviewForms
          applicationId={a.id}
          status={a.status}
          score={a.score}
          reviewNotes={a.reviewNotes ?? ""}
          reviewerId={a.reviewer?.id ?? ""}
          reviewers={reviewers.map((r) => ({ id: r.id, name: r.name }))}
        />
      </div>
    </div>
  );
}
