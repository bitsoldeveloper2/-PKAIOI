import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/dal";
import { homeFor } from "@/server/auth/permissions";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ invite?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  const { invite } = await searchParams;

  return (
    <div>
      <p className="eyebrow">Join the campus</p>
      <h1 className="mt-3 font-display text-display-sm text-ink">Create your account</h1>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">
        Already enrolled?{" "}
        <Link href="/login" className="font-medium link">
          Sign in
        </Link>
        . Applying to a program?{" "}
        <Link href="/apply" className="font-medium link">
          Start an application
        </Link>
        .
      </p>
      <RegisterForm className="mt-8" inviteCode={invite} />
    </div>
  );
}
