/**
 * PIOAI database seed.
 *
 * Populates a development database with a coherent institution: people,
 * programs, courses with full curricula, research output, editorial content,
 * enterprise organisations, CRM pipeline and admissions applications.
 *
 * Run with `pnpm db:seed` (wired through prisma.config.ts) or `pnpm db:reset`.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { hash } from "@node-rs/argon2";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { users } from "./seed-data/users";
import { programs } from "./seed-data/programs";
import { courses } from "./seed-data/courses";
import { shortCoursePrograms, shortCourses } from "./seed-data/short-courses";
import { faculty, labs, publications, projects } from "./seed-data/research";
import { pages, posts, announcements, events } from "./seed-data/cms";
import { organizations, leads, applications, learnerActivity, conversations, settings } from "./seed-data/ops";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
  throw new Error("Refusing to seed a production database. Pass --force if you really mean it.");
}

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
const password = process.env.SEED_PASSWORD ?? "Campus!2026";

function certificateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += alphabet[bytes[i]! % alphabet.length];
  return `PIOAI-${out.slice(0, 5)}-${out.slice(5)}`;
}

const PKT_OFFSET_HOURS = 5; // Asia/Karachi has no daylight saving

/** n days ago at `hour` o'clock institute time (Asia/Karachi). */
function daysAgo(n: number, hour = 10) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(hour - PKT_OFFSET_HOURS, 0, 0, 0);
  return d;
}

function daysFromNow(n: number, hour = 10) {
  return daysAgo(-n, hour);
}

