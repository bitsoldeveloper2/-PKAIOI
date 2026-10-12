import type { ProjectStatus, PublicationType } from "../../src/generated/prisma/enums";

export type SeedLab = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  focusAreas: string[];
};

export const labs: SeedLab[] = [
  {
    slug: "language-and-reasoning",
    name: "Language & Reasoning Lab",
    tagline: "Models that understand the languages of two hundred and forty million people.",
    focusAreas: ["Urdu and regional-language benchmarks", "Evaluation of reasoning", "Retrieval and grounding", "Efficient fine-tuning"],
    description: `The lab studies how large language models represent, reason about and generate text — with a deliberate focus on Urdu, Punjabi, Sindhi and Pashto, which remain poorly served by systems trained on English-heavy corpora.

Current work includes a public benchmark suite for Urdu question answering, methods for measuring reasoning quality without leaking test data into training, and retrieval techniques that hold up on legal and administrative documents.

The lab collaborates with the Safety, Alignment & Governance Lab on evaluation infrastructure and with two provincial education departments on assistive tools for teachers.`,
  },
  {
    slug: "perception-and-robotics",
    name: "Perception & Robotics Lab",
    tagline: "Vision that works on a dusty road at four in the afternoon.",
    focusAreas: ["Crop-disease detection", "Infrastructure inspection", "Edge inference", "Data collection at scale"],
    description: `We build vision systems for conditions that benchmarks ignore: harsh light, low-cost cameras, intermittent connectivity and no possibility of a human in the loop. Field partners include cotton and wheat cooperatives in Punjab and a provincial roads authority.

The lab maintains one of the region’s largest labelled agricultural image sets and publishes the tooling used to collect and audit it.`,
  },
  {
    slug: "safety-alignment-governance",
    name: "Safety, Alignment & Governance Lab",
    tagline: "How systems fail, and how institutions should respond.",
    focusAreas: ["Evaluation and red-teaming", "Public-sector deployment", "Procurement standards", "Human factors"],
    description: `The lab works at the intersection of technical evaluation and institutional practice. We build evaluation suites for systems deployed in government and finance, run red-team exercises with partner organisations, and publish guidance that regulators in Pakistan have adopted.

We also host the institute’s annual Governance Forum, which brings together regulators, companies and civil society.`,
  },
  {
    slug: "systems-for-ml",
    name: "Systems for Machine Learning Lab",
    tagline: "Frontier techniques on non-frontier hardware.",
    focusAreas: ["Efficient training", "Quantisation and serving", "Scheduling on shared clusters", "Energy-aware ML"],
    description: `Most organisations in the region train and serve models on a handful of GPUs, often shared. The lab develops methods — memory-efficient fine-tuning, quantisation-aware serving, scheduling for shared clusters — that make frontier techniques practical at that scale, and operates the institute’s compute cluster as a living testbed.`,
  },
  {
    slug: "health-and-society",
    name: "AI for Health & Society Lab",
    tagline: "Rigorous models for decisions that affect real people.",
    focusAreas: ["Maternal and child health", "Epidemiological modelling", "Fairness and calibration", "Deployment with district partners"],
    description: `The lab partners with district health authorities to build, validate and deploy risk models for maternal and child health, and studies the fairness and calibration properties of models used to allocate scarce clinical resources. Every deployed model is accompanied by a public evaluation report.`,
  },
];

export type SeedPublication = {
  slug: string;
  title: string;
  abstract: string;
  authors: string[];
  venue: string;
  year: number;
  type: PublicationType;
  url?: string;
  labSlug: string;
  featured?: boolean;
};

// Publications are authored and curated through the admin console once the
// institute’s research output is ready to publish; the seed ships none.
export const publications: SeedPublication[] = [];

export type SeedProject = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: ProjectStatus;
  labSlug: string;
  startedDaysAgo: number;
  endedDaysAgo?: number;
};

export const projects: SeedProject[] = [
  {
    slug: "urdu-teacher-assistant",
    title: "Assistive lesson planning for government-school teachers",
    summary: "An Urdu-first assistant that drafts lesson plans aligned to the provincial curriculum, evaluated with 120 teachers.",
    description: "In partnership with a provincial education department, the lab is building and evaluating an assistant for lesson planning and worksheet generation in Urdu. The project emphasises evaluation with real teachers and a strict content-safety pipeline.",
    status: "ACTIVE",
    labSlug: "language-and-reasoning",
    startedDaysAgo: 240,
  },
  {
    slug: "legal-retrieval-benchmark",
    title: "Retrieval benchmark for Pakistani case law",
    summary: "A benchmark and baseline systems for retrieving relevant judgments and statutes.",
    description: "Constructed with a law faculty partner, the benchmark includes 900 queries with expert relevance judgments across Supreme Court and High Court judgments.",
    status: "ACTIVE",
    labSlug: "language-and-reasoning",
    startedDaysAgo: 150,
  },
  {
    slug: "smallholder-vision-kit",
    title: "Smallholder vision kit",
    summary: "Open hardware and software for in-field crop-disease detection.",
    description: "A reference design — camera, board, enclosure and firmware — that cooperatives can assemble locally, with a model update channel and offline operation.",
    status: "ACTIVE",
    labSlug: "perception-and-robotics",
    startedDaysAgo: 400,
  },
  {
    slug: "roads-authority-inspection",
    title: "Bridge inspection programme with the provincial roads authority",
    summary: "Operational deployment of crack segmentation across 112 structures.",
    description: "Completed deployment with a human-review workflow, an audit of failure cases and a hand-over to the authority’s engineering team.",
    status: "COMPLETED",
    labSlug: "perception-and-robotics",
    startedDaysAgo: 600,
    endedDaysAgo: 90,
  },
  {
    slug: "central-bank-evaluation-standard",
    title: "Evaluation standard for AI in credit decisioning",
    summary: "Drafting a standard for evaluating AI models used in lending, with a central-bank working group.",
    description: "The lab is drafting evaluation and documentation requirements for models used in consumer credit, including fairness reporting across groups and a calibration standard.",
    status: "ACTIVE",
    labSlug: "safety-alignment-governance",
    startedDaysAgo: 120,
  },
  {
    slug: "cluster-scheduler-open-source",
    title: "Open-source scheduler for shared fine-tuning clusters",
    summary: "Releasing the preemption-aware scheduler used on the institute cluster.",
    description: "A production-ready release of the scheduler evaluated in the MLSys paper, with a Kubernetes operator and documentation.",
    status: "PLANNED",
    labSlug: "systems-for-ml",
    startedDaysAgo: -30,
  },
];
