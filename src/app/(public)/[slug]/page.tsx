import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/server/queries/cms";
import { Markdown } from "@/components/markdown";
import { formatDate } from "@/lib/utils";

/** Editorial pages managed in the CMS (privacy, terms, accessibility, …). */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Page not found" };
  return { title: page.seoTitle ?? page.title, description: page.seoDescription ?? undefined, alternates: { canonical: `/${page.slug}` } };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{2,60}$/.test(slug) || slug === "about") notFound();
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <article className="container-narrow py-12 md:py-16">
      <p className="eyebrow">Institute</p>
      <h1 className="mt-4 font-display text-display-md text-ink">{page.title}</h1>
      <p className="mt-2 text-sm text-ink-muted">Updated {formatDate(page.updatedAt)}</p>
      <Markdown content={page.body} className="mt-10" />
    </article>
  );
}
