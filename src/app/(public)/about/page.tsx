import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/server/queries/cms";
import { listLabs } from "@/server/queries/research";
import { getAcademyStats } from "@/server/queries/academy";
import { Markdown } from "@/components/markdown";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about");
  return {
    title: page?.seoTitle ?? "About",
    description: page?.seoDescription ?? "Why The Institute of Artificial Intelligence exists and what it stands for.",
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const [page, labs, stats] = await Promise.all([getPageBySlug("about"), listLabs(), getAcademyStats()]);
  if (!page) notFound();

  return (
    <div>
      <header className="border-b border-line bg-bg-deep">
        <div className="container-x grid gap-10 py-16 md:grid-cols-[1.3fr_1fr] md:items-end md:py-24">
          <div>
            <p className="eyebrow">About the institute</p>
            <h1 className="mt-4 font-display text-display-lg text-ink">Built in Lahore, for the age of intelligence.</h1>
            <p className="mt-5 max-w-xl text-[1.0625rem] text-ink-muted">
              A not-for-profit institution educating engineers, researchers and leaders in artificial intelligence, with research that starts from the problems of two hundred and forty million people.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {[
              { label: "Founded", value: "2024" },
              { label: "Courses", value: String(stats.courses) },
              { label: "Programs", value: String(stats.programs) },
              { label: "Research labs", value: String(labs.length) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
                <dt className="eyebrow">{s.label}</dt>
                <dd className="mt-2 font-display text-3xl tabular text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="container-x grid gap-14 py-16 lg:grid-cols-[1fr_18rem]">
        <Markdown content={page.body} />
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="On this page" className="rounded-xl border border-line bg-surface p-5 text-sm">
            <p className="font-semibold text-ink">Contents</p>
            <ul className="mt-3 space-y-2 text-ink-muted">
              {["Why we exist", "What we believe", "Governance", "Campus", "Partners"].map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </nav>
          <div className="rounded-xl border border-line bg-surface p-5 text-sm">
            <p className="font-semibold text-ink">Visit</p>
            <p className="mt-2 text-ink-muted">Block 7, Gulberg III, Lahore 54660. Campus tours run every Friday at 11am — book through admissions.</p>
            <ButtonLink href="/contact" variant="outline" size="sm" className="mt-4">
              Contact the institute
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
