import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/server/queries/cms";
import { Markdown } from "@/components/markdown";
import { PostCard } from "@/components/site/cards";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.publishedAt?.toISOString(), authors: [post.author.name] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/journal/${post.slug}`,
  };

  return (
    <article className="container-narrow py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/journal" className="hover:text-ink">Journal</Link> <span aria-hidden>/</span> {post.category}
      </nav>
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <Badge tone="neutral">{post.category}</Badge>
          {post.publishedAt ? <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time> : null}
        </div>
        <h1 className="mt-4 font-display text-display-md text-ink">{post.title}</h1>
        <p className="mt-4 text-lg text-ink-muted">{post.excerpt}</p>
        <div className="mt-6 flex items-center gap-3 border-y border-line py-4">
          <Avatar name={post.author.name} src={post.author.avatarUrl} size="md" />
          <div className="text-sm">
            <p className="font-semibold text-ink">{post.author.name}</p>
            {post.author.headline ? <p className="text-ink-muted">{post.author.headline}</p> : null}
          </div>
        </div>
      </header>

      <Markdown content={post.body} className="mt-10" />

      {post.tags.length ? (
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
          {post.tags.map((t) => (
            <li key={t} className="rounded-full bg-surface-2 px-3 py-1 text-[0.8125rem] text-ink-muted">{t}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-14 rounded-xl border border-line bg-surface p-6">
        <p className="text-sm font-semibold text-ink">Get the next note by email</p>
        <p className="mt-1 text-sm text-ink-muted">One considered letter a month on research, admissions and what we are building.</p>
        <NewsletterForm className="mt-4 max-w-md" interest="Journal" />
      </div>

      {post.related.length ? (
        <section className="mt-16" aria-labelledby="related-title">
          <h2 id="related-title" className="eyebrow">More in {post.category}</h2>
          <div className="mt-6 grid gap-10 border-t border-line pt-8 sm:grid-cols-3">
            {post.related.map((r) => (
              <PostCard key={r.id} post={r} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
