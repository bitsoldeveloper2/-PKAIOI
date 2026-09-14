import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Forbidden() {
  return (
    <main id="main" className="flex min-h-dvh flex-col">
      <div className="p-6">
        <Logo compact />
      </div>
      <div className="container-narrow flex flex-1 flex-col items-start justify-center py-16">
        <p className="eyebrow">403 · Restricted</p>
        <h1 className="mt-4 font-display text-display-lg text-ink">This area needs a different role.</h1>
        <p className="mt-4 max-w-md text-[1.0625rem] text-ink-muted">
          Your account is signed in but does not have permission to view this workspace. If you believe you should,
          ask an administrator to update your access.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/campus">Go to my campus</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
