import "server-only";
import { db } from "@/server/db";

export type SearchHit = {
  type: "course" | "program" | "post" | "publication" | "faculty" | "lab" | "page";
  title: string;
  subtitle: string;
  href: string;
  meta?: string;
};

const TYPE_LABEL: Record<SearchHit["type"], string> = {
  course: "Course",
  program: "Program",
  post: "Journal",
  publication: "Publication",
  faculty: "Faculty",
  lab: "Research lab",
  page: "Page",
};

export function searchTypeLabel(type: SearchHit["type"]) {
  return TYPE_LABEL[type];
}

/** Simple relevance: exact title match > title prefix > title contains > body contains. */
function score(q: string, title: string, body: string) {
  const t = title.toLowerCase();
  const k = q.toLowerCase();
  if (t === k) return 100;
  if (t.startsWith(k)) return 80;
  if (t.includes(k)) return 60;
  if (body.toLowerCase().includes(k)) return 30;
  return 10;
}

/**
 * Site-wide search across public entities. SQLite `contains` is case-insensitive
 * for ASCII; results are re-ranked in memory so titles outrank body matches.
 */
export async function searchSite(rawQuery: string, limit = 20): Promise<SearchHit[]> {
  const q = rawQuery.trim().slice(0, 80);
  if (q.length < 2) return [];
  const take = 8;

  const [courses, programs, posts, publications, faculty, labs, pages] = await Promise.all([
    db.course.findMany({
      where: { status: "PUBLISHED", OR: [{ title: { contains: q } }, { subtitle: { contains: q } }, { description: { contains: q } }, { category: { contains: q } }] },
      select: { slug: true, title: true, subtitle: true, category: true, description: true },
      take,
    }),
    db.program.findMany({
      where: { published: true, OR: [{ title: { contains: q } }, { tagline: { contains: q } }, { summary: { contains: q } }] },
      select: { slug: true, title: true, tagline: true, summary: true, level: true },
      take,
    }),
    db.post.findMany({
      where: { status: "PUBLISHED", OR: [{ title: { contains: q } }, { excerpt: { contains: q } }, { body: { contains: q } }] },
      select: { slug: true, title: true, excerpt: true, body: true, category: true },
      take,
    }),
    db.publication.findMany({
      where: { published: true, OR: [{ title: { contains: q } }, { abstract: { contains: q } }, { venue: { contains: q } }] },
      select: { slug: true, title: true, venue: true, abstract: true, year: true },
      take,
    }),
    db.faculty.findMany({
      where: { OR: [{ name: { contains: q } }, { title: { contains: q } }, { department: { contains: q } }, { bio: { contains: q } }] },
      select: { slug: true, name: true, title: true, department: true, bio: true },
      take,
    }),
    db.researchLab.findMany({
      where: { published: true, OR: [{ name: { contains: q } }, { tagline: { contains: q } }, { description: { contains: q } }] },
      select: { slug: true, name: true, tagline: true, description: true },
      take,
    }),
    db.page.findMany({
      where: { status: "PUBLISHED", OR: [{ title: { contains: q } }, { body: { contains: q } }] },
      select: { slug: true, title: true, body: true },
      take: 4,
    }),
  ]);

  const hits: (SearchHit & { score: number })[] = [
    ...courses.map((c) => ({ type: "course" as const, title: c.title, subtitle: c.subtitle, href: `/courses/${c.slug}`, meta: c.category, score: score(q, c.title, c.description) + 5 })),
    ...programs.map((p) => ({ type: "program" as const, title: p.title, subtitle: p.tagline, href: `/programs/${p.slug}`, meta: p.level, score: score(q, p.title, p.summary) + 5 })),
    ...posts.map((p) => ({ type: "post" as const, title: p.title, subtitle: p.excerpt, href: `/journal/${p.slug}`, meta: p.category, score: score(q, p.title, p.body) })),
    ...publications.map((p) => ({ type: "publication" as const, title: p.title, subtitle: p.venue, href: `/research/publications/${p.slug}`, meta: String(p.year), score: score(q, p.title, p.abstract) })),
    ...faculty.map((f) => ({ type: "faculty" as const, title: f.name, subtitle: f.title, href: `/faculty/${f.slug}`, meta: f.department, score: score(q, f.name, f.bio) + 3 })),
    ...labs.map((l) => ({ type: "lab" as const, title: l.name, subtitle: l.tagline, href: `/research/${l.slug}`, score: score(q, l.name, l.description) + 2 })),
    ...pages.map((p) => ({ type: "page" as const, title: p.title, subtitle: p.body.replace(/[#*_`>]/g, "").slice(0, 120), href: `/${p.slug === "about" ? "about" : p.slug}`, score: score(q, p.title, p.body) - 5 })),
  ];

  return hits
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => ({ type: hit.type, title: hit.title, subtitle: hit.subtitle, href: hit.href, meta: hit.meta }));
}
