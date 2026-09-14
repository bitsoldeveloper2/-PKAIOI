import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col">
      <div className="p-6">
        <Logo compact />
      </div>
      <div className="container-narrow flex flex-1 flex-col items-start justify-center py-16">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-display-lg text-ink">This page is not on the syllabus.</h1>
        <p className="mt-4 max-w-md text-[1.0625rem] text-ink-muted">
          The address may have changed, or the page may have been retired. Try the catalog, or search the institute.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/courses" variant="outline">
            Browse courses
          </ButtonLink>
          <Link href="/search" className="inline-flex h-10 items-center px-2 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline">
            Search
          </Link>
        </div>
      </div>
    </main>
  );
}
