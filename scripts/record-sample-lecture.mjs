/**
 * Records the sample lecture video used by seeded VIDEO lessons.
 * Usage: node scripts/record-sample-lecture.mjs
 * Output: public/media/sample-lecture.webm (VP8, 1280×720, ~22s)
 */
import { chromium } from "@playwright/test";
import { mkdtempSync, readdirSync, copyFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const slide = path.join(here, "assets", "sample-lecture.html");
const out = path.join(here, "..", "public", "media", "sample-lecture.webm");
const dir = mkdtempSync(path.join(tmpdir(), "pioai-video-"));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 1280, height: 720 } } });
const page = await ctx.newPage();
await page.goto(pathToFileURL(slide).href);
await page.waitForTimeout(22_000);
await ctx.close();
await browser.close();

const webm = readdirSync(dir).filter((f) => f.endsWith(".webm")).map((f) => path.join(dir, f))[0];
if (!webm) throw new Error("no video produced");
mkdirSync(path.dirname(out), { recursive: true });
copyFileSync(webm, out);
rmSync(dir, { recursive: true, force: true });
console.log("saved", out, statSync(out).size, "bytes");
