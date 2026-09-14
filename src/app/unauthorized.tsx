import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Unauthorized() {
  return (
    <main id="main" className="flex min-h-dvh flex-col">
      <div className="p-6">
        <Logo compact />
      </div>
      <div className="container-narrow flex flex-1 flex-col items-start justify-center py-16">
        <p className="eyebrow">401 · Sign in required</p>
        <h1 className="mt-4 font-display text-display-lg text-ink">Please sign in to continue.</h1>
        <p className="mt-4 max-w-md text-[1.0625rem] text-ink-muted">Your session has ended or you have not signed in yet.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/login">Sign in</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
