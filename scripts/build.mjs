/**
 * Runs `next build` for `npm run build`.
 *
 * Hosting builders are small containers, and a build that runs out of memory there is
 * killed silently and reported as a hang. This wrapper prints the environment so the
 * log shows what the build had to work with, and caps the Node heap to fit a container
 * limit so an out-of-memory build fails with an explicit message instead. Hosting panels
 * cannot always set NODE_OPTIONS, so the cap is applied here; an explicit
 * `--max-old-space-size` in NODE_OPTIONS always wins.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import os from "node:os";

const MiB = 1024 ** 2;
const GiB = 1024 ** 3;

/** Memory limit of the container this process runs in, if any (cgroup v2, then v1). */
function containerMemoryLimit() {
  for (const file of ["/sys/fs/cgroup/memory.max", "/sys/fs/cgroup/memory/memory.limit_in_bytes"]) {
    try {
      const bytes = Number(readFileSync(file, "utf8").trim());
      if (Number.isFinite(bytes) && bytes > 0 && bytes < 2 ** 60) return bytes;
    } catch {
      // not a cgroup-limited environment, or no permission to read it
    }
  }
  return null;
}

const limit = containerMemoryLimit();
const total = os.totalmem();
const budget = limit ? Math.min(limit, total) : total;

let nodeOptions = process.env.NODE_OPTIONS ?? "";
if (!/max-old-space-size/.test(nodeOptions)) {
  // Turbopack's native threads and the OS need room too: give the JS heap 60% of the budget.
  const heapMiB = Math.max(512, Math.floor((budget * 0.6) / MiB));
  nodeOptions = `${nodeOptions} --max-old-space-size=${heapMiB}`.trim();
}

console.log(
  `build environment: node ${process.version} · ${os.cpus().length} cpu(s) · ${(total / GiB).toFixed(1)} GiB total` +
    ` · container limit ${limit ? `${(limit / GiB).toFixed(1)} GiB` : "none"} · NODE_OPTIONS="${nodeOptions}"`,
);

// Measured on this project: Turbopack peaks at ~3.3 GB across the build processes,
// webpack with `webpackMemoryOptimizations` at ~1.6 GB. Small hosting builders cannot
// afford the former, so webpack is the default; pass `--turbopack` to opt back in.
const args = process.argv.slice(2);
const bundlerArgs = args.some((a) => a === "--turbopack" || a === "--webpack") ? [] : ["--webpack"];

const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build", ...bundlerArgs, ...args], {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});
if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
