import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/dal";
import { getLabForEdit, getProjectForEdit, getPublicationForEdit, getResearchEditData } from "@/server/queries/admin";
import { LabForm, ProjectForm, PublicationForm } from "../../research-forms";

export const metadata: Metadata = { title: "Edit research item" };

const KINDS = ["labs", "publications", "projects"] as const;
type Kind = (typeof KINDS)[number];
const LABEL: Record<Kind, string> = { labs: "Lab", publications: "Publication", projects: "Project" };

export default async function ResearchEditPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if (!(KINDS as readonly string[]).includes(kind)) notFound();
  const k = kind as Kind;
  await requirePermission("research:manage", `/admin/research/${kind}/${id}`);
  const isNew = id === "new";
  const { labs } = await getResearchEditData();

  let form: React.ReactNode;
  if (k === "labs") {
    const lab = isNew ? null : await getLabForEdit(id);
    if (!isNew && !lab) notFound();
    form = <LabForm lab={lab ? { id: lab.id, name: lab.name, tagline: lab.tagline, description: lab.description, focusAreas: lab.focusAreas, published: lab.published, order: lab.order } : null} />;
  } else if (k === "publications") {
    const pub = isNew ? null : await getPublicationForEdit(id);
    if (!isNew && !pub) notFound();
    form = <PublicationForm publication={pub ? { id: pub.id, title: pub.title, abstract: pub.abstract, authors: pub.authors, venue: pub.venue, year: pub.year, type: pub.type, url: pub.url ?? "", labId: pub.labId ?? "", featured: pub.featured, published: pub.published } : null} labs={labs} />;
  } else {
    const project = isNew ? null : await getProjectForEdit(id);
    if (!isNew && !project) notFound();
    form = <ProjectForm project={project ? { id: project.id, title: project.title, summary: project.summary, description: project.description, status: project.status, labId: project.labId, startedAt: project.startedAt.toISOString().slice(0, 10), endedAt: project.endedAt ? project.endedAt.toISOString().slice(0, 10) : "", published: project.published } : null} labs={labs} />;
  }

  return (
    <div className="container-wide py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/admin/research" className="hover:text-ink">Research</Link> <span aria-hidden>/</span> {LABEL[k]}
      </nav>
      <h1 className="mt-4 font-display text-display-sm text-ink">{isNew ? `New ${LABEL[k].toLowerCase()}` : `Edit ${LABEL[k].toLowerCase()}`}</h1>
      <div className="mt-8 max-w-3xl">{form}</div>
    </div>
  );
}
