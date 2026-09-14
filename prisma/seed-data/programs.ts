import type { ProgramLevel } from "../../src/generated/prisma/enums";

export type SeedProgram = {
  slug: string;
  title: string;
  tagline: string;
  level: ProgramLevel;
  format: string;
  durationWeeks: number;
  tuitionPkr: number | null;
  summary: string;
  description: string;
  outcomes: string[];
  curriculum: { title: string; items: string[] }[];
  admissions: { intake: string; deadline: string; requirements: string[] };
  featured?: boolean;
};

export const programs: SeedProgram[] = [
  {
    slug: "professional-diploma-applied-ai",
    title: "Professional Diploma in Applied Artificial Intelligence",
    tagline: "Nine months from working engineer to AI practitioner who ships.",
    level: "PROFESSIONAL",
    format: "Hybrid · Evenings and Saturdays",
    durationWeeks: 36,
    tuitionPkr: 495_000,
    summary:
      "Our flagship program for engineers and analysts who want to build, evaluate and operate machine learning systems in production. Cohort-based, project-heavy and taught by faculty who still ship.",
    description: `The Professional Diploma is built around one conviction: competence in AI is demonstrated by systems, not certificates. Over nine months you move through four studios — foundations, deep learning, language systems and production — each ending in a defended project reviewed by faculty and an industry examiner.

Cohorts are capped at forty. Evening lectures happen on campus in Lahore or live online; Saturday studios are hands-on and in person for hybrid learners. Every participant is paired with a faculty mentor for the capstone, which is scoped with a partner organisation whenever possible.

Graduates join an alumni network that includes engineers at fintechs, telecoms, hospitals and public-sector agencies across Pakistan and the Gulf.`,
    outcomes: [
      "Design, train and evaluate supervised, unsupervised and deep learning models with rigorous validation.",
      "Build retrieval-augmented and agentic systems on large language models, with evaluation harnesses you can defend.",
      "Deploy and monitor models with reproducible pipelines, cost budgets and incident playbooks.",
      "Communicate model behaviour, risk and limitations to non-technical decision makers.",
    ],
    curriculum: [
      { title: "Studio I · Foundations (8 weeks)", items: ["Python for AI engineers", "Foundations of machine learning", "Statistics for practitioners", "Project: tabular risk model with documented validation"] },
      { title: "Studio II · Deep learning (10 weeks)", items: ["Deep learning in practice", "Computer vision systems", "Optimisation and hardware awareness", "Project: perception pipeline on a partner dataset"] },
      { title: "Studio III · Language systems (10 weeks)", items: ["NLP with transformers", "LLM engineering and evaluation", "Retrieval, tools and agents", "Project: evaluated assistant for a domain corpus"] },
      { title: "Studio IV · Production (8 weeks)", items: ["MLOps and production systems", "AI safety, alignment and governance", "Capstone with partner organisation", "Public defence and portfolio review"] },
    ],
    admissions: {
      intake: "January and September cohorts",
      deadline: "Applications close eight weeks before each intake",
      requirements: [
        "A bachelor’s degree in a quantitative field, or two years of professional software or analytics experience.",
        "Working proficiency in Python (assessed in a 45-minute technical conversation).",
        "A short statement describing a problem you want to solve with AI.",
      ],
    },
    featured: true,
  },
  {
    slug: "foundations-of-ai-and-data",
    title: "Foundations of AI & Data",
    tagline: "A rigorous first course for people who want to understand, not just use.",
    level: "FOUNDATION",
    format: "Online · Self-paced with weekly live sessions",
    durationWeeks: 12,
    tuitionPkr: 85_000,
    summary:
      "Twelve weeks that take you from spreadsheets to your first well-validated model. Designed for analysts, product managers, early-career developers and career changers.",
    description: `Foundations is deliberately unhurried. We spend real time on the ideas that everything else rests on — probability, optimisation, generalisation — and we teach them through code you write yourself.

The program is online and self-paced, anchored by a weekly live session with faculty and a peer study group of eight. You finish with three graded projects and a portfolio page you can share.`,
    outcomes: [
      "Read and write Python confidently for data work.",
      "Explain what a model is learning and when it will fail.",
      "Train, validate and interpret classical models on real datasets.",
      "Decide, with evidence, whether a problem needs machine learning at all.",
    ],
    curriculum: [
      { title: "Weeks 1–4 · Computing and data", items: ["Python for AI engineers", "Data handling and visualisation", "Probability you can compute"] },
      { title: "Weeks 5–9 · Learning from data", items: ["Foundations of machine learning", "Validation and error analysis", "Project: predicting a real outcome"] },
      { title: "Weeks 10–12 · Judgement", items: ["Introduction to neural networks", "AI safety, alignment and governance", "Portfolio and next steps"] },
    ],
    admissions: {
      intake: "Rolling · Start any Monday",
      deadline: "No deadline",
      requirements: ["Comfort with secondary-school mathematics.", "A laptop and reliable internet.", "No prior programming required."],
    },
  },
  {
    slug: "advanced-certificate-llm-engineering",
    title: "Advanced Certificate in LLM Engineering",
    tagline: "Build language systems that survive contact with real users.",
    level: "ADVANCED",
    format: "Online · Cohort-based, two live studios a week",
    durationWeeks: 16,
    tuitionPkr: 260_000,
    summary:
      "For engineers already comfortable with Python and APIs. Sixteen weeks on retrieval, evaluation, tool use, agents, cost engineering and the failure modes nobody tells you about.",
    description: `Most LLM courses end where the difficulty begins. This certificate starts there. You will build the same assistant three times — naïve, retrieval-augmented, agentic — and measure each against an evaluation set you construct, so that every architectural decision is defended with numbers.

Studios are live and small. Each week pairs a lecture on a concept (context engineering, structured outputs, guardrails) with a lab that breaks something on purpose.`,
    outcomes: [
      "Design context and retrieval strategies with measured relevance and cost.",
      "Construct evaluation sets and LLM-as-judge pipelines you can trust.",
      "Build tool-using agents with permission boundaries and observability.",
      "Operate LLM features with budgets, caching and incident response.",
    ],
    curriculum: [
      { title: "Weeks 1–4 · Language models as components", items: ["NLP with transformers (refresher)", "Prompting, structured outputs and caching", "Building the naïve baseline"] },
      { title: "Weeks 5–10 · Retrieval and evaluation", items: ["LLM engineering and evaluation", "Chunking, embeddings, hybrid search", "Constructing an evaluation set", "Project: measured RAG assistant"] },
      { title: "Weeks 11–16 · Agents and operations", items: ["Tool use, planning and memory", "Safety, guardrails and red-teaming", "Cost and latency engineering", "Capstone: agentic workflow with evals"] },
    ],
    admissions: {
      intake: "March and October cohorts",
      deadline: "Six weeks before intake",
      requirements: ["Two or more years of professional programming experience.", "Familiarity with HTTP APIs and basic statistics.", "A take-home exercise (roughly three hours)."],
    },
    featured: true,
  },
  {
    slug: "executive-ai-strategy",
    title: "Executive Programme · AI Strategy for Leaders",
    tagline: "Six weeks for the people who decide what gets built.",
    level: "EXECUTIVE",
    format: "In person · Two residential weekends plus online modules",
    durationWeeks: 6,
    tuitionPkr: 350_000,
    summary:
      "A programme for executives, regulators and founders who must make consequential decisions about AI without becoming engineers. Case-based, candid and grounded in what the technology can actually do today.",
    description: `Leaders are surrounded by claims. This programme replaces claims with working knowledge: you will see models trained and broken in front of you, read a real evaluation report, and rehearse the governance decisions you will face.

The two residential weekends take place at the Lahore campus. Between them, faculty host online clinics on your organisation’s live questions.`,
    outcomes: [
      "Assess AI proposals for feasibility, cost and risk with the right questions.",
      "Set governance, procurement and data policies that hold up to scrutiny.",
      "Sequence an AI roadmap that compounds instead of stalling after a pilot.",
      "Speak credibly with engineers, regulators and boards.",
    ],
    curriculum: [
      { title: "Residential I · What the technology is", items: ["How models learn, and how they fail", "Live evaluation clinic", "Case: a bank’s underwriting model"] },
      { title: "Online · Strategy and governance", items: ["AI safety, alignment and governance", "Data as an institutional asset", "Procurement and vendor diligence"] },
      { title: "Residential II · Your roadmap", items: ["Portfolio prioritisation workshop", "Board-level communication", "Presentation to faculty panel"] },
    ],
    admissions: {
      intake: "Quarterly",
      deadline: "Three weeks before each residential",
      requirements: ["Senior leadership role or founder.", "Nomination or short interview with programme director."],
    },
  },
  {
    slug: "research-fellowship-machine-intelligence",
    title: "Research Fellowship in Machine Intelligence",
    tagline: "A funded year to do serious work alongside our labs.",
    level: "RESEARCH",
    format: "Full-time · Residential in Lahore",
    durationWeeks: 48,
    tuitionPkr: null,
    summary:
      "A twelve-month, fully funded fellowship for exceptional early-career researchers. Fellows embed in one of the institute’s labs, co-author with faculty and present at an international venue.",
    description: `The fellowship exists to grow research capacity in Pakistan. Fellows receive a stipend, compute allocation on the institute cluster, and a faculty advisor. The year is structured around one substantial research question agreed in the first month.

We look for evidence of independent thinking more than credentials: a thesis, an open-source contribution, a paper, or a well-argued proposal.`,
    outcomes: [
      "Produce a peer-reviewed publication or an equivalent open artefact.",
      "Develop rigorous experimental practice and reproducible research habits.",
      "Build a network across the institute’s labs and partner universities.",
    ],
    curriculum: [
      { title: "Months 1–2 · Orientation", items: ["Lab rotation", "Research methods seminar", "Proposal defence"] },
      { title: "Months 3–10 · Research", items: ["Weekly advisor meetings", "Reading groups", "Mid-year review"] },
      { title: "Months 11–12 · Dissemination", items: ["Paper writing workshop", "Conference submission", "Institute symposium talk"] },
    ],
    admissions: {
      intake: "One cohort per year, starting September",
      deadline: "31 March",
      requirements: ["Master’s degree or equivalent research experience.", "Research statement (two pages).", "Two references."],
    },
  },
];
