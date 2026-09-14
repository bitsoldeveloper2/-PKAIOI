import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/server/auth/dal";
import { getPostForEdit } from "@/server/queries/admin";
import { PostEditor } from "../../editors";

export const metadata: Metadata = { title: "Edit post" };

export default async function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("cms:manage", `/admin/cms/posts/${id}`);
  const post = id === "new" ? null : await getPostForEdit(id);
  if (id !== "new" && !post) notFound();

  return (
    <div className="container-wide py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/admin/cms" className="hover:text-ink">CMS</Link> <span aria-hidden>/</span> Journal
      </nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-display-sm text-ink">{post ? "Edit post" : "New post"}</h1>
        {post?.status === "PUBLISHED" ? <Link href={`/journal/${post.slug}`} className="text-sm text-accent hover:underline" target="_blank" rel="noopener">View live</Link> : null}
      </div>
      <div className="mt-8">
        <PostEditor
          post={post ? { id: post.id, title: post.title, excerpt: post.excerpt, body: post.body, category: post.category, tags: post.tags, status: post.status, publishedAt: post.publishedAt ? post.publishedAt.toISOString().slice(0, 10) : "" } : null}
        />
      </div>
    </div>
  );
}
