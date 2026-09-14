"use client";

import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main id="main" className="container-narrow flex min-h-dvh flex-col items-start justify-center py-16">
          <p className="eyebrow">Fatal error</p>
          <h1 className="mt-4 font-display text-display-md text-ink">The application could not start.</h1>
          <p className="mt-4 max-w-md text-[1.0625rem] text-ink-muted">
            Something failed at the root of the page. Reload to try again.
          </p>
          {error.digest ? <p className="mt-3 font-mono text-xs text-ink-subtle">Reference: {error.digest}</p> : null}
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-ink"
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
