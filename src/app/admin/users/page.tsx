import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { requirePermission } from "@/server/auth/dal";
import { listUsers } from "@/server/queries/admin";
import { ROLE_LABELS, ROLES } from "@/server/auth/permissions";
import { PageHeader } from "@/components/ui/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { formatDate, relativeTime } from "@/lib/utils";
import type { Role } from "@/generated/prisma/enums";
import { UserActions } from "./user-actions";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; page?: string }> }) {
  const [admin, params] = await Promise.all([requirePermission("admin:users", "/admin/users"), searchParams]);
  const role = params.role && (ROLES as string[]).includes(params.role) ? (params.role as Role) : undefined;
  const q = params.q?.trim().slice(0, 80) || undefined;
  const { users, total, page, pages } = await listUsers({ q, role, page: Number(params.page) || 1 });

  return (
    <div className="container-wide py-8 md:py-10">
      <PageHeader eyebrow="Platform" title="Users" lede={`${total} accounts. Roles control which workspaces a person can open; disabling an account ends its sessions immediately.`} />

      <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end" action="/admin/users" method="get">
        <div className="flex-1">
          <label htmlFor="user-q" className="text-sm font-medium text-ink">Search</label>
          <Input id="user-q" name="q" defaultValue={q} placeholder="Name or email" className="mt-1" />
        </div>
        <div className="sm:w-56">
          <label htmlFor="user-role" className="text-sm font-medium text-ink">Role</label>
          <Select id="user-role" name="role" defaultValue={role ?? ""} className="mt-1">
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[60rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3">Person</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{u.name}</p>
                      <p className="truncate text-xs text-ink-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge tone={u.role === "ADMIN" ? "gold" : u.role === "STAFF" ? "info" : u.role === "INSTRUCTOR" ? "accent" : "neutral"}>{ROLE_LABELS[u.role]}</Badge></td>
                <td className="px-4 py-3 text-xs text-ink-muted">{u._count.enrollments} enrolments · {u._count.coursesTaught} courses · {u._count.memberships} orgs</td>
                <td className="px-4 py-3 text-ink-muted">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-ink-muted">{u.lastLoginAt ? relativeTime(u.lastLoginAt) : "never"}</td>
                <td className="px-4 py-3">{u.disabledAt ? <Badge tone="danger">disabled</Badge> : <Badge tone="success">active</Badge>}</td>
                <td className="px-4 py-3 text-right"><UserActions userId={u.id} role={u.role} disabled={Boolean(u.disabledAt)} isSelf={u.id === admin.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav className="mt-4 flex items-center justify-between text-sm text-ink-muted" aria-label="Pagination">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 ? <Link href={`/admin/users?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${role ? `&role=${role}` : ""}` as Route} className="rounded-md border border-line px-3 py-1.5 hover:bg-surface-2">Previous</Link> : null}
            {page < pages ? <Link href={`/admin/users?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${role ? `&role=${role}` : ""}` as Route} className="rounded-md border border-line px-3 py-1.5 hover:bg-surface-2">Next</Link> : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
