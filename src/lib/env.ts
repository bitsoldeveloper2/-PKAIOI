import "server-only";
import { z } from "zod";
import { siteConfig } from "@/lib/site";
import { dataDirOf, resolveDatabaseUrl, resolveSessionSecret } from "@/lib/deploy-defaults";

/**
 * Server-side environment. Parsed once; anything else that touches
 * `process.env` should go through here so misconfiguration fails loudly at boot.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().startsWith("file:", 'DATABASE_URL must be a SQLite path starting with "file:"'),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters (generate 48 random bytes)"),
  NEXT_PUBLIC_SITE_URL: z.url(),
  ANTHROPIC_API_KEY: z.string().optional().transform((v) => (v && v.trim() ? v.trim() : undefined)),
  ANTHROPIC_MODEL: z.string().default("claude-opus-5"),
  SEED_PASSWORD: z.string().min(8).default("Campus!2026"),
  RATE_LIMIT_SCALE: z.coerce.number().min(1).max(1000).default(1),
});

// Production can run with no panel variables: the database defaults to a folder in
// the account's home directory, the session secret is generated once beside it, and
// the site URL comes from `siteConfig`, which already applies the production domain.
const databaseUrl = resolveDatabaseUrl(process.env.DATABASE_URL);
const parsed = schema.safeParse({
  ...process.env,
  DATABASE_URL: databaseUrl,
  SESSION_SECRET: databaseUrl.startsWith("file:") ? resolveSessionSecret(process.env.SESSION_SECRET, dataDirOf(databaseUrl)) : process.env.SESSION_SECRET,
  NEXT_PUBLIC_SITE_URL: siteConfig.url,
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === "production";
export const aiEnabled = Boolean(env.ANTHROPIC_API_KEY);
