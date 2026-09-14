import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/dal";
import { getProgramForEdit } from "@/server/queries/admin";
import { ProgramForm } from "../../program-form";

export const metadata: Metadata = { title: "Edit program" };

export default async function ProgramEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("academy:manage", `/admin/academy/programs/${id}`);
  const program = id === "new" ? null : await getProgramForEdit(id);
  if (id !== "new" && !program) notFound();

  return (
    <div className="container-wide py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/admin/academy" className="hover:text-ink">Academy</Link> <span aria-hidden>/</span> Programs
      </nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-display-sm text-ink">{program ? `Edit “${program.title}”` : "New program"}</h1>
        {program?.published ? <Link href={`/programs/${program.slug}`} className="text-sm text-accent hover:underline" target="_blank" rel="noopener">View live</Link> : null}
      </div>
      <div className="mt-8">
        <ProgramForm
          program={
            program
              ? {
                  id: program.id,
                  title: program.title,
                  tagline: program.tagline,
                  level: program.level,
                  format: program.format,
                  durationWeeks: program.durationWeeks,
                  tuitionPkr: program.tuitionPkr,
                  summary: program.summary,
                  description: program.description,
                  outcomes: program.outcomes,
                  curriculum: program.curriculum.map((b) => `# ${b.title}\n${b.items.map((i) => `- ${i}`).join("\n")}`).join("\n\n"),
                  intake: program.admissions.intake ?? "",
                  deadline: program.admissions.deadline ?? "",
                  requirements: program.admissions.requirements ?? [],
                  featured: program.featured,
                  published: program.published,
                  order: program.order,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
