import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, FileCheck2, MessagesSquare, Sparkles } from "lucide-react";
import { listPrograms } from "@/server/queries/academy";
import { getSiteSetting } from "@/server/queries/cms";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { levelLabel } from "@/components/site/cards";
import { formatPkr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admissions",
  description: "Intakes, requirements, scholarships and how to apply to the Pakistan Institute of AI.",
  alternates: { canonical: "/admissions" },
};

export default async function AdmissionsPage() {
  const [programs, intakes] = await Promise.all([
    listPrograms(),
    getSiteSetting<Record<string, string>>("admissions.intakes", {}),
  ]);

  const steps = [
    { icon: FileCheck2, title: "Apply online", body: "A forty-minute form: your background, a statement about a problem you want to solve with AI, and a CV or LinkedIn profile." },
    { icon: MessagesSquare, title: "Talk to faculty", body: "Shortlisted applicants have a 45-minute conversation with a member of faculty. It is technical for technical programs, and candid for all of them." },
    { icon: Sparkles, title: "Decision within ten days", body: "Offers, waitlists and referrals to a better-fitting program are communicated with reasons. Scholarship decisions arrive with the offer." },
    { icon: CalendarDays, title: "Join the cohort", body: "Accept, pay the deposit or scholarship confirmation, and meet your cohort at orientation." },
  ];

  return (
    <div>
      <header className="border-b border-line bg-bg-deep">
        <div className="container-x grid gap-10 py-16 md:grid-cols-[1.3fr_1fr] md:items-end md:py-24">
          <div>
            <p className="eyebrow">Admissions</p>
            <h1 className="mt-4 font-display text-display-lg text-ink">Admission is a conversation, not a filter.</h1>
            <p className="mt-5 max-w-xl text-[1.0625rem] text-ink-muted">
              We admit for evidence of independent thinking and a real problem you care about. Credentials help; they are not the point.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/apply" size="lg">Start an application</ButtonLink>
              <ButtonLink href="/contact" size="lg" variant="outline">Ask admissions a question</ButtonLink>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {Object.entries(intakes).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-surface p-4">
                <dt className="eyebrow">{k === "llm" ? "LLM certificate" : k}</dt>
                <dd className="mt-2 text-[0.9375rem] font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className="container-x py-20" aria-labelledby="process-title">
        <SectionHeading eyebrow="How it works" title={<span id="process-title">Four steps.</span>} />
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-line bg-surface p-6">
              <div className="flex items-center justify-between">
                <s.icon className="size-5 text-accent" aria-hidden />
                <span className="font-display text-lg text-ink-subtle tabular">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-5 text-[1.0625rem] font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-[0.9375rem] text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-bg-deep py-20" aria-labelledby="req-title">
        <div className="container-x">
          <SectionHeading eyebrow="Requirements by program" title={<span id="req-title">What each program asks for.</span>} />
          <div className="mt-10 overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-5 py-3">Program</th>
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Tuition</th>
                  <th className="px-5 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-4 font-medium text-ink">
                      <Link href={`/programs/${p.slug}`} className="hover:text-accent">{p.title}</Link>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{levelLabel(p.level)}</td>
                    <td className="px-5 py-4 tabular text-ink-muted">{p.durationWeeks} weeks</td>
                    <td className="px-5 py-4 tabular text-ink-muted">{p.tuitionPkr ? formatPkr(p.tuitionPkr) : "Fully funded"}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/apply?program=${p.slug}` as "/apply"} className="link">Apply</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="container-x py-20" aria-labelledby="schol-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeading eyebrow="Scholarships & funding" title={<span id="schol-title">Money should not be the reason you do not apply.</span>} />
          </div>
          <ul className="space-y-4 text-[0.9375rem] text-ink-muted">
            <li className="rounded-xl border border-line bg-surface p-5"><span className="font-semibold text-ink">Women in Engineering scholarships.</span> Two full-tuition awards per diploma cohort, funded by an alumni gift.</li>
            <li className="rounded-xl border border-line bg-surface p-5"><span className="font-semibold text-ink">Need-based awards.</span> Up to 50% of tuition on the diploma and certificates. Indicate need on the application; no separate form.</li>
            <li className="rounded-xl border border-line bg-surface p-5"><span className="font-semibold text-ink">Employer sponsorship.</span> Many learners are sponsored through the enterprise programme. Ask your manager, or ask us to write to them.</li>
            <li className="rounded-xl border border-line bg-surface p-5"><span className="font-semibold text-ink">Instalments.</span> Tuition can be paid in three instalments across the program at no extra cost.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
