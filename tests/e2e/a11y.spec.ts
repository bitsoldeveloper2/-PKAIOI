import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PASSWORD = process.env.SEED_PASSWORD ?? "Campus!2026";

async function scan(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).exclude("canvas").analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious, `${path}: ${serious.map((v) => `${v.id} (${v.nodes.length})`).join(", ")}`).toEqual([]);
}

test.describe("accessibility", () => {
  for (const path of ["/", "/programs", "/courses", "/courses/foundations-of-machine-learning", "/research", "/faculty", "/journal", "/admissions", "/apply", "/enterprise", "/contact", "/verify", "/login", "/register"]) {
    test(`public: ${path} has no serious WCAG violations`, async ({ page }) => {
      await scan(page, path);
    });
  }

  test("authenticated: campus, player, studio and console", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/^Email/).fill("admin@pioai.edu.pk");
    await page.getByLabel(/^Password/).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin/);
    for (const path of ["/admin", "/admin/admissions", "/admin/crm", "/admin/users", "/studio", "/studio/courses", "/campus", "/campus/tutor", "/campus/lab", "/account", "/enterprise/portal"]) {
      await scan(page, path);
    }
  });
});
