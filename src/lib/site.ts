/**
 * Client-safe site configuration. Anything secret belongs in `src/lib/env.ts`.
 */
export const siteConfig = {
  name: "Pakistan Institute of AI",
  shortName: "PIOAI",
  // Paths are appended as `${url}/path`, so a trailing slash would double up.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
  tagline: "An institution for the age of intelligence.",
  description:
    "The Pakistan Institute of AI educates engineers, researchers and leaders in artificial intelligence through rigorous programs, applied research and an AI-native campus.",
  foundedYear: 2024,
  locale: "en-PK",
  address: {
    street: "Block 7, Gulberg III",
    city: "Lahore",
    region: "Punjab",
    postalCode: "54660",
    country: "Pakistan",
  },
  contact: {
    email: "admissions@pioai.edu.pk",
    phone: "+92 42 3577 0000",
  },
  social: {
    linkedin: "https://www.linkedin.com/school/pioai",
    x: "https://x.com/pioai_edu",
    youtube: "https://www.youtube.com/@pioai",
    github: "https://github.com/pioai",
  },
} as const;

export const publicNav = [
  {
    label: "Academy",
    href: "/academy",
    children: [
      { label: "Programs", href: "/programs", description: "Diplomas, professional tracks, executive education and short courses." },
      { label: "Course catalog", href: "/courses", description: "Self-paced and cohort courses across the AI stack." },
      { label: "Admissions", href: "/admissions", description: "Intakes, requirements, scholarships and how to apply." },
    ],
  },
  {
    label: "Research",
    href: "/research",
    children: [
      { label: "Labs", href: "/research", description: "Six labs from language to safety." },
      { label: "Publications", href: "/research/publications", description: "Papers, preprints and reports." },
      { label: "Faculty", href: "/faculty", description: "The people behind the institute." },
    ],
  },
  { label: "Enterprise", href: "/enterprise" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
] as const;

export const footerNav = {
  Academy: [
    { label: "Programs", href: "/programs" },
    { label: "Course catalog", href: "/courses" },
    { label: "Admissions", href: "/admissions" },
    { label: "Apply", href: "/apply" },
    { label: "Verify a certificate", href: "/verify" },
  ],
  Institute: [
    { label: "About", href: "/about" },
    { label: "Faculty", href: "/faculty" },
    { label: "Research", href: "/research" },
    { label: "Journal", href: "/journal" },
    { label: "Contact", href: "/contact" },
  ],
  Platform: [
    { label: "Student campus", href: "/campus" },
    { label: "Instructor studio", href: "/studio" },
    { label: "Enterprise portal", href: "/enterprise/portal" },
    { label: "Sign in", href: "/login" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
  ],
} as const;
