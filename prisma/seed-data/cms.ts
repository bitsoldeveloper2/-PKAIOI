import type { ContentStatus, EventType } from "../../src/generated/prisma/enums";

export type SeedPage = { slug: string; title: string; body: string; seoTitle?: string; seoDescription?: string };

export const pages: SeedPage[] = [
  {
    slug: "about",
    title: "About the institute",
    seoTitle: "About · Pakistan Institute of AI",
    seoDescription: "Why the Pakistan Institute of AI exists, how it is governed, and what it stands for.",
    body: `## Why we exist

Pakistan has the sixth-largest population in the world, a median age of twenty-two, and a technology sector that grows faster than its supply of people who can build serious AI systems. The institute was founded in 2024 to close that gap with the same seriousness a national university brings to medicine or engineering: rigorous programs, original research and a campus where the tools are as modern as the ideas.

## What we believe

**Competence is demonstrated by systems, not certificates.** Every program ends in work that is reviewed, defended and — where possible — deployed.

**Research and teaching are one activity.** Faculty teach the courses that their labs’ findings inform, and learners contribute to lab projects from their first year.

**AI must work here.** In Urdu, on constrained hardware, under real regulatory and cultural conditions. Our research agenda follows from that constraint.

**Safety is a discipline, not a disclaimer.** Every learner completes the institute-wide course on safety, alignment and governance, and every deployed model carries a public evaluation report.

## Governance

The institute is a not-for-profit company limited by guarantee, governed by a board of trustees drawn from academia, industry and public service. Academic decisions rest with the Academic Council, chaired by the Dean. An independent Ethics Committee reviews research involving human data and all deployments with public partners.

## Campus

The Lahore campus houses lecture theatres, the compute cluster, the labs and a library. Learners in Karachi and Islamabad join hybrid cohorts through partner spaces, and fully online cohorts are open to learners anywhere.

## Partners

We work with provincial health and education departments, a central-bank working group, two roads authorities, farming cooperatives, banks, telecoms and technology companies. Partnerships give learners real problems and give partners access to research and talent.`,
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    seoDescription: "How the Pakistan Institute of AI collects, uses and protects personal data.",
    body: `_Last updated: 1 September 2026_

## What we collect

- **Account data**: name, email, password (stored only as a salted Argon2id hash), profile information you choose to add.
- **Learning data**: enrolments, lesson progress, quiz attempts, lab submissions, notes and certificates.
- **AI tutor conversations**: messages you send to the tutor and the responses, stored so you can return to them. Conversations are processed by our AI provider under a data-processing agreement and are not used to train their models.
- **Applications and enquiries**: information you submit to admissions or through contact forms.
- **Technical data**: IP address and browser type in security and audit logs, kept for ninety days.

## How we use it

To provide and improve the platform, to administer admissions and programs, to issue and verify certificates, to keep the service secure, and — if you opt in — to send the institute’s monthly letter.

## Your rights

You may access, correct or export your data, and ask us to delete your account, by writing to **privacy@pioai.edu.pk**. We respond within thirty days. Certificates that have been issued remain verifiable by their code; the certificate record shows only your name and the course.

## Retention

Learning records are kept while your account is active and for two years after, unless you ask for earlier deletion. Audit logs are retained for ninety days. Admissions records are retained for one admissions cycle after a decision.

## Security

Sessions are database-backed and revocable, all traffic is encrypted in transit, and access to production data is limited to named staff with audit logging.`,
  },
  {
    slug: "terms",
    title: "Terms of use",
    seoDescription: "Terms governing use of the Pakistan Institute of AI platform.",
    body: `_Last updated: 1 September 2026_

1. **Accounts.** You are responsible for the security of your credentials and for activity under your account. One person per account.
2. **Academic integrity.** Work you submit must be your own. The AI tutor is a learning aid; presenting its output as your own in graded work is misconduct.
3. **Content.** Course materials are licensed to you for personal learning and may not be redistributed. Research publications carry their own licences.
4. **Certificates.** Certificates are issued on completion of the stated requirements and may be revoked for misconduct. Verification is public by code.
5. **Acceptable use.** No attempts to access other users’ data, disrupt the service or circumvent security controls. We operate a responsible-disclosure programme at **security@pioai.edu.pk**.
6. **Changes.** We may update these terms; material changes will be announced on the platform thirty days in advance.
7. **Governing law.** These terms are governed by the laws of Pakistan.`,
  },
  {
    slug: "accessibility",
    title: "Accessibility statement",
    seoDescription: "The institute’s commitment to an accessible platform and how to report barriers.",
    body: `We want every learner to be able to use the platform fully. The public site, campus, studio and administrative tools are built to meet **WCAG 2.2 Level AA**.

## What we do

- Semantic structure with landmarks, headings and a skip link on every page.
- Full keyboard operability, including menus, dialogs, tabs and the course player.
- Visible focus indicators and colour contrast of at least 4.5:1 for text.
- Captions for lecture video and transcripts for audio.
- Respect for reduced-motion preferences: animations and the 3D experience are disabled when your system asks for it.
- Light and dark themes that follow your system preference.

## Known limitations

- Some third-party research PDFs are not yet tagged for screen readers. We are remediating the most-read documents first.
- The in-browser coding lab uses a code editor with partial screen-reader support; a plain textarea mode is available from the editor menu.

## Tell us

If you encounter a barrier, write to **accessibility@pioai.edu.pk**. We aim to respond within five working days and to fix critical barriers within thirty.`,
  },
];

