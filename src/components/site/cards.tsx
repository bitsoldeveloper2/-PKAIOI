import Link from "next/link";
import { ArrowUpRight, Clock, Layers, Users } from "lucide-react";
import type { CourseCard as CourseCardData, ProgramSummary } from "@/server/queries/academy";
import type { Pricing } from "@/lib/pricing";
import { cn, formatDate, formatPkr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

/** Course accent keys map to editorial colour fields used on cards and headers. */
export const ACCENTS: Record<string, { bg: string; fg: string; soft: string }> = {
  jade: { bg: "#0f6e56", fg: "#f4fbf8", soft: "#dfeee8" },
  gold: { bg: "#8a6a1f", fg: "#fff8e6", soft: "#f3e9cf" },
  violet: { bg: "#4b3f8f", fg: "#f3f1ff", soft: "#e4e0f4" },
  coral: { bg: "#a8442f", fg: "#fff3ef", soft: "#f6ddd6" },
  sky: { bg: "#1f5c8a", fg: "#eef6ff", soft: "#d9e7f3" },
  ink: { bg: "#151a20", fg: "#eeeae2", soft: "#e3e0d9" },
  slate: { bg: "#3c4b5a", fg: "#f1f4f7", soft: "#dfe4e9" },
};

export function accentFor(key: string) {
  return ACCENTS[key] ?? ACCENTS.jade!;
}

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  FOUNDATION: "Foundation",
  PROFESSIONAL: "Professional",
  EXECUTIVE: "Executive",
  RESEARCH: "Research",
  SHORT_COURSE: "Short course",
};

export function levelLabel(level: string) {
  return LEVEL_LABEL[level] ?? level;
}

export function CourseCard({ course, className }: { course: CourseCardData; className?: string }) {
  const accent = accentFor(course.accent);
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-[transform,box-shadow,border-color] duration-300 ease-out-quart hover:-translate-y-1 hover:border-line-strong hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden" style={{ background: accent.bg, color: accent.fg }}>
        <div className="grain absolute inset-0" aria-hidden />
        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] opacity-90">{course.category}</span>
            {course.featured ? <span className="rounded-full border border-current/30 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider">Featured</span> : null}
          </div>
          <p className="font-display text-[1.75rem] leading-[1.05] tracking-tight">{course.title}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.9375rem] leading-snug text-ink-muted">{course.subtitle}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem] text-ink-muted">
          <span className="inline-flex items-center gap-1.5"><Layers className="size-3.5" aria-hidden />{course.moduleCount} modules · {course.lessonCount} lessons</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden />{course.durationHours}h</span>
          {course.enrollmentCount > 0 ? <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" aria-hidden />{course.enrollmentCount} enrolled</span> : null}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="flex items-center gap-2 text-sm">
            <Avatar name={course.instructor.name} src={course.instructor.avatarUrl} size="xs" />
            <span className="text-ink-muted">{course.instructor.name}</span>
          </div>
          <Badge tone="outline">{levelLabel(course.level)}</Badge>
        </div>
      </div>
      <Link href={`/courses/${course.slug}`} className="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label={`${course.title}: ${course.subtitle}`}>
        <span className="sr-only">Open course</span>
      </Link>
    </article>
  );
}

/** A program fee; when a promotion applies, the list fee is struck through beside the offer badge. */
export function ProgramPrice({ pricing, className }: { pricing: Pricing; className?: string }) {
  if (pricing.tuitionPkr == null) return <span className={className}>Fully funded</span>;
  if (pricing.listPkr == null || pricing.listPkr === pricing.tuitionPkr) return <span className={className}>{formatPkr(pricing.tuitionPkr)}</span>;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span>{formatPkr(pricing.tuitionPkr)}</span>
      <s className="text-[0.8125rem] font-normal text-ink-subtle">
        <span className="sr-only">was </span>
        {formatPkr(pricing.listPkr)}
      </s>
      <Badge tone="gold">{`${pricing.percentOff}% off`}</Badge>
    </span>
  );
}

