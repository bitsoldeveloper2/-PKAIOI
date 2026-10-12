/**
 * Brings an already-seeded database in line with the current content decisions
 * without reseeding, so a live site keeps its learners, enrolments, applications
 * and anything else created after launch.
 *
 * Every step is idempotent and guarded, so it runs on every deploy (see
 * `prisma/deploy.ts`) and can also be run by hand on a server:
 *
 *   npx tsx prisma/content-sync.ts
 *
 * What it does:
 * - renames the retired named-instructor accounts to the institute's track labels
 *   (only while they still carry the seeded name, so hand-edited accounts are kept)
 * - removes faculty profiles, the journal posts and the publications that were
 *   authored by the former leadership
 * - replaces the old institute name in CMS pages, posts, announcements and events
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { resolveDatabaseUrl } from "../src/lib/deploy-defaults";
import { users } from "./seed-data/users";

const NEW_NAME = "The Institute of Artificial Intelligence";

/** Applies the institute rename and the handful of named-person edits to free text. */
export function renameInstitute(text: string) {
  return text
    .replace(/\bthe Pakistan Institute of (?:Artificial Intelligence|AI)\b/g, NEW_NAME)
    .replace(/Pakistan Institute of (?:Artificial Intelligence|AI)/g, NEW_NAME)
    .replace(/PAKISTAN INSTITUTE OF (?:ARTIFICIAL INTELLIGENCE|AI)/g, NEW_NAME.toUpperCase())
    .replace(/The The Institute/g, "The Institute")
    .replace("Dr. Hina Aslam hosts an open statistics and methods clinic", "The academy hosts an open statistics and methods clinic")
    .replace(
      "Dr. Fatima Noor presents results from the three-hospital randomised study.",
      "The Safety, Alignment & Governance Lab presents results from the three-hospital randomised study.",
    );
}

/** Seeded instructor accounts as they were before the faculty roster was retired. */
const RETIRED_INSTRUCTORS = [
  { key: "ayesha", oldEmail: "instructor@pioai.edu.pk", oldName: "Dr. Ayesha Rehman" },
  { key: "bilal", oldEmail: "bilal.ahmed@pioai.edu.pk", oldName: "Dr. Bilal Ahmed" },
  { key: "zara", oldEmail: "zara.siddiqui@pioai.edu.pk", oldName: "Dr. Zara Siddiqui" },
  { key: "usman", oldEmail: "usman.tariq@pioai.edu.pk", oldName: "Usman Tariq" },
  { key: "fatima", oldEmail: "fatima.noor@pioai.edu.pk", oldName: "Dr. Fatima Noor" },
  { key: "omar", oldEmail: "omar.farooq@pioai.edu.pk", oldName: "Dr. Omar Farooq" },
  { key: "mahnoor", oldEmail: "mahnoor.qazi@pioai.edu.pk", oldName: "Mahnoor Qazi" },
];

const RETIRED_POSTS = ["urduqa-benchmark-release", "cotton-vision-kit-field-results", "what-a-model-card-should-tell-a-bank", "how-we-teach-evaluation"];

const RETIRED_PUBLICATIONS = [
  "urduqa-benchmark-2026",
  "reasoning-eval-without-leakage",
  "cotton-leaf-disease-edge",
  "bridge-inspection-uav",
  "public-sector-llm-evaluation-guide",
  "automation-bias-clinical-triage",
  "lora-scheduling-shared-clusters",
  "quantisation-urdu-models",
  "maternal-risk-punjab-calibration",
  "punjab-health-facility-dataset",
];

type Summary = { instructorsRenamed: number; facultyRemoved: number; postsRemoved: number; publicationsRemoved: number; textsUpdated: number };

export async function syncContent(prisma: PrismaClient): Promise<Summary> {
  const summary: Summary = { instructorsRenamed: 0, facultyRemoved: 0, postsRemoved: 0, publicationsRemoved: 0, textsUpdated: 0 };

  for (const retired of RETIRED_INSTRUCTORS) {
    const target = users.find((u) => u.key === retired.key);
    if (!target) continue;
    const account = await prisma.user.findUnique({ where: { email: retired.oldEmail }, select: { id: true, name: true } });
    if (!account || account.name !== retired.oldName) continue; // already done, or edited by hand
    const emailTaken =
      target.email !== retired.oldEmail && Boolean(await prisma.user.findUnique({ where: { email: target.email }, select: { id: true } }));
    await prisma.user.update({
      where: { id: account.id },
      data: { name: target.name, headline: target.headline, bio: target.bio, ...(emailTaken ? {} : { email: target.email }) },
    });
    summary.instructorsRenamed++;
  }

  // Lab leads point at faculty rows with onDelete: SetNull, so this also clears them.
  summary.facultyRemoved = (await prisma.faculty.deleteMany({})).count;
  summary.postsRemoved = (await prisma.post.deleteMany({ where: { slug: { in: RETIRED_POSTS } } })).count;
  summary.publicationsRemoved = (await prisma.publication.deleteMany({ where: { slug: { in: RETIRED_PUBLICATIONS } } })).count;

  for (const page of await prisma.page.findMany({ select: { id: true, title: true, body: true, seoTitle: true, seoDescription: true } })) {
    const next = {
      title: renameInstitute(page.title),
      body: renameInstitute(page.body),
      seoTitle: page.seoTitle == null ? null : renameInstitute(page.seoTitle),
      seoDescription: page.seoDescription == null ? null : renameInstitute(page.seoDescription),
    };
    if (next.title !== page.title || next.body !== page.body || next.seoTitle !== page.seoTitle || next.seoDescription !== page.seoDescription) {
      await prisma.page.update({ where: { id: page.id }, data: next });
      summary.textsUpdated++;
    }
  }

  for (const post of await prisma.post.findMany({ select: { id: true, title: true, excerpt: true, body: true } })) {
    const next = { title: renameInstitute(post.title), excerpt: renameInstitute(post.excerpt), body: renameInstitute(post.body) };
    if (next.title !== post.title || next.excerpt !== post.excerpt || next.body !== post.body) {
      await prisma.post.update({ where: { id: post.id }, data: next });
      summary.textsUpdated++;
    }
  }

  for (const item of await prisma.announcement.findMany({ select: { id: true, title: true, body: true } })) {
    const next = { title: renameInstitute(item.title), body: renameInstitute(item.body) };
    if (next.title !== item.title || next.body !== item.body) {
      await prisma.announcement.update({ where: { id: item.id }, data: next });
      summary.textsUpdated++;
    }
  }

  for (const event of await prisma.campusEvent.findMany({ select: { id: true, title: true, description: true } })) {
    const next = { title: renameInstitute(event.title), description: renameInstitute(event.description) };
    if (next.title !== event.title || next.description !== event.description) {
      await prisma.campusEvent.update({ where: { id: event.id }, data: next });
      summary.textsUpdated++;
    }
  }

  return summary;
}

const runDirectly = process.argv[1]?.replace(/\\/g, "/").endsWith("prisma/content-sync.ts");
if (runDirectly) {
  const url = resolveDatabaseUrl(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
  syncContent(prisma)
    .then((summary) => console.log("✓ content synced", summary))
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