async function reset() {
  // Order matters for SQLite foreign keys.
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.applicationEvent.deleteMany(),
    prisma.application.deleteMany(),
    prisma.leadActivity.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.certificate.deleteMany(),
    prisma.labSubmission.deleteMany(),
    prisma.quizAttempt.deleteMany(),
    prisma.note.deleteMany(),
    prisma.lessonProgress.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.membership.deleteMany(),
    prisma.organization.deleteMany(),
    prisma.campusEvent.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.post.deleteMany(),
    prisma.page.deleteMany(),
    prisma.researchProject.deleteMany(),
    prisma.publication.deleteMany(),
    prisma.researchLab.deleteMany(),
    prisma.faculty.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.module.deleteMany(),
    prisma.course.deleteMany(),
    prisma.program.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.siteSetting.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function main() {
  console.log("→ resetting database");
  await reset();

  console.log("→ users");
  const passwordHash = await hash(password, { memoryCost: 19_456, timeCost: 2, parallelism: 1 });
  const userIds = new Map<string, string>();
  for (const u of users) {
    const created = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        role: u.role,
        headline: u.headline,
        bio: u.bio,
        timezone: u.timezone ?? "Asia/Karachi",
        passwordHash,
        emailVerifiedAt: new Date(),
        lastLoginAt: daysAgo(u.lastLoginDaysAgo ?? 3),
        createdAt: daysAgo(u.createdDaysAgo ?? 120),
      },
    });
    userIds.set(u.key, created.id);
  }
  const uid = (key: string) => {
    const id = userIds.get(key);
    if (!id) throw new Error(`Unknown user key: ${key}`);
    return id;
  };

  console.log("→ faculty");
  const facultyIds = new Map<string, string>();
  for (const [i, f] of faculty.entries()) {
    const created = await prisma.faculty.create({
      data: {
        slug: f.slug,
        name: f.name,
        title: f.title,
        department: f.department,
        bio: f.bio,
        expertise: f.expertise,
        links: f.links,
        featured: f.featured ?? false,
        order: i,
        userId: f.userKey ? uid(f.userKey) : undefined,
      },
    });
    facultyIds.set(f.slug, created.id);
  }

  console.log("→ programs");
  const programIds = new Map<string, string>();
  for (const [i, p] of [...programs, ...shortCoursePrograms].entries()) {
    const created = await prisma.program.create({
      data: {
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        level: p.level,
        format: p.format,
        durationWeeks: p.durationWeeks,
        tuitionPkr: p.tuitionPkr,
        summary: p.summary,
        description: p.description,
        outcomes: p.outcomes,
        curriculum: p.curriculum,
        admissions: p.admissions,
        featured: p.featured ?? false,
        order: i,
      },
    });
    programIds.set(p.slug, created.id);
  }

  console.log("→ courses");
  const courseIds = new Map<string, string>();
  const lessonIds = new Map<string, string[]>(); // courseSlug → ordered lesson ids
  for (const c of [...courses, ...shortCourses]) {
    const created = await prisma.course.create({
      data: {
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        description: c.description,
        level: c.level,
        category: c.category,
        durationHours: c.durationHours,
        accent: c.accent,
        status: c.status ?? "PUBLISHED",
        publishedAt: c.status === "DRAFT" ? null : daysAgo(c.publishedDaysAgo ?? 60),
        featured: c.featured ?? false,
        tags: c.tags,
        learningOutcomes: c.learningOutcomes,
        prerequisites: c.prerequisites,
        instructorId: uid(c.instructorKey),
        programId: c.programSlug ? programIds.get(c.programSlug) : undefined,
      },
    });
    courseIds.set(c.slug, created.id);
    const ordered: string[] = [];
    for (const [mi, m] of c.modules.entries()) {
      const mod = await prisma.module.create({ data: { courseId: created.id, title: m.title, summary: m.summary, order: mi } });
      for (const [li, l] of m.lessons.entries()) {
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: mod.id,
            title: l.title,
            type: l.type,
            order: li,
            durationMinutes: l.durationMinutes,
            content: l.content,
            videoUrl: l.videoUrl,
            quiz: l.quiz ?? undefined,
            lab: l.lab ?? undefined,
            isPreview: l.isPreview ?? false,
          },
        });
        ordered.push(lesson.id);
      }
    }
    lessonIds.set(c.slug, ordered);
  }
  const cid = (slug: string) => {
    const id = courseIds.get(slug);
    if (!id) throw new Error(`Unknown course slug: ${slug}`);
    return id;
  };

  console.log("→ research");
  const labIds = new Map<string, string>();
  for (const [i, lab] of labs.entries()) {
    const created = await prisma.researchLab.create({
      data: {
        slug: lab.slug,
        name: lab.name,
        tagline: lab.tagline,
        description: lab.description,
        focusAreas: lab.focusAreas,
        leadId: lab.leadSlug ? facultyIds.get(lab.leadSlug) : undefined,
        order: i,
      },
    });
    labIds.set(lab.slug, created.id);
  }
  for (const p of publications) {
    await prisma.publication.create({
      data: {
        slug: p.slug,
        title: p.title,
        abstract: p.abstract,
        authors: p.authors,
        venue: p.venue,
        year: p.year,
        type: p.type,
        url: p.url,
        featured: p.featured ?? false,
        labId: labIds.get(p.labSlug),
      },
    });
  }
  for (const p of projects) {
    await prisma.researchProject.create({
      data: {
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        description: p.description,
        status: p.status,
        labId: labIds.get(p.labSlug)!,
        startedAt: daysAgo(p.startedDaysAgo),
        endedAt: p.endedDaysAgo != null ? daysAgo(p.endedDaysAgo) : undefined,
      },
    });
  }

  console.log("→ content");
  for (const p of pages) {
    await prisma.page.create({ data: { slug: p.slug, title: p.title, body: p.body, seoTitle: p.seoTitle, seoDescription: p.seoDescription, updatedById: uid("admin") } });
  }
  for (const p of posts) {
    await prisma.post.create({
      data: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        body: p.body,
        category: p.category,
        tags: p.tags,
        status: p.status ?? "PUBLISHED",
        publishedAt: daysAgo(p.publishedDaysAgo),
        authorId: uid(p.authorKey),
      },
    });
  }
  for (const a of announcements) {
    await prisma.announcement.create({
      data: { title: a.title, body: a.body, audience: a.audience, authorId: uid(a.authorKey), publishedAt: daysAgo(a.publishedDaysAgo) },
    });
  }
  for (const e of events) {
    await prisma.campusEvent.create({
      data: {
        title: e.title,
        description: e.description,
        type: e.type,
        location: e.location,
        startsAt: daysFromNow(e.inDays, e.hour),
        endsAt: daysFromNow(e.inDays, e.hour + (e.durationHours ?? 2)),
        courseId: e.courseSlug ? cid(e.courseSlug) : undefined,
      },
    });
  }

  console.log("→ organisations");
  const orgIds = new Map<string, string>();
  for (const o of organizations) {
    const created = await prisma.organization.create({
      data: {
        slug: o.slug,
        name: o.name,
        domain: o.domain,
        plan: o.plan,
        seats: o.seats,
        inviteCode: o.inviteCode,
        memberships: { create: o.members.map((m) => ({ userId: uid(m.userKey), role: m.role, joinedAt: daysAgo(m.joinedDaysAgo ?? 40) })) },
      },
    });
    orgIds.set(o.slug, created.id);
  }

  console.log("→ learner activity");
  for (const activity of learnerActivity) {
    const userId = uid(activity.userKey);
    for (const e of activity.enrollments) {
      const ids = lessonIds.get(e.courseSlug) ?? [];
      const completedIds = ids.slice(0, e.completedLessons);
      const progressPct = ids.length ? Math.round((completedIds.length / ids.length) * 100) : 0;
      const completed = e.completedLessons >= ids.length && ids.length > 0;
      await prisma.enrollment.create({
        data: {
          userId,
          courseId: cid(e.courseSlug),
          status: completed ? "COMPLETED" : "ACTIVE",
          progressPct,
          lastLessonId: completedIds.at(-1) ?? ids[0],
          orgId: activity.orgSlug ? orgIds.get(activity.orgSlug) : undefined,
          enrolledAt: daysAgo(e.enrolledDaysAgo),
          completedAt: completed ? daysAgo(Math.max(0, e.enrolledDaysAgo - 21)) : undefined,
        },
      });
      for (const [i, lessonId] of completedIds.entries()) {
        const when = daysAgo(Math.max(0, e.enrolledDaysAgo - Math.round(((i + 1) / completedIds.length) * (e.enrolledDaysAgo - (e.lastActiveDaysAgo ?? 0)))), 18);
        await prisma.lessonProgress.create({
          data: { userId, lessonId, completedAt: when, seconds: 420 + ((i * 137) % 900), updatedAt: when },
        });
      }
      if (completed) {
        await prisma.certificate.create({
          data: { code: certificateCode(), userId, courseId: cid(e.courseSlug), grade: e.grade ?? "Distinction", issuedAt: daysAgo(Math.max(0, e.enrolledDaysAgo - 21)) },
        });
      }
    }
  }

  console.log("→ CRM");
  for (const l of leads) {
    await prisma.lead.create({
      data: {
        name: l.name,
        email: l.email,
        phone: l.phone,
        organization: l.organization,
        role: l.role,
        source: l.source,
        interest: l.interest,
        stage: l.stage,
        value: l.value,
        ownerId: l.ownerKey ? uid(l.ownerKey) : undefined,
        message: l.message,
        createdAt: daysAgo(l.createdDaysAgo),
        updatedAt: daysAgo(Math.max(0, l.createdDaysAgo - 2)),
        activities: {
          create: l.activities.map((a, i) => ({ type: a.type, body: a.body, authorId: a.authorKey ? uid(a.authorKey) : undefined, createdAt: daysAgo(Math.max(0, l.createdDaysAgo - i * 2)) })),
        },
      },
    });
  }

  console.log("→ admissions");
  for (const a of applications) {
    await prisma.application.create({
      data: {
        programId: programIds.get(a.programSlug)!,
        applicantId: a.applicantKey ? uid(a.applicantKey) : undefined,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        country: a.country,
        city: a.city,
        education: a.education,
        experience: a.experience,
        statement: a.statement,
        status: a.status,
        score: a.score,
        reviewerId: a.reviewerKey ? uid(a.reviewerKey) : undefined,
        reviewNotes: a.reviewNotes,
        decisionAt: a.decided ? daysAgo(Math.max(0, a.createdDaysAgo - 7)) : undefined,
        createdAt: daysAgo(a.createdDaysAgo),
        events: {
          create: [
            { type: "SUBMITTED", body: "Application submitted.", createdAt: daysAgo(a.createdDaysAgo) },
            ...a.events.map((e, i) => ({ type: e.type, body: e.body, actorId: e.actorKey ? uid(e.actorKey) : undefined, createdAt: daysAgo(Math.max(0, a.createdDaysAgo - (i + 1) * 2)) })),
          ],
        },
      },
    });
  }

  console.log("→ conversations");
  for (const c of conversations) {
    await prisma.conversation.create({
      data: {
        userId: uid(c.userKey),
        title: c.title,
        mode: c.mode,
        courseId: c.courseSlug ? cid(c.courseSlug) : undefined,
        lessonId: c.courseSlug && c.lessonIndex != null ? lessonIds.get(c.courseSlug)?.[c.lessonIndex] : undefined,
        createdAt: daysAgo(c.daysAgo),
        updatedAt: daysAgo(c.daysAgo),
        messages: { create: c.messages.map((m, i) => ({ role: m.role, content: m.content, createdAt: new Date(daysAgo(c.daysAgo).getTime() + i * 60_000) })) },
      },
    });
  }

  console.log("→ settings");
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.create({ data: { key, value: value as Prisma.InputJsonValue } });
  }

  const counts = {
    users: await prisma.user.count(),
    programs: await prisma.program.count(),
    courses: await prisma.course.count(),
    lessons: await prisma.lesson.count(),
    publications: await prisma.publication.count(),
    posts: await prisma.post.count(),
    leads: await prisma.lead.count(),
    applications: await prisma.application.count(),
    enrollments: await prisma.enrollment.count(),
    certificates: await prisma.certificate.count(),
  };
  console.log("✓ seeded", counts);
  console.log(`  sign in with any seeded email and the password "${password}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
