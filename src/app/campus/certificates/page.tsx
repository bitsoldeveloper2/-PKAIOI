import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { Award, Download, ExternalLink } from "lucide-react";
import { requireUser } from "@/server/auth/dal";
import { listMyCertificates } from "@/server/queries/campus";
import { accentFor } from "@/components/site/cards";
import { PageHeader } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const user = await requireUser("/campus/certificates");
  const certificates = await listMyCertificates(user.id);

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Campus" title="Certificates" lede="Issued when every lesson, quiz and lab in a course is complete. Each carries a public verification code." />

      {certificates.length === 0 ? (
        <EmptyState className="mt-10" icon={Award} title="No certificates yet" description="Finish a course to earn your first. Your progress is on the courses page." action={<ButtonLink href="/campus/courses" variant="outline">My courses</ButtonLink>} />
      ) : (
        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {certificates.map((c) => {
            const accent = accentFor(c.course.accent);
            return (
              <li key={c.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                <div className="relative p-6" style={{ background: accent.bg, color: accent.fg }}>
                  <div className="grain absolute inset-0" aria-hidden />
                  <div className="relative">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] opacity-75">Certificate of completion</p>
                    <p className="mt-3 font-display text-[1.75rem] leading-tight">{c.course.title}</p>
                    <p className="mt-1 text-sm opacity-80">{c.course.subtitle}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-3 gap-4 px-6 py-5 text-sm">
                  <div><dt className="eyebrow">Grade</dt><dd className="mt-1 text-ink">{c.grade ?? "Pass"}</dd></div>
                  <div><dt className="eyebrow">Issued</dt><dd className="mt-1 text-ink">{formatDate(c.issuedAt)}</dd></div>
                  <div><dt className="eyebrow">Instructor</dt><dd className="mt-1 truncate text-ink">{c.course.instructor.name}</dd></div>
                </dl>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
                  <code className="font-mono text-xs text-ink-muted">{c.code}</code>
                  <div className="flex gap-2">
                    <Link href={`/api/certificates/${c.code}/pdf` as Route} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong px-3 text-[0.8125rem] font-medium text-ink hover:bg-surface-2" prefetch={false}>
                      <Download className="size-3.5" aria-hidden /> PDF
                    </Link>
                    <Link href={`/verify/${c.code}` as Route} className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[0.8125rem] font-medium text-accent hover:bg-surface-2">
                      Verify <ExternalLink className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
