import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach admissions, partnerships, research or the registrar at the Pakistan Institute of AI.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-x grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-4 font-display text-display-md text-ink">We reply to every message.</h1>
        <p className="mt-4 max-w-md text-[1.0625rem] text-ink-muted">Within two working days for general questions, one for enterprise partnerships. If it is urgent, call.</p>

        <dl className="mt-10 space-y-5 text-sm">
          <div className="relative pl-7">
            <dt className="font-semibold text-ink"><MapPin className="absolute left-0 top-0.5 size-4 text-accent" aria-hidden />Campus</dt>
            <dd className="mt-0.5 text-ink-muted">{siteConfig.address.street}, {siteConfig.address.city} {siteConfig.address.postalCode}, {siteConfig.address.country}</dd>
          </div>
          <div className="relative pl-7">
            <dt className="font-semibold text-ink"><Mail className="absolute left-0 top-0.5 size-4 text-accent" aria-hidden />Email</dt>
            <dd className="mt-0.5 space-y-0.5 text-ink-muted">
              <p><a href="mailto:admissions@pioai.edu.pk" className="link">admissions@pioai.edu.pk</a> — programs and applications</p>
              <p><a href="mailto:partnerships@pioai.edu.pk" className="link">partnerships@pioai.edu.pk</a> — enterprise and research partners</p>
              <p><a href="mailto:registrar@pioai.edu.pk" className="link">registrar@pioai.edu.pk</a> — accounts, records and certificates</p>
              <p><a href="mailto:press@pioai.edu.pk" className="link">press@pioai.edu.pk</a> — media</p>
            </dd>
          </div>
          <div className="relative pl-7">
            <dt className="font-semibold text-ink"><Phone className="absolute left-0 top-0.5 size-4 text-accent" aria-hidden />Phone</dt>
            <dd className="mt-0.5 text-ink-muted">{siteConfig.contact.phone} · Monday–Friday, 9am–5pm PKT</dd>
          </div>
        </dl>
      </div>
      <ContactForm />
    </div>
  );
}
