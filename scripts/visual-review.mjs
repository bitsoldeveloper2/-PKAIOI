/**
 * Visual review: screenshots every major surface at desktop and phone widths,
 * in light and dark themes, signed out and signed in per role.
 *
 * Usage: node scripts/visual-review.mjs [baseUrl] [outDir]
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? path.join(process.cwd(), "tests", "visual");
const password = process.env.SEED_PASSWORD ?? "Campus!2026";
mkdirSync(out, { recursive: true });

const PUBLIC = ["/", "/academy", "/programs", "/programs/professional-diploma-applied-ai", "/courses", "/courses/foundations-of-machine-learning", "/research", "/research/language-and-reasoning", "/research/publications", "/faculty", "/faculty/ayesha-rehman", "/journal", "/journal/urduqa-benchmark-release", "/admissions", "/apply", "/enterprise", "/contact", "/search?q=urdu", "/verify", "/login", "/register", "/about", "/privacy"];

const ROLES = {
  student: { email: "student@pioai.edu.pk", paths: ["/campus", "/campus/courses", "/campus/certificates", "/campus/tutor", "/campus/lab", "/account", "/learn/foundations-of-machine-learning"] },
  instructor: { email: "instructor@pioai.edu.pk", paths: ["/studio", "/studio/courses", "/studio/learners", "/studio/analytics"] },
  admin: { email: "admin@pioai.edu.pk", paths: ["/admin", "/admin/admissions", "/admin/crm", "/admin/enterprise", "/admin/research", "/admin/cms", "/admin/academy", "/admin/users", "/admin/audit", "/admin/settings"] },
  enterprise: { email: "enterprise@nexus-bank.example", paths: ["/enterprise/portal", "/enterprise/portal/people", "/enterprise/portal/reports", "/enterprise/portal/governance"] },
};

const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };

function fileName(prefix, p, vp, theme) {
  const slug = p === "/" ? "home" : p.replace(/^\//, "").replace(/[\/?=&]+/g, "-");
  return `${prefix}--${slug}--${vp}-${theme}.png`;
}

async function shoot(page, p, prefix, vp, theme) {
  const res = await page.goto(base + p, { waitUntil: "load" });
  const status = res?.status() ?? 0;
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  const file = path.join(out, fileName(prefix, p, vp, theme));
  await page.screenshot({ path: file, fullPage: true });
  const errors = await page.evaluate(() => (window.__errors ?? []).slice(0, 3));
  console.log(`${status} ${p.padEnd(48)} ${vp}/${theme}${errors.length ? "  console: " + errors.join(" | ") : ""}`);
  return status;
}

const browser = await chromium.launch();
const problems = [];

for (const [vp, viewport] of Object.entries(VIEWPORTS)) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport, colorScheme: theme, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      window.__errors = [];
      window.addEventListener("error", (e) => window.__errors.push(e.message));
      const orig = console.error;
      console.error = (...a) => { window.__errors.push(String(a[0]).slice(0, 120)); orig(...a); };
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => problems.push(`${vp}/${theme} ${page.url().replace(base, "")} pageerror: ${e.message.slice(0, 160)}`));
    for (const p of PUBLIC) {
      const s = await shoot(page, p, "public", vp, theme);
      if (s >= 400) problems.push(`${vp}/${theme} ${p} -> ${s}`);
    }
    if (vp === "desktop" || theme === "light") {
      for (const [role, cfg] of Object.entries(ROLES)) {
        await page.goto(base + "/login");
        await page.getByLabel(/^Email/).fill(cfg.email);
        await page.getByLabel(/^Password/).fill(password);
        await page.getByRole("button", { name: "Sign in" }).click();
        await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20_000 });
        for (const p of cfg.paths) {
          const s = await shoot(page, p, role, vp, theme);
          if (s >= 400) problems.push(`${vp}/${theme} ${role} ${p} -> ${s}`);
        }
        await ctx.clearCookies();
      }
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`\nSaved to ${out}`);
if (problems.length) {
  console.log("\nPROBLEMS:");
  for (const p of problems) console.log(" - " + p);
  process.exitCode = 1;
} else {
  console.log("No HTTP errors or page errors.");
}
