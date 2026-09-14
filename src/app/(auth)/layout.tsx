import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AmbientLattice } from "@/components/three/ambient-lattice";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <AmbientLattice intensity={0.8} />
      <aside className="relative hidden overflow-hidden bg-[var(--hero-a)] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, rgba(61,180,140,0.35), transparent 60%), radial-gradient(50% 40% at 90% 90%, rgba(217,180,92,0.18), transparent 60%), linear-gradient(180deg, var(--hero-a), var(--hero-b))",
          }}
        />
        <div aria-hidden className="grain absolute inset-0" />
        <div className="relative">
          <Logo invert />
        </div>
        <blockquote className="relative max-w-md">
          <p className="font-display-soft text-[2rem] leading-[1.15] text-white">
            “The institute does not teach tools. It teaches the judgement to know which tool the problem deserves.”
          </p>
          <footer className="mt-6 text-sm text-white/70">Founding charter, Pakistan Institute of AI</footer>
        </blockquote>
        <p className="relative text-xs text-white/65">Lahore · Karachi · Islamabad · Online</p>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-5 lg:justify-end">
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="text-sm text-ink-muted hover:text-ink">
              Back to site
            </Link>
          </div>
        </div>
        <main id="main" className="flex flex-1 items-center justify-center px-5 pb-16 pt-4 sm:px-8">
          <div className="w-full max-w-[26rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