export type SeedPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  status?: ContentStatus;
  publishedDaysAgo: number;
  authorKey: string;
};

export const posts: SeedPost[] = [
  {
    slug: "urduqa-benchmark-release",
    title: "UrduQA: why we built a benchmark that models cannot have memorised",
    excerpt: "Static benchmarks decay the moment they enter training data. Here is how we built one that stays honest, and what it tells us about the state of Urdu language technology.",
    category: "Research",
    tags: ["language", "evaluation", "urdu"],
    publishedDaysAgo: 6,
    authorKey: "bilal",
    body: `When we started evaluating language models on Urdu two years ago, the numbers looked encouraging. Then we noticed something: the best-performing models did suspiciously well on questions drawn from Wikipedia and suspiciously badly on questions drawn from last month’s newspapers.

The explanation was mundane. The benchmarks everyone used were on the internet, and so were the models’ training sets.

## Building for contamination resistance

UrduQA has three properties that keep it honest:

1. **Post-cutoff sources.** Every question is drawn from documents published after the training cutoff of the models we evaluate, and we refresh a portion each quarter.
2. **Paraphrase checks.** Each question has a paraphrased twin. A large gap between twin scores signals memorisation of surface form.
3. **Held-out release.** Half the benchmark is public; half is run by us on request. Rankings on the two halves should agree.

## What we found

Across fourteen models, the gap between English and Urdu performance is nineteen points on average. Two interventions close most of it: extending the tokeniser vocabulary with Urdu subwords (which also cuts token cost by 40%) and a modest amount of instruction fine-tuning on Urdu data.

The full paper appears at ACL 2026. The public half of the benchmark and the evaluation harness are on the lab’s GitHub.`,
  },
  {
    slug: "september-2026-cohort-opens",
    title: "Applications open for the September 2026 Professional Diploma cohort",
    excerpt: "Forty places, two scholarships for women in engineering, and a new capstone partnership with the provincial health department.",
    category: "Admissions",
    tags: ["admissions", "diploma", "scholarships"],
    publishedDaysAgo: 14,
    authorKey: "staff",
    body: `Applications for the September intake of the Professional Diploma in Applied Artificial Intelligence are now open and close on **18 July**.

## What is new this year

- **Capstone partnerships.** Every capstone team will be paired with a partner organisation. Confirmed partners include the provincial health department, two banks and a logistics company.
- **Scholarships.** Two full-tuition scholarships for women in engineering, funded by an alumni gift, and four half-tuition need-based awards.
- **Hybrid Karachi cohort.** Saturday studios will run in Karachi for the first time, at our partner space in Clifton.

## How to apply

The application takes about forty minutes: a short form, a statement describing a problem you want to solve with AI, and a CV. Shortlisted applicants have a 45-minute technical conversation with faculty.

[Start your application →](/apply)`,
  },
  {
    slug: "cotton-vision-kit-field-results",
    title: "Six months in the field with the smallholder vision kit",
    excerpt: "What we learned deploying crop-disease detection on sub-$50 hardware across forty-one farms in Punjab — including everything that broke.",
    category: "Research",
    tags: ["vision", "agriculture", "edge"],
    publishedDaysAgo: 28,
    authorKey: "zara",
    body: `In March we placed forty-one vision kits with cotton farmers across three districts. Each kit is a camera, a microcontroller board and a solar cell in a 3D-printed housing. The model detects leaf curl and bacterial blight and sends a daily summary by SMS.

## What worked

- Detection recall for leaf curl held at 91% in the field, within three points of validation.
- Farmers used the SMS summaries; the cooperative’s agronomist changed her visit schedule based on them.

## What broke

- **Dust.** Lenses fogged within weeks. A cheap hood and a monthly wipe schedule fixed it.
- **Heat.** Two boards failed above 48°C. We moved the electronics under the panel.
- **Novel objects.** The model flagged a plastic bag as blight for a week. The review loop caught it; a retraining cycle with 200 new images fixed it.

The dataset from this deployment is now part of the public release accompanying our CVPR workshop paper, and the hardware design is open.`,
  },
  {
    slug: "what-a-model-card-should-tell-a-bank",
    title: "What a model card should tell a bank",
    excerpt: "We reviewed the documentation for twelve models in use at financial institutions in the region. Most would not pass a basic procurement check.",
    category: "Perspectives",
    tags: ["governance", "finance", "evaluation"],
    publishedDaysAgo: 40,
    authorKey: "fatima",
    body: `Over the past year the Safety, Alignment & Governance Lab reviewed documentation for twelve models in production at banks and payment companies — with their cooperation, under NDA. Our conclusions are general enough to share.

## Three gaps

**No evaluation on local data.** Nine of twelve cards reported benchmark results from the vendor with no evaluation on the institution’s own transactions or customers.

**No breakdown.** Only two cards reported performance by group — region, gender, account age. Aggregate accuracy hides the failures that regulators will ask about.

**No limitations.** Five cards had no limitations section at all.

## What to require

We publish a procurement checklist in our public-sector evaluation guide. The short version: evaluation on your data, results by group, calibration, a limitations section, and the right to re-run the evaluation after every model update.`,
  },
  {
    slug: "governance-forum-2026",
    title: "Governance Forum 2026: regulators, companies and the questions in between",
    excerpt: "Highlights from the institute’s annual forum, held this year with the central-bank working group and three provincial departments.",
    category: "News",
    tags: ["events", "governance"],
    publishedDaysAgo: 55,
    authorKey: "admin",
    body: `Two hundred participants joined the third Governance Forum at the Lahore campus. Three sessions stood out.

**Evaluation before procurement.** The central-bank working group presented the draft evaluation standard for credit models, developed with our Safety lab. Consultation runs until October.

**Teachers and assistants.** The education department shared early results from the Urdu lesson-planning assistant: teachers save around four hours a week, and the content-safety pipeline blocked 0.3% of generations.

**Incident reporting.** A panel of engineers from banks and telecoms argued for a shared, anonymised incident registry for AI systems in the region. The institute will host a pilot.

Recordings and slides are available to registered attendees in the campus library.`,
  },
  {
    slug: "how-we-teach-evaluation",
    title: "Why every course at the institute ends with an evaluation, not a demo",
    excerpt: "A note from the Dean on the pedagogy behind the academy — and why we grade validation plans more heavily than model accuracy.",
    category: "Perspectives",
    tags: ["pedagogy", "academy"],
    publishedDaysAgo: 75,
    authorKey: "ayesha",
    body: `Visitors are sometimes surprised that our grading rubrics weight *validation* at thirty-five percent and *model quality* at twenty. The reason is simple. A model that performs well on an honest evaluation is valuable. A model that performs well on a dishonest one is dangerous, and it is far more common.

So we teach validation first, and we keep coming back to it. Learners in *Foundations of Machine Learning* implement cross-validation before they implement a second model. In *LLM Engineering & Evaluation* they build an evaluation set before they build the assistant. Capstones are defended in front of an examiner whose first question is always the same: how do you know?

This is slower than teaching tools. It is also the only approach we have found that produces engineers we would trust with a system that affects people.`,
  },
  {
    slug: "draft-cluster-expansion",
    title: "Compute cluster expansion (draft)",
    excerpt: "Draft announcement of the second phase of the institute cluster.",
    category: "News",
    tags: ["infrastructure"],
    status: "DRAFT",
    publishedDaysAgo: 0,
    authorKey: "admin",
    body: `Draft. The second phase adds sixteen accelerators and a shared scheduler, available to all research fellows and diploma capstone teams from November.`,
  },
];

