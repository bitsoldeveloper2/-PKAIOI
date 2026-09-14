import type { ProjectStatus, PublicationType } from "../../src/generated/prisma/enums";

export type SeedFaculty = {
  slug: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  expertise: string[];
  links: { label: string; url: string }[];
  userKey?: string;
  featured?: boolean;
};

export const faculty: SeedFaculty[] = [
  {
    slug: "ayesha-rehman",
    name: "Dr. Ayesha Rehman",
    title: "Professor of Machine Learning · Dean of the Academy",
    department: "Machine Learning",
    userKey: "ayesha",
    featured: true,
    expertise: ["Probabilistic modelling", "AI for public health", "Curriculum design"],
    links: [
      { label: "Google Scholar", url: "https://scholar.google.com/" },
      { label: "Personal site", url: "https://example.edu/ayesha" },
    ],
    bio: `Ayesha Rehman joined the institute as founding Dean after a decade split between academia and applied research at a national health agency. Her work on probabilistic models for maternal-health risk stratification is used in district health programmes across Punjab.

She teaches *Foundations of Machine Learning* and *Deep Learning in Practice*, and chairs the academy’s curriculum committee. She holds a PhD in Statistics from the University of Oxford and a BSc from LUMS.

**Office hours:** Tuesdays 4–6pm, Lahore campus, or by appointment for online learners.`,
  },
  {
    slug: "bilal-ahmed",
    name: "Dr. Bilal Ahmed",
    title: "Associate Professor · Head of the Language & Reasoning Lab",
    department: "Language",
    userKey: "bilal",
    featured: true,
    expertise: ["Large language models", "Evaluation", "Urdu NLP", "Retrieval"],
    links: [{ label: "Google Scholar", url: "https://scholar.google.com/" }, { label: "GitHub", url: "https://github.com/" }],
    bio: `Bilal Ahmed leads the Language & Reasoning Lab, whose work on evaluation harnesses and Urdu-language benchmarks is used by several regional AI teams. Before the institute he was a research scientist at a large search company, working on question answering.

He teaches *NLP with Transformers* and *LLM Engineering & Evaluation*, and supervises three research fellows. PhD, University of Edinburgh.`,
  },
  {
    slug: "zara-siddiqui",
    name: "Dr. Zara Siddiqui",
    title: "Assistant Professor · Head of the Perception & Robotics Lab",
    department: "Vision",
    userKey: "zara",
    featured: true,
    expertise: ["Computer vision", "Edge deployment", "Agricultural AI", "Robotics"],
    links: [{ label: "Lab page", url: "https://example.edu/perception" }],
    bio: `Zara Siddiqui’s lab builds vision systems that run on low-cost hardware in the field: crop-disease detection for smallholder farmers, and automated inspection of bridges and power lines. She teaches *Computer Vision Systems*.

PhD in Robotics from ETH Zürich; previously a perception engineer at an autonomous-machinery start-up.`,
  },
  {
    slug: "usman-tariq",
    name: "Usman Tariq",
    title: "Professor of Practice · AI Engineering",
    department: "Engineering",
    userKey: "usman",
    expertise: ["Data platforms", "Python", "Software craft", "Fintech"],
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/" }],
    bio: `Usman Tariq spent fifteen years building data platforms at fintech and telecom companies before joining the institute to teach the engineering craft that underpins every deployed model. He teaches *Python for AI Engineers* and mentors capstone teams on production readiness.`,
  },
  {
    slug: "fatima-noor",
    name: "Dr. Fatima Noor",
    title: "Research Lead · Safety, Alignment & Governance Lab",
    department: "Safety & Policy",
    userKey: "fatima",
    featured: true,
    expertise: ["AI safety", "Evaluation", "Red-teaming", "Public-sector governance"],
    links: [{ label: "Policy briefs", url: "https://example.edu/safety" }],
    bio: `Fatima Noor leads the institute’s work on how AI systems fail and how institutions should govern them. Her lab has advised provincial governments and two central-bank working groups on evaluation and procurement standards. She teaches the institute-wide *AI Safety, Alignment & Governance* course.

PhD in Computer Science, Carnegie Mellon University.`,
  },
  {
    slug: "omar-farooq",
    name: "Dr. Omar Farooq",
    title: "Associate Professor · Head of the Systems for ML Lab",
    department: "Engineering",
    userKey: "omar",
    expertise: ["Efficient training", "Model serving", "Optimisation", "MLOps"],
    links: [{ label: "Google Scholar", url: "https://scholar.google.com/" }],
    bio: `Omar Farooq works on training and serving large models efficiently on constrained hardware — the reality for most organisations in the region. He teaches *MLOps & Production Systems* and is developing the *Reinforcement Learning Foundations* course.

PhD, National University of Singapore.`,
  },
  {
    slug: "hina-aslam",
    name: "Dr. Hina Aslam",
    title: "Senior Lecturer · Statistics",
    department: "Machine Learning",
    expertise: ["Bayesian inference", "Experimental design", "Causal inference"],
    links: [],
    bio: `Hina Aslam teaches the statistics that make machine learning honest: uncertainty, experimental design and causal reasoning. She runs the academy’s methods clinic, open to all learners.`,
  },
  {
    slug: "tariq-mehmood",
    name: "Tariq Mehmood",
    title: "Lecturer · Product & Design for AI",
    department: "Engineering",
    expertise: ["Product management", "Human–AI interaction", "Design research"],
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/" }],
    bio: `Tariq Mehmood teaches how AI features are designed, scoped and measured with users. He previously led product for a consumer app with twenty million users across South Asia.`,
  },
];

