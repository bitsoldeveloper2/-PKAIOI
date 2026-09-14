import type { Metadata } from "next";
import Link from "next/link";
import { CertificateResult } from "../certificate-result";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  return { title: `Certificate ${code.toUpperCase()}`, robots: { index: false } };
}

export default async function VerifyCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <div className="container-narrow py-12 md:py-16">
      <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-ink-muted">
        <Link href="/verify" className="hover:text-ink">Verify a certificate</Link> <span aria-hidden>/</span> {code.toUpperCase()}
      </nav>
      <h1 className="mt-4 font-display text-display-md text-ink">Certificate verification</h1>
      <div className="mt-8">
        <CertificateResult code={code} />
      </div>
    </div>
  );
}
