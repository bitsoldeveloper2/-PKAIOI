import type { Metadata } from "next";
import { listProgramOptions } from "@/server/queries/academy";
import { getCurrentUser } from "@/server/auth/dal";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to a program at the Pakistan Institute of AI. The application takes about forty minutes.",
  alternates: { canonical: "/apply" },
};

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ program?: string }> }) {
  const [{ program }, programs, user] = await Promise.all([searchParams, listProgramOptions(), getCurrentUser()]);
  const preselected = programs.find((p) => p.slug === program)?.id;

  return (
    <div className="container-x grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0">
        <header className="max-w-2xl">
          <p className="eyebrow">Application</p>
          <h1 className="mt-4 font-display text-display-md text-ink">Tell us about the problem you want to solve.</h1>
          <p className="mt-4 text-[1.0625rem] text-ink-muted">
            Around forty minutes. Save your statement elsewhere as you write it — we read every one, and the best are specific.
          </p>
        </header>
        <ApplyForm
          className="mt-10"
          programs={programs.map((p) => ({ id: p.id, title: p.title }))}
          preselectedProgramId={preselected}
          defaults={user ? { name: user.name, email: user.email } : undefined}
        />
      </div>
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-line bg-surface p-5 text-sm">
          <p className="font-semibold text-ink">What makes a strong statement</p>
          <ul className="mt-3 space-y-2 text-ink-muted">
            <li>· A concrete problem from your work or community.</li>
            <li>· What you have already tried, and what broke.</li>
            <li>· Why this program, and what you will do after it.</li>
            <li>· Specific beats impressive. Two hundred honest words beat six hundred polished ones.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 text-sm">
          <p className="font-semibold text-ink">After you submit</p>
          <p className="mt-2 text-ink-muted">You will receive a reference number on this page. Admissions replies within ten working days; shortlisted applicants are invited to a 45-minute conversation with faculty.</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 text-sm">
          <p className="font-semibold text-ink">Need help?</p>
          <p className="mt-2 text-ink-muted">
            Write to <a href="mailto:admissions@pioai.edu.pk" className="link">admissions@pioai.edu.pk</a> or call +92 42 3577 0000, Monday to Friday, 9am–5pm.
          </p>
        </div>
      </aside>
    </div>
  );
}
