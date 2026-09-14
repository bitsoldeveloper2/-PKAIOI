import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/dal";
import { homeFor } from "@/server/auth/permissions";
import { safeNextPath } from "@/lib/utils";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  if (user) redirect(safeNextPath(next, homeFor(user.role)) as Route);

  const showDemo = process.env.NODE_ENV !== "production";

  return (
    <div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 font-display text-display-sm text-ink">Sign in to the campus</h1>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">
        New here?{" "}
        <Link href="/register" className="font-medium link">
          Create an account
        </Link>
        .
      </p>
      <LoginForm next={next} className="mt-8" />

      {showDemo ? (
        <div className="mt-8 rounded-lg border border-dashed border-line-strong p-4 text-[0.8125rem] text-ink-muted">
          <p className="font-semibold text-ink">Development sign-ins</p>
          <p className="mt-1">
            Seeded accounts share the password in <code className="font-mono">SEED_PASSWORD</code>:
          </p>
          <ul className="mt-2 grid gap-1 font-mono text-xs">
            <li>student@pioai.edu.pk</li>
            <li>instructor@pioai.edu.pk</li>
            <li>staff@pioai.edu.pk</li>
            <li>admin@pioai.edu.pk</li>
            <li>enterprise@nexus-bank.example</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
