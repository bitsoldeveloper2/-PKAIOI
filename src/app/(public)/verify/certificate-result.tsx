import Link from "next/link";
import { BadgeCheck, ShieldAlert, ShieldX } from "lucide-react";
import { getCertificateByCode } from "@/server/queries/campus";
import { formatDate } from "@/lib/utils";
import { levelLabel } from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/button";

export async function CertificateResult({ code }: { code: string }) {
  const normalised = code.trim().toUpperCase();
  const cert = /^[A-Z0-9-]{8,32}$/.test(normalised) ? await getCertificateByCode(normalised) : null;

  if (!cert) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger-soft p-6" role="status">
        <ShieldX className="size-7 text-danger" aria-hidden />
        <h2 className="mt-3 font-display text-xl text-ink">No certificate matches this code.</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Check the code for typos — it is printed on the certificate and in the learner’s campus. If you believe this is an error, contact the registrar.
        </p>
        <p className="mt-3 font-mono text-sm text-ink">{normalised}</p>
      </div>
    );
  }

  if (cert.revokedAt) {
    return (
      <div className="rounded-xl border border-warning/40 bg-warning-soft p-6" role="status">
        <ShieldAlert className="size-7 text-warning" aria-hidden />
        <h2 className="mt-3 font-display text-xl text-ink">This certificate has been revoked.</h2>
        <p className="mt-2 text-sm text-ink-muted">Revoked on {formatDate(cert.revokedAt)}. It should not be relied upon. Contact the registrar for details.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-success/30 bg-surface" role="status">
      <div className="flex items-center gap-3 border-b border-success/20 bg-success-soft px-6 py-4">
        <BadgeCheck className="size-6 text-success" aria-hidden />
        <p className="text-sm font-semibold text-success">Valid certificate issued by the Pakistan Institute of AI</p>
      </div>
      <dl className="grid gap-x-8 gap-y-5 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="eyebrow">Awarded to</dt>
          <dd className="mt-1 font-display text-display-sm text-ink">{cert.user.name}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="eyebrow">For completing</dt>
          <dd className="mt-1 text-[1.0625rem] font-semibold text-ink">
            <Link href={`/courses/${cert.course.slug}`} className="hover:text-accent">{cert.course.title}</Link>
          </dd>
          <dd className="text-sm text-ink-muted">{cert.course.subtitle} · {levelLabel(cert.course.level)} · {cert.course.durationHours} hours</dd>
        </div>
        <div>
          <dt className="eyebrow">Grade</dt>
          <dd className="mt-1 text-ink">{cert.grade ?? "Pass"}</dd>
        </div>
        <div>
          <dt className="eyebrow">Issued</dt>
          <dd className="mt-1 text-ink">{formatDate(cert.issuedAt)}</dd>
        </div>
        <div>
          <dt className="eyebrow">Instructor</dt>
          <dd className="mt-1 text-ink">{cert.course.instructor.name}</dd>
        </div>
        <div>
          <dt className="eyebrow">Code</dt>
          <dd className="mt-1 font-mono text-ink">{cert.code}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-3 border-t border-line px-6 py-4">
        <ButtonLink href={`/api/certificates/${cert.code}/pdf` as "/verify"} variant="outline" size="sm">
          Download PDF
        </ButtonLink>
        <ButtonLink href={`/verify/${cert.code}` as "/verify"} variant="ghost" size="sm">
          Permanent link
        </ButtonLink>
      </div>
    </div>
  );
}
