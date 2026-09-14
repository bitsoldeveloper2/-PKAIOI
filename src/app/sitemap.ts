import type { MetadataRoute } from "next";
import { db } from "@/server/db";
import { siteConfig } from "@/lib/site";

/** Regenerated hourly so new courses, posts and publications appear without a rebuild. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const [courses, programs, posts, labs, publications, faculty, pages] = await Promise.all([
    db.course.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.program.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.researchLab.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.publication.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.faculty.findMany({ select: { slug: true, updatedAt: true } }),
    db.page.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/academy`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/programs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/courses`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/admissions`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/apply`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/research`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/research/publications`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/faculty`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/enterprise`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/verify`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  return [
    ...statics,
    ...pages.filter((p) => p.slug !== "about").map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "yearly" as const, priority: 0.3 })),
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...programs.map((p) => ({ url: `${base}/programs/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...courses.map((c) => ({ url: `${base}/courses/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...labs.map((l) => ({ url: `${base}/research/${l.slug}`, lastModified: l.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...publications.map((p) => ({ url: `${base}/research/publications/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "yearly" as const, priority: 0.5 })),
    ...faculty.map((f) => ({ url: `${base}/faculty/${f.slug}`, lastModified: f.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...posts.map((p) => ({ url: `${base}/journal/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
