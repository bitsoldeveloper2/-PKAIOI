import Link from "next/link";
import { footerNav, siteConfig } from "@/lib/site";
import { Logo } from "@/components/logo";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line bg-bg-deep">
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-md">
            <Logo />
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-muted">
              {siteConfig.tagline} Rigorous programs, applied research and an AI-native campus, built in Lahore for the world.
            </p>
            <div className="mt-8">
              <p className="text-sm font-semibold text-ink">The Letter</p>
              <p className="mt-1 text-sm text-ink-muted">One considered note a month on research, admissions and what we are building.</p>
              <NewsletterForm className="mt-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {Object.entries(footerNav).map(([group, links]) => (
              <div key={group}>
                <p className="eyebrow mb-4">{group}</p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-[0.8125rem] text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.name}. {siteConfig.address.street}, {siteConfig.address.city}, {siteConfig.address.country}.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-ink">
              {siteConfig.contact.email}
            </a>
            <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              LinkedIn
            </a>
            <a href={siteConfig.social.x} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              X
            </a>
            <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
