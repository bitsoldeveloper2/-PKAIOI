import type { Metadata } from "next";
import { BarChart3, KeyRound, ShieldCheck, Users } from "lucide-react";
import { getFeaturedCourses } from "@/server/queries/academy";
import { CourseCard } from "@/components/site/cards";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { EnterpriseForm } from "./enterprise-form";

export const metadata: Metadata = {
  title: "Enterprise",
  description: "Cohorts, private tracks and an enterprise portal for organisations building AI capability.",
  alternates: { canonical: "/enterprise" },
};

export default async function EnterprisePage() {
  const courses = await getFeaturedCourses(3);

  return (
    <div>
      <header className="relative -mt-16 overflow-hidden bg-[#0e1216] text-white md:-mt-[4.5rem]">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 60% at 85% 30%, rgba(61,180,140,0.2), transparent 60%)" }} />
        <div className="container-x relative grid gap-12 pb-20 pt-36 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:pb-28 lg:pt-44">
          <div>
            <p className="eyebrow text-white/65">Enterprise</p>
            <h1 className="mt-4 font-display text-display-lg text-white">Build AI capability across the organisation, not in one team.</h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              Cohorts on the institute’s courses, private tracks designed with your data, and a portal that shows programme managers exactly how their people are progressing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/enterprise/portal" variant="inverse" size="lg">Open the portal</ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg" className="border-white/25 text-white hover:bg-white/10">Talk to partnerships</ButtonLink>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: "Seats", body: "Add people with an invite code; manage seats from the portal." },
              { icon: BarChart3, label: "Reports", body: "Progress, completions and certificates per learner and per course." },
              { icon: KeyRound, label: "Access", body: "Owners and managers see their organisation only. Learners see their campus." },
              { icon: ShieldCheck, label: "Governance", body: "Every cohort completes the safety, alignment and governance course." },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <f.icon className="size-5 text-[#8fd7bb]" aria-hidden />
                <dt className="mt-4 font-semibold text-white">{f.label}</dt>
                <dd className="mt-1 text-sm text-white/65">{f.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section className="container-x grid gap-12 py-20 lg:grid-cols-[1fr_1fr]" aria-labelledby="ent-form-title">
        <div>
          <SectionHeading eyebrow="Partner with us" title={<span id="ent-form-title">Tell us about your team.</span>} lede="We reply within one working day with a proposal that fits the size of your team and the problems you are trying to solve." />
          <ul className="mt-8 space-y-3 text-[0.9375rem] text-ink-muted">
            <li>· <span className="text-ink">Team plan</span> — up to 25 seats on any published course, one manager portal.</li>
            <li>· <span className="text-ink">Enterprise plan</span> — unlimited courses, private cohorts, custom tracks, on-site workshops and quarterly reviews with faculty.</li>
            <li>· Invoiced in PKR or USD; instalments available.</li>
          </ul>
        </div>
        <EnterpriseForm />
      </section>

      <section className="border-t border-line bg-bg-deep py-20" aria-labelledby="ent-courses">
        <div className="container-x">
          <SectionHeading eyebrow="Popular with teams" title={<span id="ent-courses">Where most cohorts begin.</span>} action={<ButtonLink href="/courses" variant="outline">Full catalog</ButtonLink>} />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
