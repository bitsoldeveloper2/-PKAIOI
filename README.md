# PIOAI — Pakistan Institute of AI

The institute's platform: public website, academy (programs and course catalog), an AI-native student campus (course player, Socratic tutor, in-browser coding lab, verifiable certificates), the instructor studio and course builder, and the operations console (CMS, CRM, admissions, research, enterprise, users, audit), plus a portal for enterprise partners.

## Stack

- **Next.js 16** (App Router, Turbopack, React Compiler, typed routes) · **React 19** · **TypeScript 5.9**
- **Tailwind CSS v4** with a token-driven design system (light/dark), Fraunces + Instrument Sans + JetBrains Mono
- **Prisma 7** with the better-sqlite3 driver adapter (SQLite locally; PostgreSQL in production — see below)
- **Auth**: Argon2id password hashing, database-backed sessions, role-based authorisation in a data access layer, nonce-based CSP via `src/proxy.ts`
- **AI**: Anthropic SDK (`claude-opus-5` by default), streaming tutor and lab reviewer
- **3D**: React Three Fiber neural lattice, beside the home hero and as a fixed ambient layer behind every page (`AmbientLattice`, theme-aware, `intensity` prop per layout) with reduced-motion, phone and no-WebGL fallbacks
- **Coding lab**: Web worker sandbox; Python runs on a self-hosted Pyodide runtime (`public/pyodide`)
- **Tests**: Vitest (unit), Playwright + axe (end-to-end and accessibility)

## Getting started

```bash
npm install                    # also generates the Prisma client (postinstall)
cp .env.example .env            # then set SESSION_SECRET (48 random bytes, base64url)
npm run db:migrate                 # creates dev.db and applies migrations
npm run db:seed                    # realistic institution data + demo accounts
npm run dev                        # http://localhost:3000
```

Installed with `--ignore-scripts`? Run `npm run db:generate` before seeding. For a production-style run use `npm run build && npm run start`.

Seeded sign-ins (password `Campus!2026`, or whatever `SEED_PASSWORD` is set to):

| Role | Email | Lands on |
| --- | --- | --- |
| Student | student@pioai.edu.pk | /campus |
| Instructor | instructor@pioai.edu.pk | /studio |
| Staff | staff@pioai.edu.pk | /admin |
| Administrator | admin@pioai.edu.pk | /admin |
| Enterprise owner | enterprise@nexus-bank.example | /campus (+ /enterprise/portal) |

To enable the AI tutor and lab reviewer, set `ANTHROPIC_API_KEY`. Without it the platform runs fully and those features explain that AI is not configured.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm run build` / `npm run start` | Develop, build (runs `prisma generate`, then `prisma/deploy.ts`: applies migrations and seeds only an empty database), serve the production build |
| `npm run typecheck` · `npm run lint` · `npm test` | TypeScript, ESLint, Vitest unit tests |
| `npm run test:e2e` | Playwright suite against a running or auto-started server (`E2E_COMMAND=npm run dev` to test the dev server) |
| `npm run db:migrate` · `npm run db:deploy` · `npm run db:seed` · `npm run db:reset` | Prisma migrations and seeding |
| `node scripts/visual-review.mjs [baseUrl] [outDir]` | Screenshots every surface (desktop + phone, light + dark, signed out and per role) into `tests/visual/` and reports page errors |
| `node scripts/record-sample-lecture.mjs` | Re-records the sample lecture video used by seeded lessons |

## Architecture

```
src/
  app/                 routes (public site, (auth), campus, learn, studio, admin, enterprise/portal, account, api)
  components/          design system (ui/), site chrome, app shell, player, charts, AI chat, 3D
  server/
    auth/              password hashing, sessions, DAL (requireUser/requirePermission), permissions, areas
    queries/           read models per domain (academy, campus, research, cms, studio, admin, enterprise, search)
    actions/           server actions per domain (auth, campus, leads, admissions, studio, admin, content, enterprise)
    ai/                Anthropic client, tutor prompts, lesson context loading
  lib/                 client-safe utilities, validation schemas, site config, lab runner bridge
  proxy.ts             CSP nonce + optimistic sign-in redirect
prisma/                schema, migrations, seed and seed data
public/pyodide/        self-hosted Python runtime for the coding lab
tests/                 unit (Vitest) and e2e (Playwright)
```

**Authorisation** happens in the data access layer, not in the proxy: every page and action calls `requireUser` / `requirePermission` / `requireEnterpriseManager`, and queries select only what the caller may see (DTO pattern). Roles are `STUDENT`, `INSTRUCTOR`, `STAFF`, `ADMIN`; enterprise managers are derived from organisation membership.

**Rendering** is dynamic everywhere because the Content Security Policy uses a per-request nonce. Reads are cheap (SQLite/Postgres, request-level memoisation via React `cache`).

## Production notes

- **Database**: switch `prisma/schema.prisma` to `provider = "postgresql"`, install `@prisma/adapter-pg`, swap the adapter in `src/server/db.ts` and `prisma/seed.ts`, delete `prisma/migrations`, and run `npm run db:migrate` to regenerate migrations for Postgres. The schema avoids SQLite-only features.
- **Rate limiting** is in-process (`src/server/rate-limit.ts`). `RATE_LIMIT_SCALE` (default `1`) multiplies every limit; set it to `50` locally when the e2e and visual suites run repeatedly, never in production. Behind multiple instances, back it with Redis using the same interface.
- **Secrets**: only `SESSION_SECRET`, `DATABASE_URL` and `ANTHROPIC_API_KEY` are required. Never expose them with `NEXT_PUBLIC_`.
- **Build output**: `npm run build && npm run start` serves the production build. For container images, set `output: "standalone"` in `next.config.ts`, copy `public/` and `.next/static/` next to `.next/standalone/server.js`, and run that file with Node (Next refuses `next start` in standalone mode). Set `NEXT_PUBLIC_SITE_URL` to the public origin for canonical URLs, sitemap and certificate QR codes.
- **Headers**: HSTS, nosniff, frame denial, referrer policy and permissions policy are set in `next.config.ts`; the CSP is set per request in `src/proxy.ts`.

## Security posture

Argon2id hashing (OWASP parameters) · database sessions with SHA-256 token hashes, sliding expiry and revocation · generic sign-in errors with timing equalisation · rate limits on sign-in, registration, forms, search and AI · Zod validation on every input · same-origin checks on JSON endpoints · nonce CSP with no `unsafe-inline` scripts · append-only audit log for privileged actions · learner code runs client-side in a worker, never on the server.
