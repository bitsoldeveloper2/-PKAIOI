/**
 * Removes the demo records that `prisma/seed.ts --demo` creates from an existing
 * database: sample learners and enterprise accounts (with their enrolments,
 * progress, certificates, notes, tutor conversations and memberships), the sample
 * organisations, CRM leads, applications, journal posts, announcements and campus
 * events, and the sample admissions banner.
 *
 * Records are matched by the identifiers in `prisma/seed-data`, so anything created
 * on a live site (real learners, applications, leads, posts) is left untouched.
 * Idempotent; safe to run again:
 *
 *   npm run db:purge-demo
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { resolveDatabaseUrl } from "../src/lib/deploy-defaults";
import { users } from "./seed-data/users";
import { posts, announcements, events } from "./seed-data/cms";
import { organizations, leads, applications, settings } from "./seed-data/ops";

/** Journal samples that earlier seeds created and later versions dropped. */
const RETIRED_POSTS = ["urduqa-benchmark-release", "cotton-vision-kit-field-results", "what-a-model-card-should-tell-a-bank", "how-we-teach-evaluation"];

export async function purgeDemo(prisma: PrismaClient) {
  const learnerEmails = users.filter((u) => u.role === "STUDENT").map((u) => u.email);
  const summary = {
    // Enrolments, progress, certificates, notes, attempts, submissions, memberships
    // and conversations cascade from the user rows.
    learners: (await prisma.user.deleteMany({ where: { email: { in: learnerEmails } } })).count,
    organizations: (await prisma.organization.deleteMany({ where: { slug: { in: organizations.map((o) => o.slug) } } })).count,
    leads: (await prisma.lead.deleteMany({ where: { email: { in: leads.map((l) => l.email) } } })).count,
    applications: (await prisma.application.deleteMany({ where: { email: { in: applications.map((a) => a.email) } } })).count,
    posts: (await prisma.post.deleteMany({ where: { slug: { in: [...posts.map((p) => p.slug), ...RETIRED_POSTS] } } })).count,
    announcements: (await prisma.announcement.deleteMany({ where: { title: { in: announcements.map((a) => a.title) } } })).count,
    events: (await prisma.campusEvent.deleteMany({ where: { title: { in: events.map((e) => e.title) } } })).count,
    bannerDisabled: 0,
  };

  const sample = settings["site.banner"] as { text: string };
  const banner = await prisma.siteSetting.findUnique({ where: { key: "site.banner" } });
  const current = banner?.value as { enabled?: boolean; text?: string } | null;
  if (current?.enabled && current.text === sample.text) {
    await prisma.siteSetting.update({ where: { key: "site.banner" }, data: { value: { enabled: false, text: "", href: "/apply" } } });
    summary.bannerDisabled = 1;
  }

  return summary;
}

const runDirectly = process.argv[1]?.replace(/\\/g, "/").endsWith("prisma/purge-demo.ts");
if (runDirectly) {
  const url = resolveDatabaseUrl(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
  purgeDemo(prisma)
    .then((summary) => console.log("✓ demo data removed", summary))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