export function ProgramRow({ program, index }: { program: ProgramSummary; index?: number }) {
  return (
    <li className="group relative grid gap-4 border-t border-line py-7 md:grid-cols-[3rem_1fr_auto] md:items-baseline md:gap-8">
      <span className="font-display text-xl text-ink-subtle tabular">{index != null ? String(index + 1).padStart(2, "0") : "—"}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{levelLabel(program.level)}</Badge>
          <span className="text-[0.8125rem] text-ink-muted">{program.format}</span>
        </div>
        <h3 className="mt-3 font-display text-display-sm text-ink transition-colors group-hover:text-accent">
          <Link href={`/programs/${program.slug}`} className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <span className="absolute inset-0" aria-hidden />
            {program.title}
          </Link>
        </h3>
        <p className="mt-2 max-w-2xl text-[0.9375rem] text-ink-muted">{program.tagline}</p>
      </div>
      <dl className="flex gap-8 text-sm md:flex-col md:items-end md:gap-2">
        <div className="text-right">
          <dt className="eyebrow">Duration</dt>
          <dd className="mt-1 tabular text-ink">{program.durationWeeks} weeks</dd>
        </div>
        <div className="text-right">
          <dt className="eyebrow">Tuition</dt>
          <dd className="mt-1 tabular text-ink"><ProgramPrice pricing={program.pricing} /></dd>
        </div>
      </dl>
      <ArrowUpRight className="absolute right-0 top-8 hidden size-5 text-ink-subtle opacity-0 transition-opacity group-hover:opacity-100 md:block" aria-hidden />
    </li>
  );
}

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: Date | null;
  author: { name: string; avatarUrl: string | null };
};

export function PostCard({ post, featured }: { post: PostCardData; featured?: boolean }) {
  return (
    <article className={cn("group relative flex flex-col", featured && "lg:col-span-2")}>
      <div className="flex items-center gap-3 text-[0.8125rem] text-ink-muted">
        <Badge tone="neutral">{post.category}</Badge>
        {post.publishedAt ? <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time> : null}
      </div>
      <h3 className={cn("mt-3 font-display text-ink transition-colors group-hover:text-accent", featured ? "text-display-md" : "text-[1.5rem] leading-[1.15]")}>
        <Link href={`/journal/${post.slug}`} className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span className="absolute inset-0" aria-hidden />
          {post.title}
        </Link>
      </h3>
      <p className={cn("mt-3 text-ink-muted", featured ? "max-w-2xl text-[1.0625rem]" : "text-[0.9375rem]")}>{post.excerpt}</p>
      <div className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
        <Avatar name={post.author.name} src={post.author.avatarUrl} size="xs" />
        {post.author.name}
      </div>
    </article>
  );
}

export type PublicationRowData = {
  slug: string;
  title: string;
  venue: string;
  year: number;
  type: string;
  authors: string[];
  lab: { slug: string; name: string } | null;
};

const PUB_TYPE: Record<string, string> = { PAPER: "Paper", PREPRINT: "Preprint", REPORT: "Report", DATASET: "Dataset" };

export function PublicationRow({ pub }: { pub: PublicationRowData }) {
  return (
    <li className="group relative grid gap-2 border-t border-line py-5 md:grid-cols-[5rem_1fr] md:gap-6">
      <span className="font-display text-lg text-ink-subtle tabular">{pub.year}</span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="outline">{PUB_TYPE[pub.type] ?? pub.type}</Badge>
          {pub.lab ? <span className="text-[0.8125rem] text-ink-muted">{pub.lab.name}</span> : null}
        </div>
        <h3 className="mt-2 text-[1.0625rem] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          <Link href={`/research/publications/${pub.slug}`} className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <span className="absolute inset-0" aria-hidden />
            {pub.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          {pub.authors.join(", ")} · <span className="italic">{pub.venue}</span>
        </p>
      </div>
    </li>
  );
}

export type FacultyCardData = {
  slug: string;
  name: string;
  title: string;
  department: string;
  photoUrl: string | null;
  expertise: string[];
};

export function FacultyCard({ member }: { member: FacultyCardData }) {
  return (
    <article className="group relative flex gap-4 rounded-xl border border-line bg-surface p-5 transition-[transform,box-shadow,border-color] duration-300 ease-out-quart hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift">
      <Avatar name={member.name} src={member.photoUrl} size="lg" />
      <div className="min-w-0">
        <h3 className="text-[1.0625rem] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          <Link href={`/faculty/${member.slug}`} className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <span className="absolute inset-0" aria-hidden />
            {member.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-ink-muted">{member.title}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Expertise">
          {member.expertise.slice(0, 3).map((e) => (
            <li key={e} className="rounded-full bg-surface-2 px-2 py-0.5 text-[0.75rem] text-ink-muted">
              {e}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
