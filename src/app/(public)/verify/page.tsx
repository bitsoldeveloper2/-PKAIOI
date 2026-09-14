import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificateResult } from "./certificate-result";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: "Check the authenticity of a certificate issued by the Pakistan Institute of AI.",
  alternates: { canonical: "/verify" },
};

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;

  return (
    <div className="container-narrow py-12 md:py-16">
      <ShieldCheck className="size-8 text-accent" aria-hidden />
      <h1 className="mt-4 font-display text-display-md text-ink">Verify a certificate.</h1>
      <p className="mt-3 text-[1.0625rem] text-ink-muted">
        Every certificate the institute issues carries a unique code. Enter it below to confirm the holder, course and issue date. Verification is public and requires no account.
      </p>
      <form action="/verify" method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="verify-code" className="sr-only">Certificate code</label>
        <input
          id="verify-code"
          name="code"
          required
          defaultValue={code ?? ""}
          pattern="[A-Za-z0-9-]{8,32}"
          placeholder="PIOAI-XXXXX-XXXXX"
          autoComplete="off"
          className="h-12 flex-1 rounded-md border border-line-strong bg-surface px-4 font-mono text-[0.9375rem] uppercase text-ink placeholder:text-ink-subtle placeholder:normal-case focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
        <Button type="submit" size="lg">Verify</Button>
      </form>

      {code ? (
        <div className="mt-8">
          <CertificateResult code={code} />
        </div>
      ) : null}

      <p className="mt-8 text-sm text-ink-muted">
        Employers: certificate pages can be linked directly and remain valid unless revoked. Questions to{" "}
        <a href="mailto:registrar@pioai.edu.pk" className="link">registrar@pioai.edu.pk</a>.
      </p>
    </div>
  );
}