export type SeedLab = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  focusAreas: string[];
  leadSlug?: string;
};

export const labs: SeedLab[] = [
  {
    slug: "language-and-reasoning",
    name: "Language & Reasoning Lab",
    tagline: "Models that understand the languages of two hundred and forty million people.",
    leadSlug: "bilal-ahmed",
    focusAreas: ["Urdu and regional-language benchmarks", "Evaluation of reasoning", "Retrieval and grounding", "Efficient fine-tuning"],
    description: `The lab studies how large language models represent, reason about and generate text — with a deliberate focus on Urdu, Punjabi, Sindhi and Pashto, which remain poorly served by systems trained on English-heavy corpora.

Current work includes a public benchmark suite for Urdu question answering, methods for measuring reasoning quality without leaking test data into training, and retrieval techniques that hold up on legal and administrative documents.

The lab collaborates with the Safety, Alignment & Governance Lab on evaluation infrastructure and with two provincial education departments on assistive tools for teachers.`,
  },
  {
    slug: "perception-and-robotics",
    name: "Perception & Robotics Lab",
    tagline: "Vision that works on a dusty road at four in the afternoon.",
    leadSlug: "zara-siddiqui",
    focusAreas: ["Crop-disease detection", "Infrastructure inspection", "Edge inference", "Data collection at scale"],
    description: `We build vision systems for conditions that benchmarks ignore: harsh light, low-cost cameras, intermittent connectivity and no possibility of a human in the loop. Field partners include cotton and wheat cooperatives in Punjab and a provincial roads authority.

The lab maintains one of the region’s largest labelled agricultural image sets and publishes the tooling used to collect and audit it.`,
  },
  {
    slug: "safety-alignment-governance",
    name: "Safety, Alignment & Governance Lab",
    tagline: "How systems fail, and how institutions should respond.",
    leadSlug: "fatima-noor",
    focusAreas: ["Evaluation and red-teaming", "Public-sector deployment", "Procurement standards", "Human factors"],
    description: `The lab works at the intersection of technical evaluation and institutional practice. We build evaluation suites for systems deployed in government and finance, run red-team exercises with partner organisations, and publish guidance that regulators in Pakistan have adopted.

We also host the institute’s annual Governance Forum, which brings together regulators, companies and civil society.`,
  },
  {
    slug: "systems-for-ml",
    name: "Systems for Machine Learning Lab",
    tagline: "Frontier techniques on non-frontier hardware.",
    leadSlug: "omar-farooq",
    focusAreas: ["Efficient training", "Quantisation and serving", "Scheduling on shared clusters", "Energy-aware ML"],
    description: `Most organisations in the region train and serve models on a handful of GPUs, often shared. The lab develops methods — memory-efficient fine-tuning, quantisation-aware serving, scheduling for shared clusters — that make frontier techniques practical at that scale, and operates the institute’s compute cluster as a living testbed.`,
  },
  {
    slug: "health-and-society",
    name: "AI for Health & Society Lab",
    tagline: "Rigorous models for decisions that affect real people.",
    leadSlug: "ayesha-rehman",
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

export const publications: SeedPublication[] = [
  {
    slug: "urduqa-benchmark-2026",
    title: "UrduQA: A Contamination-Resistant Benchmark for Question Answering in Urdu",
    abstract: "We introduce UrduQA, a 4,200-question benchmark built from post-2025 sources with paraphrase-based contamination checks. We evaluate fourteen open and proprietary models, finding a 19-point gap between English and Urdu performance that narrows substantially with vocabulary extension and modest fine-tuning.",
    authors: ["Bilal Ahmed", "Rafia Hussain", "Ali Hassan", "Sana Malik"],
    venue: "ACL 2026 (Findings)",
    year: 2026,
    type: "PAPER",
    url: "https://aclanthology.org/",
    labSlug: "language-and-reasoning",
    featured: true,
  },
  {
    slug: "reasoning-eval-without-leakage",
    title: "Measuring Reasoning Without Leaking the Test: Procedural Generation for LLM Evaluation",
    abstract: "Static reasoning benchmarks decay as their contents enter training corpora. We propose procedurally generated evaluation families with controllable difficulty and show that model rankings remain stable across generations while absolute scores reveal contamination in three widely used benchmarks.",
    authors: ["Bilal Ahmed", "Omar Farooq", "Hamid Raza"],
    venue: "ICLR 2026",
    year: 2026,
    type: "PAPER",
    url: "https://openreview.net/",
    labSlug: "language-and-reasoning",
    featured: true,
  },
  {
    slug: "cotton-leaf-disease-edge",
    title: "Field-Robust Cotton Leaf Disease Detection on Sub-$50 Hardware",
    abstract: "We present a detection pipeline for cotton leaf curl and bacterial blight that runs at 6 fps on a low-cost microcontroller board. A labelled dataset of 38,000 field images from 41 farms in Punjab is released with the paper, together with the collection and audit tooling.",
    authors: ["Zara Siddiqui", "Imran Khalid", "Noor Fatima Baig"],
    venue: "CVPR 2025 Workshop on Computer Vision for Agriculture",
    year: 2025,
    type: "PAPER",
    url: "https://openaccess.thecvf.com/",
    labSlug: "perception-and-robotics",
    featured: true,
  },
  {
    slug: "bridge-inspection-uav",
    title: "Automated Crack Segmentation for Bridge Inspection from Consumer Drones",
    abstract: "A segmentation model and flight protocol for inspecting concrete bridges with off-the-shelf drones, validated on 112 structures with a provincial roads authority. We report per-structure recall and the failure cases that motivated a human review workflow.",
    authors: ["Zara Siddiqui", "Ahmed Shah", "Mariam Aziz"],
    venue: "Automation in Construction",
    year: 2025,
    type: "PAPER",
    labSlug: "perception-and-robotics",
  },
  {
    slug: "public-sector-llm-evaluation-guide",
    title: "Evaluating Language Models for Public-Sector Deployment: A Practical Guide",
    abstract: "A guide for government teams procuring or building LLM-based services: what to evaluate, how to construct evaluation sets from real casework, how to red-team, and what to require from vendors. Includes templates adopted by two provincial departments.",
    authors: ["Fatima Noor", "Hamza Qureshi", "Sana Malik"],
    venue: "PIOAI Policy Report 2026-01",
    year: 2026,
    type: "REPORT",
    url: "https://example.edu/reports/public-sector-llm",
    labSlug: "safety-alignment-governance",
    featured: true,
  },
  {
    slug: "automation-bias-clinical-triage",
    title: "Automation Bias in AI-Assisted Clinical Triage: A Randomised Study in Three Hospitals",
    abstract: "In a randomised study with 84 clinicians, an AI triage assistant improved accuracy when it was right and degraded it when it was wrong, with the effect concentrated among junior staff. We propose interface changes that recover most of the loss and evaluate them in a follow-up arm.",
    authors: ["Fatima Noor", "Ayesha Rehman", "Kiran Shafiq"],
    venue: "The Lancet Digital Health",
    year: 2025,
    type: "PAPER",
    labSlug: "safety-alignment-governance",
  },
  {
    slug: "lora-scheduling-shared-clusters",
    title: "Fair Scheduling of Parameter-Efficient Fine-Tuning Jobs on Shared GPU Clusters",
    abstract: "We study scheduling for clusters shared by many small fine-tuning jobs and propose a preemption-aware scheduler that improves median job completion time by 2.3× on the institute’s cluster traces, which we release.",
    authors: ["Omar Farooq", "Daniyal Mirza", "Bilal Ahmed"],
    venue: "MLSys 2026",
    year: 2026,
    type: "PAPER",
    labSlug: "systems-for-ml",
  },
  {
    slug: "quantisation-urdu-models",
    title: "Does Quantisation Hurt Low-Resource Languages More? Evidence from Urdu and Sindhi",
    abstract: "Post-training quantisation is evaluated across languages. We find degradation is 1.8–2.6× larger for Urdu and Sindhi than for English at 4-bit precision and identify tokenizer fragmentation as the main mechanism.",
    authors: ["Omar Farooq", "Bilal Ahmed", "Hira Yousaf"],
    venue: "arXiv preprint",
    year: 2026,
    type: "PREPRINT",
    url: "https://arxiv.org/",
    labSlug: "systems-for-ml",
  },
  {
    slug: "maternal-risk-punjab-calibration",
    title: "Calibrated Risk Stratification for Maternal Health in Rural Punjab",
    abstract: "A probabilistic model for maternal risk, developed with district health authorities, validated prospectively on 6,100 pregnancies. We report calibration across facilities and demographic groups and describe the deployment and monitoring protocol.",
    authors: ["Ayesha Rehman", "Hina Aslam", "Maryam Khan"],
    venue: "npj Digital Medicine",
    year: 2025,
    type: "PAPER",
    labSlug: "health-and-society",
    featured: false,
  },
  {
    slug: "punjab-health-facility-dataset",
    title: "PHF-2025: An Anonymised Dataset of Facility-Level Maternal Health Records",
    abstract: "A de-identified, consented dataset of 41,000 facility visits released for research under a data-use agreement, with documentation of collection, anonymisation and known gaps.",
    authors: ["Ayesha Rehman", "Sana Malik"],
    venue: "PIOAI Data Release",
    year: 2025,
    type: "DATASET",
    labSlug: "health-and-society",
  },
];

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
