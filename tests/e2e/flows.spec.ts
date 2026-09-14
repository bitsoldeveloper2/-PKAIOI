import { expect, test, type Page } from "@playwright/test";

const PASSWORD = process.env.SEED_PASSWORD ?? "Campus!2026";

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel(/^Email/).fill(email);
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("critical user flows", () => {
  test("wrong password is rejected without leaking account existence", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/^Email/).fill("nobody@example.com");
    await page.getByLabel(/^Password/).fill("definitely-wrong-1");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "not correct" })).toBeVisible();
  });

  test("student signs in, continues a course, and completes a lesson", async ({ page }) => {
    await signIn(page, "student@pioai.edu.pk");
    await expect(page).toHaveURL(/\/campus/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Good (morning|afternoon|evening), Ali/);

    await page.getByRole("link", { name: /Continue learning/ }).click();
    await expect(page).toHaveURL(/\/learn\/[a-z0-9-]+\//);
    await expect(page.getByRole("navigation", { name: "Curriculum" }).or(page.getByRole("button", { name: "Open curriculum" }))).toBeVisible();

    const complete = page.getByRole("button", { name: "Mark as complete" });
    if (await complete.isVisible()) {
      await complete.click();
      await expect(page.getByText("Completed").first()).toBeVisible();
    }
    await expect(page.getByRole("tab", { name: "Tutor" })).toBeVisible();
    await page.getByRole("tab", { name: "Notes" }).click();
    // Unique text each run: React only fires onChange when the value actually changes.
    await page.getByLabel("Your notes for this lesson").fill(`Validation is the whole game. (${Date.now()})`);
    await expect(page.getByText(/Saved|Saving/)).toBeVisible();
  });

  test("quiz grades answers and explains them", async ({ page }) => {
    await signIn(page, "student@pioai.edu.pk");
    await page.goto("/courses/foundations-of-machine-learning");
    await page.getByRole("link", { name: /Check your understanding/ }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Check your understanding");
    const groups = page.getByRole("group");
    const count = await groups.count();
    for (let i = 0; i < count; i++) {
      await groups.nth(i).getByRole("radio").first().check();
    }
    await page.getByRole("button", { name: "Submit answers" }).click();
    await expect(page.getByRole("status").first()).toContainText(/Passed|Not yet/);
    await expect(page.getByText(/Correct\.|Not quite\./).first()).toBeVisible();
  });

  test("student cannot open the console; admin can", async ({ page }) => {
    await signIn(page, "student@pioai.edu.pk");
    await page.goto("/admin");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("different role");

    await page.goto("/account");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Settings");
  });

  test("admin console, CRM and admissions load with seeded data", async ({ page }) => {
    await signIn(page, "admin@pioai.edu.pk");
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("at a glance");
    await page.goto("/admin/crm");
    await expect(page.getByRole("link", { name: "Rashid Mehmood" })).toBeVisible();
    await page.goto("/admin/admissions");
    await page.getByRole("link", { name: "Sarah Ahmed" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sarah Ahmed");
    await page.goto("/admin/audit");
    await expect(page.getByText("auth.login").first()).toBeVisible();
  });

  test("instructor studio shows courses and the builder", async ({ page }) => {
    await signIn(page, "instructor@pioai.edu.pk");
    await expect(page).toHaveURL(/\/studio/);
    await page.goto("/studio/courses");
    await page.getByRole("link", { name: "Foundations of Machine Learning", exact: true }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Foundations of Machine Learning");
    await expect(page.getByRole("tab", { name: /Curriculum/ })).toBeVisible();
    await page.goto("/studio/analytics");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Analytics");
  });

  test("enterprise owner sees the portal for their organisation only", async ({ page }) => {
    await signIn(page, "enterprise@nexus-bank.example");
    await page.goto("/enterprise/portal");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nexus Bank");
    await page.goto("/enterprise/portal/people");
    await expect(page.getByText("daniyal.mirza@nexus-bank.example")).toBeVisible();
    await expect(page.getByText("kpl.example")).toHaveCount(0);
  });

  test("sign out ends the session", async ({ page }) => {
    await signIn(page, "student@pioai.edu.pk");
    await page.goto("/account");
    await page.getByRole("button", { name: /Account menu/ }).first().click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/campus");
    await expect(page).toHaveURL(/\/login/);
  });
});
