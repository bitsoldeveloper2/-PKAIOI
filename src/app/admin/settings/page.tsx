import type { Metadata } from "next";
import { requirePermission } from "@/server/auth/dal";
import { getSettings } from "@/server/queries/admin";
import { aiEnabled, env } from "@/lib/env";
import { PageHeader } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePermission("admin:settings", "/admin/settings");
  const settings = await getSettings();

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Platform" title="Settings" lede="Site-wide controls. Secrets and infrastructure configuration live in environment variables, never here." />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <SettingsForm settings={settings} />
        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-surface p-5 text-sm" aria-labelledby="env-title">
            <h2 id="env-title" className="font-semibold text-ink">Environment</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-3"><dt className="text-ink-muted">AI provider</dt><dd>{aiEnabled ? <Badge tone="success">configured</Badge> : <Badge tone="warning">not configured</Badge>}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-ink-muted">Model</dt><dd className="font-mono text-xs text-ink">{env.ANTHROPIC_MODEL}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-ink-muted">Database</dt><dd className="font-mono text-xs text-ink">{env.DATABASE_URL.startsWith("file:") ? "SQLite (local)" : "PostgreSQL"}</dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-ink-muted">Site URL</dt><dd className="font-mono text-xs text-ink">{env.NEXT_PUBLIC_SITE_URL}</dd></div>
            </dl>
          </section>
          <section className="rounded-xl border border-line bg-surface p-5 text-sm text-ink-muted" aria-labelledby="sec-title">
            <h2 id="sec-title" className="font-semibold text-ink">Security posture</h2>
            <ul className="mt-2 space-y-1.5">
              <li>· Nonce-based Content Security Policy on every page</li>
              <li>· Argon2id password hashing; database-backed, revocable sessions</li>
              <li>· Role-based authorisation in the data access layer</li>
              <li>· Rate limits on sign-in, forms, search and AI</li>
              <li>· Append-only audit log for privileged actions</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
