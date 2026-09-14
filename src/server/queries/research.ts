import "server-only";
import { cache } from "react";
import { db } from "@/server/db";
import { stringList } from "@/lib/utils";
import type { PublicationType } from "@/generated/prisma/enums";

export const listLabs = cache(async () => {
  const labs = await db.researchLab.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      focusAreas: true,
      lead: { select: { slug: true, name: true, title: true, photoUrl: true } },
      _count: { select: { publications: { where: { published: true } }, projects: { where: { published: true } } } },
    },
  });
  return labs.map((l) => ({ ...l, focusAreas: stringList(l.focusAreas) }));
});

export const getLabBySlug = cache(async (slug: string) => {
  const lab = await db.researchLab.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      description: true,
      focusAreas: true,
      lead: { select: { slug: true, name: true, title: true, photoUrl: true, department: true } },
      publications: {
        where: { published: true },
        orderBy: [{ year: "desc" }],
        select: { id: true, slug: true, title: true, venue: true, year: true, type: true, authors: true, url: true, abstract: true },
      },
      projects: {
        where: { published: true },
        orderBy: [{ status: "asc" }, { startedAt: "desc" }],
        select: { id: true, slug: true, title: true, summary: true, status: true, startedAt: true, endedAt: true },
      },
    },
  });
  if (!lab) return null;
  return {
    ...lab,
    focusAreas: stringList(lab.focusAreas),
    publications: lab.publications.map((p) => ({ ...p, authors: stringList(p.authors) })),
  };
});

export type PublicationFilters = { year?: number; type?: PublicationType; lab?: string; q?: string };

export const listPublications = cache(async (filters: PublicationFilters = {}) => {
  const pubs = await db.publication.findMany({
    where: {
      published: true,
      ...(filters.year ? { year: filters.year } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.lab ? { lab: { slug: filters.lab } } : {}),
      ...(filters.q ? { OR: [{ title: { contains: filters.q } }, { abstract: { contains: filters.q } }, { venue: { contains: filters.q } }] } : {}),
    },
    orderBy: [{ featured: "desc" }, { year: "desc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      abstract: true,
      venue: true,
      year: true,
      type: true,
      url: true,
      featured: true,
      authors: true,
      lab: { select: { slug: true, name: true } },
    },
  });
  return pubs.map((p) => ({ ...p, authors: stringList(p.authors) }));
});

export const listPublicationYears = cache(async () => {
  const rows = await db.publication.groupBy({ by: ["year"], where: { published: true }, _count: { _all: true }, orderBy: { year: "desc" } });
  return rows.map((r) => ({ year: r.year, count: r._count._all }));
});

export const getFeaturedPublications = cache(async (limit = 3) => {
  const pubs = await db.publication.findMany({
    where: { published: true, featured: true },
    orderBy: { year: "desc" },
    take: limit,
    select: { id: true, slug: true, title: true, venue: true, year: true, type: true, authors: true, lab: { select: { slug: true, name: true } } },
  });
  return pubs.map((p) => ({ ...p, authors: stringList(p.authors) }));
});

export const getPublicationBySlug = cache(async (slug: string) => {
  const pub = await db.publication.findFirst({
    where: { slug, published: true },
    select: {
      id: true, slug: true, title: true, abstract: true, venue: true, year: true, type: true, url: true, authors: true,
      lab: { select: { slug: true, name: true } },
    },
  });
  return pub ? { ...pub, authors: stringList(pub.authors) } : null;
});

export const listFaculty = cache(async (opts: { featured?: boolean; department?: string } = {}) => {
  const faculty = await db.faculty.findMany({
    where: { ...(opts.featured ? { featured: true } : {}), ...(opts.department ? { department: opts.department } : {}) },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true, title: true, department: true, photoUrl: true, expertise: true, featured: true },
  });
  return faculty.map((f) => ({ ...f, expertise: stringList(f.expertise) }));
});

export const listFacultyDepartments = cache(async () => {
  const rows = await db.faculty.groupBy({ by: ["department"], _count: { _all: true }, orderBy: { department: "asc" } });
  return rows.map((r) => ({ department: r.department, count: r._count._all }));
});

export const getFacultyBySlug = cache(async (slug: string) => {
  const member = await db.faculty.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      title: true,
      department: true,
      bio: true,
      photoUrl: true,
      expertise: true,
      links: true,
      labsLed: { where: { published: true }, select: { slug: true, name: true, tagline: true } },
      user: {
        select: {
          coursesTaught: {
            where: { status: "PUBLISHED" },
            select: { slug: true, title: true, subtitle: true, level: true, durationHours: true, accent: true },
          },
        },
      },
    },
  });
  if (!member) return null;
  const links = Array.isArray(member.links) ? (member.links as { label: string; url: string }[]) : [];
  return { ...member, expertise: stringList(member.expertise), links, courses: member.user?.coursesTaught ?? [] };
});

export const getResearchStats = cache(async () => {
  const [labs, publications, projects] = await Promise.all([
    db.researchLab.count({ where: { published: true } }),
    db.publication.count({ where: { published: true } }),
    db.researchProject.count({ where: { published: true, status: "ACTIVE" } }),
  ]);
  return { labs, publications, activeProjects: projects };
});
