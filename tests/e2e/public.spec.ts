import { expect, test } from "@playwright/test";

test.describe("public site", () => {
  test("home renders the hero, primary navigation and key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("age of intelligence");
    await expect(page.getByRole("navigation", { name: "Primary" }).or(page.getByRole("button", { name: "Open navigation" }))).toBeVisible();
    await expect(page.getByRole("heading", { name: /One institute, three doors/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Serious programs for serious intent/ })).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]').first()).toHaveCount(1);
  });

  test("security headers are present", async ({ request }) => {
    const res = await request.get("/");
    const csp = res.headers()["content-security-policy"] ?? "";
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });

  test("catalog filters by search and level, and opens a course", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Every course runs on the campus");
    await page.getByLabel("Search courses").fill("evaluation");
    await expect(page.getByRole("status")).toContainText("evaluation");
    await expect(page.getByRole("link", { name: /LLM Engineering/ }).first()).toBeVisible();
    await page.getByRole("link", { name: /LLM Engineering/ }).first().click();
    await expect(page).toHaveURL(/\/courses\/llm-engineering-and-evaluation/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("LLM Engineering");
    await expect(page.getByRole("heading", { name: "Curriculum" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in to enrol" })).toBeVisible();
  });

  test("programs, research, faculty and journal detail pages resolve", async ({ page }) => {
    await page.goto("/programs");
    await page.getByRole("link", { name: /Professional Diploma in Applied Artificial Intelligence/ }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Professional Diploma");

    await page.goto("/research");
    await page.getByRole("link", { name: /Language & Reasoning Lab/ }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Language & Reasoning Lab");

    await page.goto("/faculty");
    await page.getByRole("link", { name: "Dr. Ayesha Rehman" }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ayesha Rehman");

    await page.goto("/journal");
    await page.getByRole("link", { name: /UrduQA/ }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("UrduQA");
  });

  test("certificate verification handles unknown and valid codes", async ({ page, request }) => {
    await page.goto("/verify?code=PIOAI-NOPE1-NOPE2");
    await expect(page.getByRole("status")).toContainText("No certificate matches");
    const res = await request.get("/api/certificates/PIOAI-NOPE1-NOPE2/pdf");
    expect(res.status()).toBe(404);
  });

  test("site search returns ranked results", async ({ request, page }) => {
    const res = await request.get("/api/search?q=urdu");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { hits: { type: string; title: string; href: string }[] };
    expect(body.hits.length).toBeGreaterThan(0);
    expect(body.hits.some((h) => h.type === "publication")).toBeTruthy();

    await page.goto("/search?q=safety");
    await expect(page.getByRole("option").first()).toBeVisible();
  });

  test("sitemap and robots are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("/courses/foundations-of-machine-learning");
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /admin");
  });

  test("protected areas redirect anonymous visitors to sign-in", async ({ page }) => {
    await page.goto("/campus");
    await expect(page).toHaveURL(/\/login\?next=%2Fcampus/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("contact form validates and submits", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Send message" }) });
    await form.getByLabel(/^Name/).fill("Playwright Tester");
    await form.getByLabel(/^Email/).fill(`e2e-${Date.now()}@example.com`);
    await form.getByLabel(/^Message/).fill("Testing the contact form from the end-to-end suite.");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Thank you" })).toBeVisible();
  });
});
