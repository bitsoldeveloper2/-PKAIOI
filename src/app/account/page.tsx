import type { Metadata } from "next";
import { requireUser } from "@/server/auth/dal";
import { getSession } from "@/server/auth/session";
import { logoutOtherSessionsAction } from "@/server/actions/auth";
import { getAreasFor } from "@/server/auth/areas";
import { homeFor, ROLE_LABELS } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { AppShell } from "@/components/app/app-shell";
import { PageHeader } from "@/components/ui/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { describeUserAgent, formatDate, relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Account settings", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const session = await getSession();
  const [areas, profile, sessions, memberships] = await Promise.all([
    getAreasFor(user),
    db.user.findUnique({ where: { id: user.id }, select: { bio: true, createdAt: true, lastLoginAt: true } }),
    db.session.findMany({ where: { userId: user.id, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" }, select: { id: true, lastSeenAt: true, userAgent: true, ip: true } }),
    db.membership.findMany({ where: { userId: user.id }, select: { role: true, org: { select: { name: true, plan: true } } } }),
  ]);
  const areaKey = homeFor(user.role) === "/admin" ? "admin" : homeFor(user.role) === "/studio" ? "studio" : "campus";

  return (
    <AppShell area={areaKey} user={user} areas={areas} contextLabel="Account">
      <div className="container-wide py-8 md:py-10">
        <PageHeader eyebrow="Account" title="Settings" lede="Your profile, password and active sessions." />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-6">
            <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="profile-title">
              <div className="flex items-center gap-4">
                <Avatar name={user.name} src={user.avatarUrl} size="lg" />
                <div>
                  <h2 id="profile-title" className="text-[1.0625rem] font-semibold text-ink">Profile</h2>
                  <p className="text-sm text-ink-muted">{user.email} · <Badge tone="outline">{ROLE_LABELS[user.role]}</Badge></p>
                </div>
              </div>
              <ProfileForm className="mt-6" defaults={{ name: user.name, headline: user.headline ?? "", bio: profile?.bio ?? "", timezone: user.timezone }} />
            </section>

            <section className="rounded-xl border border-line bg-surface p-6" aria-labelledby="password-title">
              <h2 id="password-title" className="text-[1.0625rem] font-semibold text-ink">Password</h2>
              <p className="mt-1 text-sm text-ink-muted">Changing your password signs out every other device.</p>
              <PasswordForm className="mt-6" />
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-line bg-surface p-5 text-sm" aria-labelledby="sessions-title">
              <div className="flex items-center justify-between gap-2">
                <h2 id="sessions-title" className="font-semibold text-ink">Active sessions</h2>
                <span className="text-xs tabular text-ink-muted">{sessions.length}</span>
              </div>
              <ul className="mt-3 space-y-3">
                {sessions.slice(0, 6).map((s) => (
                  <li key={s.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                    <p className="flex items-center gap-2 text-ink">
                      <span className="truncate" title={s.userAgent ?? undefined}>{describeUserAgent(s.userAgent)}</span>
                      {s.id === session?.id ? <Badge tone="accent">This device</Badge> : null}
                    </p>
                    <p className="text-xs text-ink-muted">{s.ip ?? "—"} · active {relativeTime(s.lastSeenAt)}</p>
                  </li>
                ))}
              </ul>
              {sessions.length > 6 ? <p className="mt-3 text-xs text-ink-muted">and {sessions.length - 6} more</p> : null}
              {sessions.length > 1 ? (
                <form action={logoutOtherSessionsAction} className="mt-4">
                  <Button type="submit" variant="outline" size="sm">Sign out other devices</Button>
                </form>
              ) : null}
            </section>
            {memberships.length ? (
              <section className="rounded-xl border border-line bg-surface p-5 text-sm" aria-labelledby="orgs-title">
                <h2 id="orgs-title" className="font-semibold text-ink">Organisations</h2>
                <ul className="mt-3 space-y-2">
                  {memberships.map((m) => (
                    <li key={m.org.name} className="flex items-center justify-between gap-2">
                      <span className="text-ink">{m.org.name}</span>
                      <Badge tone="neutral">{m.role.toLowerCase()}</Badge>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section className="rounded-xl border border-line bg-surface p-5 text-sm text-ink-muted" aria-labelledby="data-title">
              <h2 id="data-title" className="font-semibold text-ink">Your data</h2>
              <p className="mt-2">Member since {profile ? formatDate(profile.createdAt) : "—"}. To export or delete your data, write to <a href="mailto:privacy@pioai.edu.pk" className="link">privacy@pioai.edu.pk</a>.</p>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
