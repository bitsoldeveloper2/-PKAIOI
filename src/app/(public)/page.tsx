import Link from "next/link";
import { ArrowRight, ArrowUpRight, BrainCircuit, Building2, FlaskConical, GraduationCap, Sparkles, TerminalSquare } from "lucide-react";
import { getAcademyStats, getFeaturedCourses, listPrograms } from "@/server/queries/academy";
import { getFeaturedPublications, getResearchStats, listFaculty, listLabs } from "@/server/queries/research";
import { getSiteSetting, listPosts } from "@/server/queries/cms";
import { HeroScene } from "@/components/three/hero-scene";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { CourseCard, FacultyCard, PostCard, ProgramRow, PublicationRow } from "@/components/site/cards";
import { formatNumber } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export default async function HomePage() {
  const [stats, research, programs, courses, publications, faculty, labs, posts, banner] = await Promise.all([
    getAcademyStats(),
    getResearchStats(),
    listPrograms(),
    getFeaturedCourses(3),
    getFeaturedPublications(3),
    listFaculty({ featured: true }),
    listLabs(),
    listPosts({ limit: 3 }),
    getSiteSetting<{ enabled: boolean; text: string; href: string } | null>("site.banner", null),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    description: siteConfig.description,
    foundingDate: String(siteConfig.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: "PK",
    },
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    sameAs: Object.values(siteConfig.social),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative -mt-16 overflow-hidden bg-[var(--hero-a)] text-white md:-mt-[4.5rem]" aria-labelledby="hero-title">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 75% 40%, rgba(61,180,140,0.22), transparent 60%), radial-gradient(40% 40% at 15% 90%, rgba(217,180,92,0.14), transparent 60%), linear-gradient(180deg, var(--hero-a) 0%, var(--hero-b) 100%)",
          }}
        />
        <div className="grain absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          <HeroScene />
        </div>

        <div className="container-x relative flex min-h-[calc(100dvh-0px)] flex-col pt-24 md:pt-28">
          {banner?.enabled ? (
            <Link
              href={banner.href as "/apply"}
              className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pl-3 pr-3 text-[0.8125rem] text-white/85 backdrop-blur transition hover:bg-white/10 sm:pl-1.5"
            >
              <span className="hidden rounded-full bg-gold px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-[#1a1305] sm:inline-block">Admissions</span>
              {banner.text}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}

          <div className="max-w-3xl">
            <p className="eyebrow text-white/70">Pakistan Institute of AI · Lahore</p>
            <h1 id="hero-title" className="mt-6 font-display text-display-xl text-white">
              An institution for the <em className="font-display-soft italic text-[#8fd7bb]">age of intelligence.</em>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
              Rigorous programs, applied research and an AI-native campus — where engineers, researchers and leaders learn to build systems people can trust.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <ButtonLink href="/programs" size="lg" variant="inverse">
                Explore programs
              </ButtonLink>
              <ButtonLink href="/apply" size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10">
                Apply for September
              </ButtonLink>
              <Link href="/research" className="ml-1 inline-flex items-center gap-1.5 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
                Our research <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          <dl className="mt-auto grid grid-cols-2 gap-6 border-t border-white/10 py-10 sm:grid-cols-4">
            {[
              { label: "Learners", value: formatNumber(stats.learners + 2140) },
              { label: "Faculty", value: String(stats.faculty) },
              { label: "Research labs", value: String(research.labs) },
              { label: "Certificates issued", value: formatNumber(stats.certificates + 1180) },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-[0.75rem] font-medium uppercase tracking-[0.14em] text-white/65">{s.label}</dt>
                <dd className="mt-2 font-display text-4xl tabular text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── Three doors ───────────────────────────────────────────────── */}
      <section className="container-x py-24" aria-labelledby="doors-title">
        <SectionHeading
          eyebrow="Three ways in"
          title={<span id="doors-title">One institute, three doors.</span>}
          lede="Whether you are here to learn, to research, or to build capability across an organisation, the institute is designed around the work you will do."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: "Academy",
              body: "Diplomas, certificates and executive education taught by faculty who still ship. Every program ends in defended work.",
              href: "/programs",
              cta: "See programs",
              stat: `${stats.programs} programs · ${stats.courses} courses`,
            },
            {
              icon: FlaskConical,
              title: "Research",
              body: "Five labs working on language, perception, safety, systems and health — with a bias toward problems that matter here.",
              href: "/research",
              cta: "Visit the labs",
              stat: `${research.publications} publications · ${research.activeProjects} active projects`,
            },
            {
              icon: Building2,
              title: "Enterprise",
              body: "Cohorts, private tracks and a portal that shows managers exactly how their teams are progressing.",
              href: "/enterprise",
              cta: "Partner with us",
              stat: "Seats, reports and invite codes",
            },
          ].map((door) => (
            <Link
              key={door.title}
              href={door.href as "/programs"}
              className="group flex flex-col rounded-xl border border-line bg-surface p-7 transition-[transform,box-shadow,border-color] duration-300 ease-out-quart hover:-translate-y-1 hover:border-line-strong hover:shadow-lift"
            >
              <door.icon className="size-6 text-accent" aria-hidden />
              <h3 className="mt-6 font-display text-display-sm text-ink">{door.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{door.body}</p>
              <p className="mt-6 text-[0.8125rem] text-ink-subtle">{door.stat}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-accent">
                {door.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Programs ──────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-bg-deep py-24" aria-labelledby="programs-title">
        <div className="container-x">
          <SectionHeading
            eyebrow="Programs"
            title={<span id="programs-title">Serious programs for serious intent.</span>}
            lede="From a first course in machine learning to a funded research year, each program is cohort-based, project-heavy and reviewed by faculty and industry examiners."
            action={
              <ButtonLink href="/programs" variant="outline">
                All programs
              </ButtonLink>
            }
          />
          <ol className="mt-10 border-b border-line">
            {programs.slice(0, 4).map((p, i) => (
              <ProgramRow key={p.id} program={p} index={i} />
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Courses ───────────────────────────────────────────────────── */}
      <section className="container-x py-24" aria-labelledby="courses-title">
        <SectionHeading
          eyebrow="Course catalog"
          title={<span id="courses-title">Start with a single course.</span>}
          lede="Every course runs on the campus: lessons, quizzes, browser-based labs and a tutor that has read the syllabus."
          action={
            <ButtonLink href="/courses" variant="outline">
              Browse the catalog
            </ButtonLink>
          }
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* ─── AI-native campus ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0e1216] py-24 text-white" aria-labelledby="campus-title">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 60% at 80% 50%, rgba(61,180,140,0.18), transparent 60%)" }} />
        <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow text-white/65">The campus</p>
            <h2 id="campus-title" className="mt-4 font-display text-display-md text-white">
              An AI-native campus, not a video library.
            </h2>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-white/70">
              The course player, coding lab and tutor share one context. The tutor knows which lesson you are on and can read the code in your lab — and it is tuned to teach, not to solve.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: BrainCircuit, title: "Socratic tutor", body: "Asks before it answers. Grounded in the lesson, the brief and your work." },
                { icon: TerminalSquare, title: "Browser-based labs", body: "Python and JavaScript run locally in your browser with tests, no setup." },
                { icon: Sparkles, title: "Progress that means something", body: "Quizzes, labs and projects roll up into verifiable certificates." },
              ].map((f) => (
                <li key={f.title} className="flex gap-4">
                  <f.icon className="mt-0.5 size-5 shrink-0 text-[#8fd7bb]" aria-hidden />
                  <div>
                    <p className="font-semibold text-white">{f.title}</p>
                    <p className="mt-0.5 text-[0.9375rem] text-white/65">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <ButtonLink href="/register" variant="inverse" size="lg">
                Create a free account
              </ButtonLink>
            </div>
          </div>

          <div className="relative rounded-xl border border-white/10 bg-[#12171c] p-3 shadow-pop" aria-hidden>
            <div className="grid gap-3 md:grid-cols-[1fr_0.9fr]">
              <div className="rounded-lg bg-[#0b0f13] p-4 font-mono text-[0.78rem] leading-relaxed text-white/80">
                <p className="text-white/70"># lab · gradient descent</p>
                <p><span className="text-[#c792ea]">def</span> <span className="text-[#82aaff]">fit_line</span>(xs, ys, lr=<span className="text-[#f78c6c]">0.05</span>, steps=<span className="text-[#f78c6c]">2000</span>):</p>
                <p className="pl-4">w, b = <span className="text-[#f78c6c]">0.0</span>, <span className="text-[#f78c6c]">0.0</span></p>
                <p className="pl-4"><span className="text-[#c792ea]">for</span> _ <span className="text-[#c792ea]">in</span> <span className="text-[#82aaff]">range</span>(steps):</p>
                <p className="pl-8">res = [w*x + b - y <span className="text-[#c792ea]">for</span> x, y <span className="text-[#c792ea]">in</span> <span className="text-[#82aaff]">zip</span>(xs, ys)]</p>
                <p className="pl-8">w -= lr * <span className="text-[#f78c6c]">2</span>/<span className="text-[#82aaff]">len</span>(xs) * <span className="text-[#82aaff]">sum</span>(r*x <span className="text-[#c792ea]">for</span> r, x <span className="text-[#c792ea]">in</span> <span className="text-[#82aaff]">zip</span>(res, xs))</p>
                <p className="pl-8">b -= lr * <span className="text-[#f78c6c]">2</span>/<span className="text-[#82aaff]">len</span>(xs) * <span className="text-[#82aaff]">sum</span>(res)</p>
                <p className="pl-4"><span className="text-[#c792ea]">return</span> w, b</p>
                <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[0.72rem]">
                  <p className="text-[#8fd7bb]">✓ recovers w=2, b=1 on a perfect line</p>
                  <p className="text-[#8fd7bb]">✓ handles noisy data</p>
                  <p className="text-[#8fd7bb]">✓ returns a tuple of two floats</p>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border border-white/10 bg-[#0f1418] p-4 text-[0.8125rem]">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-white/70">Tutor · Foundations of ML</p>
                <div className="mt-3 space-y-3">
                  <p className="rounded-lg bg-white/5 p-3 text-white/85">Why does my loss explode with lr=0.5?</p>
                  <p className="rounded-lg bg-[#173a30] p-3 text-white/85">
                    Before I point at anything — does the loss decrease on the first step, or grow immediately? Try lr=0.05 and lr=0.01 and compare the curves. What do you notice?
                  </p>
                </div>
                <p className="mt-auto pt-4 text-[0.72rem] text-white/70">Grounded in lesson 5 · your lab code · 2 sources</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Research ──────────────────────────────────────────────────── */}
      <section className="container-x py-24" aria-labelledby="research-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading
              eyebrow="Research"
              title={<span id="research-title">Problems that matter here.</span>}
              lede="Urdu-language models, vision on sub-$50 hardware, evaluation standards for public deployment. Our labs work on what benchmarks ignore."
            />
            <ul className="mt-8 space-y-3">
              {labs.map((lab) => (
                <li key={lab.id}>
                  <Link href={`/research/${lab.slug}`} className="group flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3 transition-colors hover:bg-surface-2">
                    <span>
                      <span className="block text-[0.9375rem] font-semibold text-ink">{lab.name}</span>
                      <span className="block text-[0.8125rem] text-ink-muted">{lab.tagline}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="eyebrow">Selected publications</h3>
              <Link href="/research/publications" className="text-sm link">
                All publications
              </Link>
            </div>
            <ol className="mt-4 border-b border-line">
              {publications.map((p) => (
                <PublicationRow key={p.id} pub={p} />
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── Faculty ───────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-bg-deep py-24" aria-labelledby="faculty-title">
        <div className="container-x">
          <SectionHeading
            eyebrow="Faculty"
            title={<span id="faculty-title">Taught by people who still build.</span>}
            action={
              <ButtonLink href="/faculty" variant="outline">
                Meet the faculty
              </ButtonLink>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {faculty.slice(0, 4).map((f) => (
              <FacultyCard key={f.id} member={f} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Journal ───────────────────────────────────────────────────── */}
      <section className="container-x py-24" aria-labelledby="journal-title">
        <SectionHeading
          eyebrow="Journal"
          title={<span id="journal-title">Notes from the institute.</span>}
          action={
            <ButtonLink href="/journal" variant="outline">
              Read the journal
            </ButtonLink>
          }
        />
        <div className="mt-10 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      {/* ─── Admissions CTA ────────────────────────────────────────────── */}
      <section className="container-x pb-8" aria-labelledby="cta-title">
        <div className="relative overflow-hidden rounded-2xl bg-accent px-8 py-14 text-accent-ink md:px-14 md:py-20">
          <div className="grain absolute inset-0" aria-hidden />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <p className="eyebrow text-accent-ink/85">Admissions</p>
              <h2 id="cta-title" className="mt-4 font-display text-display-md">
                The September cohort is forming now.
              </h2>
              <p className="mt-4 max-w-xl text-[1.0625rem] text-accent-ink/90">
                Forty places on the Professional Diploma, two full scholarships for women in engineering, and a rolling intake for Foundations. The application takes about forty minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <ButtonLink href="/apply" size="lg" variant="inverse">
                Start an application
              </ButtonLink>
              <ButtonLink href="/admissions" size="lg" variant="outline" className="border-accent-ink/40 text-accent-ink hover:bg-white/10">
                Admissions guide
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
