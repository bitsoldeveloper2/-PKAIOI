import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/dal";
import { getPageForEdit } from "@/server/queries/admin";
import { PageEditor } from "../../editors";

export const metadata: Metadata = { title: "Edit page" };

export default async function PageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("cms:manage", `/admin/cms/pages/${id}`);
  const page = id === "new" ? null : await getPageForEdit(id);
  if (id !== "new" && !page) notFound();

  return (
    <div className="container-wide py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/admin/cms" className="hover:text-ink">CMS</Link> <span aria-hidden>/</span> Pages
      </nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-display-sm text-ink">{page ? `Edit “${page.title}”` : "New page"}</h1>
        {page?.status === "PUBLISHED" ? <Link href={`/${page.slug}` as "/about"} className="text-sm text-accent hover:underline" target="_blank" rel="noopener">View live</Link> : null}
      </div>
      <div className="mt-8">
        <PageEditor page={page ? { id: page.id, slug: page.slug, title: page.title, body: page.body, seoTitle: page.seoTitle ?? "", seoDescription: page.seoDescription ?? "", status: page.status } : null} />
      </div>
    </div>
  );
}
