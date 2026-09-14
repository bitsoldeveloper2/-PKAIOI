"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="container-narrow flex min-h-[70dvh] flex-col items-start justify-center py-16">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 font-display text-display-md text-ink">We hit an unexpected error.</h1>
      <p className="mt-4 max-w-md text-[1.0625rem] text-ink-muted">
        The page could not be rendered. You can try again, or head back to the campus. If this keeps happening, quote the
        reference below to support.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-ink-subtle">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}
