# PIOAI — notes for agents working in this repo

This is **Next.js 16** (not 13/14/15). Read `node_modules/next/dist/docs/` before assuming an API: request APIs (`cookies`, `headers`, `params`, `searchParams`) are async; `middleware.ts` is `src/proxy.ts`; `next lint` is gone (use `npm run lint`); typed routes are on (`typedRoutes: true`), so dynamic hrefs need `as Route`.

**Prisma 7**: the datasource URL lives in `prisma.config.ts`, the client is generated into `src/generated/prisma` (git-ignored — run `npm run db:generate` after `npm install`), and the runtime uses the better-sqlite3 driver adapter. Enums and Json columns are supported on SQLite here.

**Conventions**
- Server-only modules import `"server-only"`; never import them from client components or the seed script.
- Every page/action authorises through `src/server/auth/dal.ts` (`requireUser`, `requirePermission`, `requireEnterpriseManager`). Do not rely on the proxy.
- Reads live in `src/server/queries/*`, writes in `src/server/actions/*` (server actions validate with Zod from `src/lib/validation.ts` and write to the audit log).
- Client components receive DTOs, never Prisma models with secrets. Pass rendered icons as elements to client components, not icon components.
- The CSP is nonce-based: no inline `<script>`; `next-themes` gets the nonce from `Providers`; CodeMirror gets it via `useNonce()`.
- Design tokens are CSS variables in `src/app/globals.css` mapped through Tailwind v4 `@theme inline`. Use semantic classes (`bg-surface`, `text-ink-muted`, `border-line`) rather than raw palette colours.
- Charts follow the dataviz rules: series colours are `--chart-1…5` (validated for CVD), one axis, legend for ≥ 2 series, a table view for every chart.

**Commands**: `npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e` (needs a seeded DB; `npm run db:reset` reseeds), `npm run build && npm run start`.

**Seed accounts** share the password in `SEED_PASSWORD` (default `Campus!2026`): student@, instructor@, staff@, admin@pioai.edu.pk and enterprise@nexus-bank.example.
