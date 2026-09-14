import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import { stringList } from "@/lib/utils";

const postCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  category: true,
  tags: true,
  publishedAt: true,
  author: { select: { name: true, avatarUrl: true, headline: true } },
} as const;

export const listPosts = cache(async (opts: { category?: string; limit?: number; q?: string } = {}) => {
  const posts = await db.post.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      ...(opts.category ? { category: opts.category } : {}),
      ...(opts.q ? { OR: [{ title: { contains: opts.q } }, { excerpt: { contains: opts.q } }, { body: { contains: opts.q } }] } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: opts.limit,
    select: postCardSelect,
  });
  return posts.map((p) => ({ ...p, tags: stringList(p.tags) }));
});

export const listPostCategories = cache(async () => {
  const rows = await db.post.groupBy({ by: ["category"], where: { status: "PUBLISHED" }, _count: { _all: true }, orderBy: { category: "asc" } });
  return rows.map((r) => ({ category: r.category, count: r._count._all }));
});

export const getPostBySlug = cache(async (slug: string) => {
  const post = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { ...postCardSelect, body: true, updatedAt: true },
  });
  if (!post) return null;
  const related = await db.post.findMany({
    where: { status: "PUBLISHED", category: post.category, id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: postCardSelect,
  });
  return { ...post, tags: stringList(post.tags), related: related.map((r) => ({ ...r, tags: stringList(r.tags) })) };
});

export const getPageBySlug = cache(async (slug: string) =>
  db.page.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { slug: true, title: true, body: true, seoTitle: true, seoDescription: true, updatedAt: true },
  }),
);

export const listAnnouncements = cache(async (audiences: string[], limit = 5) =>
  db.announcement.findMany({
    where: {
      audience: { in: audiences },
      publishedAt: { lte: new Date() },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: { id: true, title: true, body: true, publishedAt: true, author: { select: { name: true } } },
  }),
);

export const listUpcomingEvents = cache(async (limit = 6, courseIds?: string[]) =>
  db.campusEvent.findMany({
    where: {
      published: true,
      endsAt: { gte: new Date() },
      ...(courseIds ? { OR: [{ courseId: null }, { courseId: { in: courseIds } }] } : {}),
    },
    orderBy: { startsAt: "asc" },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      location: true,
      startsAt: true,
      endsAt: true,
      course: { select: { slug: true, title: true } },
    },
  }),
);

export const getSiteSetting = cache(async <T,>(key: string, fallback: T): Promise<T> => {
  const row = await db.siteSetting.findUnique({ where: { key } });
  return (row?.value as T | undefined) ?? fallback;
});