export type SeedAnnouncement = { title: string; body: string; audience: string; authorKey: string; publishedDaysAgo: number };

export const announcements: SeedAnnouncement[] = [
  {
    title: "Methods clinic every Thursday",
    body: "Dr. Hina Aslam hosts an open statistics and methods clinic every Thursday at 5pm (Lahore) — in person and online. Bring your validation questions.",
    audience: "ALL",
    authorKey: "admin",
    publishedDaysAgo: 3,
  },
  {
    title: "AI tutor now understands your current lesson",
    body: "The tutor in the course player can now see the lesson you are on and the code in your lab. Ask it to explain, not to solve — it is tuned to teach.",
    audience: "STUDENTS",
    authorKey: "ayesha",
    publishedDaysAgo: 9,
  },
  {
    title: "Capstone partner briefings",
    body: "Partner organisations will brief diploma cohorts on capstone problems next week. Attendance is required for Studio IV learners.",
    audience: "STUDENTS",
    authorKey: "staff",
    publishedDaysAgo: 12,
  },
];

export type SeedEvent = {
  title: string;
  description: string;
  type: EventType;
  location: string;
  inDays: number;
  hour: number;
  durationHours?: number;
  courseSlug?: string;
};

export const events: SeedEvent[] = [
  { title: "Live session · Validation clinic", description: "Bring your cross-validation plans; we will critique three live.", type: "LECTURE", location: "Online · Campus room A", inDays: 1, hour: 17, courseSlug: "foundations-of-machine-learning" },
  { title: "Workshop · Building an evaluation set", description: "Hands-on construction of a fifty-question evaluation set for your own corpus.", type: "WORKSHOP", location: "Lahore campus · Studio 2", inDays: 3, hour: 10, durationHours: 3, courseSlug: "llm-engineering-and-evaluation" },
  { title: "Deadline · Maternal health project", description: "Submit the notebook, memo and walk-through recording.", type: "DEADLINE", location: "Project workspace", inDays: 6, hour: 23, durationHours: 0, courseSlug: "foundations-of-machine-learning" },
  { title: "Seminar · Automation bias in clinical AI", description: "Dr. Fatima Noor presents results from the three-hospital randomised study.", type: "SEMINAR", location: "Lahore campus · Auditorium and online", inDays: 8, hour: 16 },
  { title: "Cohort · Professional Diploma September intake begins", description: "Orientation for the new cohort.", type: "COHORT", location: "Lahore campus", inDays: 21, hour: 9, durationHours: 6 },
  { title: "Workshop · Edge deployment lab", description: "Quantise and profile a detector on Jetson-class hardware.", type: "WORKSHOP", location: "Lahore campus · Robotics lab", inDays: 12, hour: 14, durationHours: 3, courseSlug: "computer-vision-systems" },
];
