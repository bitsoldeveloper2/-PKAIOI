import type { ActivityType, ApplicationStatus, LeadStage, MembershipRole, MessageRole, OrgPlan } from "../../src/generated/prisma/enums";

export type SeedOrg = {
  slug: string;
  name: string;
  domain?: string;
  plan: OrgPlan;
  seats: number;
  inviteCode: string;
  members: { userKey: string; role: MembershipRole; joinedDaysAgo?: number }[];
};

export const organizations: SeedOrg[] = [
  {
    slug: "nexus-bank",
    name: "Nexus Bank",
    domain: "nexus-bank.example",
    plan: "ENTERPRISE",
    seats: 50,
    inviteCode: "NEXUS-2026",
    members: [
      { userKey: "kamran", role: "OWNER", joinedDaysAgo: 75 },
      { userKey: "daniyal", role: "MEMBER", joinedDaysAgo: 70 },
      { userKey: "hira", role: "MEMBER", joinedDaysAgo: 70 },
    ],
  },
  {
    slug: "karachi-port-logistics",
    name: "Karachi Port Logistics",
    domain: "kpl.example",
    plan: "TEAM",
    seats: 10,
    inviteCode: "KPL-TEAM-26",
    members: [
      { userKey: "sara", role: "MANAGER", joinedDaysAgo: 40 },
      { userKey: "bilquis", role: "MEMBER", joinedDaysAgo: 38 },
    ],
  },
];

export type SeedLearnerActivity = {
  userKey: string;
  orgSlug?: string;
  enrollments: { courseSlug: string; completedLessons: number; enrolledDaysAgo: number; lastActiveDaysAgo?: number; grade?: string }[];
};

/** completedLessons counts from the start of the course; a value ≥ lesson count completes it and issues a certificate. */
export const learnerActivity: SeedLearnerActivity[] = [
  {
    userKey: "ali",
    enrollments: [
      { courseSlug: "python-for-ai-engineers", completedLessons: 99, enrolledDaysAgo: 90, lastActiveDaysAgo: 30, grade: "Distinction" },
      { courseSlug: "foundations-of-machine-learning", completedLessons: 8, enrolledDaysAgo: 40, lastActiveDaysAgo: 0 },
      { courseSlug: "ai-safety-alignment-and-governance", completedLessons: 2, enrolledDaysAgo: 10, lastActiveDaysAgo: 1 },
    ],
  },
  {
    userKey: "maryam",
    enrollments: [
      { courseSlug: "foundations-of-machine-learning", completedLessons: 99, enrolledDaysAgo: 78, lastActiveDaysAgo: 20, grade: "Merit" },
      { courseSlug: "deep-learning-in-practice", completedLessons: 3, enrolledDaysAgo: 18, lastActiveDaysAgo: 1 },
      { courseSlug: "applied-ai-for-professionals", completedLessons: 2, enrolledDaysAgo: 6, lastActiveDaysAgo: 2 },
    ],
  },
  {
    userKey: "hassan",
    enrollments: [
      { courseSlug: "foundations-of-machine-learning", completedLessons: 5, enrolledDaysAgo: 30, lastActiveDaysAgo: 2 },
      { courseSlug: "python-for-ai-engineers", completedLessons: 4, enrolledDaysAgo: 28, lastActiveDaysAgo: 3 },
    ],
  },
  {
    userKey: "zainab",
    enrollments: [
      { courseSlug: "ai-safety-alignment-and-governance", completedLessons: 5, enrolledDaysAgo: 25, lastActiveDaysAgo: 5 },
      { courseSlug: "digital-media-marketing-essentials", completedLessons: 4, enrolledDaysAgo: 12, lastActiveDaysAgo: 1 },
    ],
  },
  {
    userKey: "ahmed",
    enrollments: [{ courseSlug: "llm-engineering-and-evaluation", completedLessons: 4, enrolledDaysAgo: 22, lastActiveDaysAgo: 9 }],
  },
  {
    userKey: "noor",
    enrollments: [
      { courseSlug: "foundations-of-machine-learning", completedLessons: 2, enrolledDaysAgo: 8, lastActiveDaysAgo: 1 },
      { courseSlug: "ai-essentials", completedLessons: 3, enrolledDaysAgo: 9, lastActiveDaysAgo: 0 },
    ],
  },
  {
    userKey: "kamran",
    orgSlug: "nexus-bank",
    enrollments: [{ courseSlug: "ai-safety-alignment-and-governance", completedLessons: 99, enrolledDaysAgo: 60, lastActiveDaysAgo: 15, grade: "Merit" }],
  },
  {
    userKey: "daniyal",
    orgSlug: "nexus-bank",
    enrollments: [
      { courseSlug: "llm-engineering-and-evaluation", completedLessons: 7, enrolledDaysAgo: 55, lastActiveDaysAgo: 2 },
      { courseSlug: "mlops-and-production-systems", completedLessons: 2, enrolledDaysAgo: 20, lastActiveDaysAgo: 4 },
    ],
  },
  {
    userKey: "hira",
    orgSlug: "nexus-bank",
    enrollments: [
      { courseSlug: "foundations-of-machine-learning", completedLessons: 99, enrolledDaysAgo: 65, lastActiveDaysAgo: 10, grade: "Distinction" },
      { courseSlug: "ai-safety-alignment-and-governance", completedLessons: 4, enrolledDaysAgo: 15, lastActiveDaysAgo: 3 },
    ],
  },
  {
    userKey: "sara",
    orgSlug: "karachi-port-logistics",
    enrollments: [
      { courseSlug: "ai-safety-alignment-and-governance", completedLessons: 3, enrolledDaysAgo: 30, lastActiveDaysAgo: 4 },
      { courseSlug: "digital-media-marketing-professional", completedLessons: 2, enrolledDaysAgo: 7, lastActiveDaysAgo: 1 },
    ],
  },
  {
    userKey: "bilquis",
    orgSlug: "karachi-port-logistics",
    enrollments: [{ courseSlug: "python-for-ai-engineers", completedLessons: 6, enrolledDaysAgo: 28, lastActiveDaysAgo: 6 }],
  },
];

export type SeedLead = {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  role?: string;
  source: string;
  interest?: string;
  stage: LeadStage;
  value?: number;
  ownerKey?: string;
  message?: string;
  createdDaysAgo: number;
  activities: { type: ActivityType; body: string; authorKey?: string }[];
};

export const leads: SeedLead[] = [
  {
    name: "Rashid Mehmood",
    email: "rashid.mehmood@habib-textiles.example",
    phone: "+92 300 1234567",
    organization: "Habib Textiles",
    role: "CTO",
    source: "Enterprise inquiry",
    interest: "Enterprise · 51-200 learners",
    stage: "PROPOSAL",
    value: 4_800_000,
    ownerKey: "staff",
    message: "We want to upskill 60 engineers across three plants on applied ML and MLOps.",
    createdDaysAgo: 21,
    activities: [
      { type: "MEETING", body: "Discovery call with Rashid and the plant heads. Priority: predictive maintenance and quality vision.", authorKey: "staff" },
      { type: "EMAIL", body: "Sent proposal: 60 seats on the Enterprise plan, custom cohort of MLOps and Computer Vision Systems, two on-site workshops.", authorKey: "staff" },
      { type: "STAGE", body: "Moved to Proposal.", authorKey: "staff" },
    ],
  },
  {
    name: "Amna Sheikh",
    email: "amna.sheikh@punjab-health.example",
    organization: "Punjab Health Department",
    role: "Director, Digital Health",
    source: "Referral",
    interest: "Executive programme",
    stage: "QUALIFIED",
    value: 1_400_000,
    ownerKey: "staff",
    createdDaysAgo: 15,
    activities: [
      { type: "CALL", body: "Wants four directors on the next Executive Programme. Interested in the governance module.", authorKey: "staff" },
    ],
  },
  {
    name: "Faisal Iqbal",
    email: "faisal.iqbal@telco-one.example",
    organization: "TelcoOne",
    role: "Head of Data Science",
    source: "Governance Forum",
    interest: "Enterprise · 11-50 learners",
    stage: "CONTACTED",
    value: 2_100_000,
    ownerKey: "staff",
    createdDaysAgo: 10,
    activities: [{ type: "EMAIL", body: "Followed up after the forum with the enterprise brochure and LLM Engineering syllabus.", authorKey: "staff" }],
  },
  {
    name: "Sadia Rauf",
    email: "sadia.rauf@example.com",
    source: "Contact form",
    interest: "program",
    stage: "NEW",
    message: "Is the Foundations program suitable for someone with a finance background and no coding?",
    createdDaysAgo: 2,
    activities: [{ type: "NOTE", body: "Contact form message: Is the Foundations program suitable for someone with a finance background and no coding?" }],
  },
  {
    name: "Bilal Chaudhry",
    email: "bilal.chaudhry@example.com",
    source: "Newsletter",
    interest: "Journal",
    stage: "NEW",
    createdDaysAgo: 1,
    activities: [],
  },
  {
    name: "Nadia Karim",
    email: "nadia.karim@gulf-insure.example",
    organization: "Gulf Insure",
    role: "Chief Risk Officer",
    source: "Enterprise inquiry",
    interest: "Enterprise · 201-1000 learners",
    stage: "WON",
    value: 9_500_000,
    ownerKey: "staff",
    createdDaysAgo: 60,
    activities: [
      { type: "MEETING", body: "Executive briefing in Dubai.", authorKey: "staff" },
      { type: "STAGE", body: "Contract signed: 120 seats, Enterprise plan, custom governance track.", authorKey: "staff" },
    ],
  },
  {
    name: "Imran Butt",
    email: "imran.butt@example.com",
    source: "Contact form",
    interest: "course",
    stage: "LOST",
    message: "Looking for a two-day crash course on ChatGPT for marketing.",
    createdDaysAgo: 35,
    activities: [{ type: "NOTE", body: "Not a fit — referred to a partner training provider.", authorKey: "staff" }],
  },
  {
    name: "Dr. Saima Latif",
    email: "saima.latif@uni.example",
    organization: "Partner University",
    role: "Head of Computer Science",
    source: "Referral",
    interest: "research",
    stage: "QUALIFIED",
    ownerKey: "admin",
    createdDaysAgo: 18,
    activities: [{ type: "MEETING", body: "Discussed joint supervision of research fellows and shared cluster access.", authorKey: "admin" }],
  },
  {
    name: "Omar Siddique",
    email: "omar.siddique@example.com",
    source: "Newsletter",
    interest: "Journal",
    stage: "CONTACTED",
    createdDaysAgo: 8,
    activities: [{ type: "EMAIL", body: "Replied to his question about the LLM certificate take-home exercise.", authorKey: "staff" }],
  },
  {
    name: "Hina Malik",
    email: "hina.malik@startup.example",
    organization: "Stealth startup",
    role: "Founder",
    source: "Contact form",
    interest: "enterprise",
    stage: "NEW",
    message: "Five-person founding team wants a private LLM engineering cohort.",
    createdDaysAgo: 4,
    activities: [{ type: "NOTE", body: "Contact form: five-person founding team wants a private LLM engineering cohort." }],
  },
  {
    name: "Yasir Abbas",
    email: "yasir.abbas@ngo.example",
    organization: "Education NGO",
    role: "Programme Director",
    source: "Governance Forum",
    interest: "Executive programme",
    stage: "CONTACTED",
    ownerKey: "staff",
    createdDaysAgo: 12,
    activities: [{ type: "CALL", body: "Interested in scholarship places for NGO staff on the Executive Programme.", authorKey: "staff" }],
  },
  {
    name: "Kiran Shafiq",
    email: "kiran.shafiq@example.com",
    source: "Website",
    interest: "program",
    stage: "NEW",
    createdDaysAgo: 0,
    activities: [],
  },
];

export type SeedApplication = {
  programSlug: string;
  applicantKey?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  education: string;
  experience: string;
  statement: string;
  status: ApplicationStatus;
  score?: number;
  reviewerKey?: string;
  reviewNotes?: string;
  decided?: boolean;
  createdDaysAgo: number;
  events: { type: string; body: string; actorKey?: string }[];
};

const statement = (topic: string) =>
  `I want to join the institute because ${topic}. Over the past two years I have taught myself the basics through online courses, but I have reached the point where I need rigour, mentorship and a community of people who take the work seriously. My goal after the program is to lead an applied AI team that ships systems people can trust.`;

export const applications: SeedApplication[] = [
  {
    programSlug: "short-course-digital-media-marketing-essentials",
    firstName: "Hira",
    lastName: "Saleem",
    email: "hira.saleem@example.com",
    phone: "+92 300 5550188",
    country: "Pakistan",
    city: "Faisalabad",
    education: "BBA, Government College University Faisalabad (2023)",
    experience: "Runs a home-based clothing brand with 4,000 Instagram followers and handles all of its marketing herself.",
    statement: "I want to join the one-month Digital Media Marketing short course because my brand only grows when I post, and I have no idea which posts or ads actually bring sales. I need to learn how to plan content, run paid campaigns without wasting money, and read the numbers properly so that I can make this a full-time business.",
    status: "SUBMITTED",
    createdDaysAgo: 2,
    events: [],
  },
  {
    programSlug: "short-course-applied-ai",
    firstName: "Taimoor",
    lastName: "Aziz",
    email: "taimoor.aziz@example.com",
    phone: "+92 333 5550177",
    country: "Pakistan",
    city: "Rawalpindi",
    education: "MBA, NUST Business School (2020)",
    experience: "Operations manager at a logistics company; builds the weekly reports in Excel and wants to automate them.",
    statement: "I use AI assistants every day but I have hit the limit of what the chat window can do. I want the three-month Applied AI short course so that I can clean our data myself, build a simple delay-prediction model for our routes, and automate the reporting that takes my team two days a week. My capstone would be the delay model, evaluated honestly.",
    status: "UNDER_REVIEW",
    reviewerKey: "staff",
    createdDaysAgo: 5,
    events: [{ type: "STATUS", body: "Moved to Under review.", actorKey: "staff" }],
  },
  {
    programSlug: "professional-diploma-applied-ai",
    firstName: "Sarah",
    lastName: "Ahmed",
    email: "sarah.ahmed@example.com",
    phone: "+92 321 5550101",
    country: "Pakistan",
    city: "Lahore",
    education: "BSc Computer Science, FAST-NUCES (2022)",
    experience: "Three years as a backend engineer at a payments company, building fraud rules and dashboards.",
    statement: statement("I have watched fraud rules fail in ways a model would have caught, and I want to be the person who builds and validates that model properly"),
    status: "INTERVIEW",
    score: 82,
    reviewerKey: "ayesha",
    reviewNotes: "Strong engineering background; statement shows real problem awareness. Schedule technical conversation.",
    createdDaysAgo: 12,
    events: [
      { type: "STATUS", body: "Moved to Under review.", actorKey: "staff" },
      { type: "SCORE", body: "Scored 82/100.", actorKey: "ayesha" },
      { type: "STATUS", body: "Invited to interview on Thursday.", actorKey: "ayesha" },
    ],
  },
  {
    programSlug: "professional-diploma-applied-ai",
    firstName: "Muhammad",
    lastName: "Usman",
    email: "m.usman@example.com",
    phone: "+92 333 5550102",
    country: "Pakistan",
    city: "Karachi",
    education: "BE Electrical Engineering, NED (2020)",
    experience: "Four years in telecom network operations; wrote Python tooling for capacity forecasting.",
    statement: statement("network capacity planning at my company is done in spreadsheets, and I have a prototype that beats them"),
    status: "UNDER_REVIEW",
    score: 74,
    reviewerKey: "usman",
    createdDaysAgo: 9,
    events: [{ type: "STATUS", body: "Moved to Under review.", actorKey: "staff" }, { type: "SCORE", body: "Scored 74/100.", actorKey: "usman" }],
  },
  {
    programSlug: "advanced-certificate-llm-engineering",
    firstName: "Ayesha",
    lastName: "Tariq",
    email: "ayesha.tariq@example.com",
    phone: "+92 300 5550103",
    country: "Pakistan",
    city: "Islamabad",
    education: "MS Data Science, NUST (2023)",
    experience: "Two years building chatbots for a customer-service vendor; shipped a RAG system with no evaluation and regrets it.",
    statement: statement("I have shipped a RAG system without an evaluation set and I never want to do that again"),
    status: "OFFER",
    score: 91,
    reviewerKey: "bilal",
    reviewNotes: "Excellent take-home. Offer made.",
    decided: true,
    createdDaysAgo: 20,
    events: [
      { type: "STATUS", body: "Moved to Under review.", actorKey: "staff" },
      { type: "SCORE", body: "Scored 91/100 — outstanding take-home.", actorKey: "bilal" },
      { type: "STATUS", body: "Offer issued; deposit due in 14 days.", actorKey: "staff" },
    ],
  },
  {
    programSlug: "foundations-of-ai-and-data",
    firstName: "Hamid",
    lastName: "Raza",
    email: "hamid.raza@example.com",
    phone: "+92 345 5550104",
    country: "Pakistan",
    city: "Multan",
    education: "BCom, Bahauddin Zakariya University (2019)",
    experience: "Accountant at a sugar mill; comfortable with Excel and Power BI.",
    statement: statement("our mill’s production data has never been analysed properly and I believe I can change that"),
    status: "ACCEPTED",
    score: 70,
    reviewerKey: "staff",
    decided: true,
    createdDaysAgo: 30,
    events: [{ type: "STATUS", body: "Accepted — Foundations rolling intake.", actorKey: "staff" }],
  },
  {
    programSlug: "executive-ai-strategy",
    firstName: "Naveed",
    lastName: "Anjum",
    email: "naveed.anjum@bank.example",
    phone: "+92 300 5550105",
    country: "Pakistan",
    city: "Karachi",
    education: "MBA, IBA Karachi (2008)",
    experience: "Chief Operating Officer at a mid-sized bank.",
    statement: statement("our board has approved an AI budget and I need to know which questions to ask before we spend it"),
    status: "SUBMITTED",
    createdDaysAgo: 3,
    events: [],
  },
  {
    programSlug: "research-fellowship-machine-intelligence",
    firstName: "Rafia",
    lastName: "Hussain",
    email: "rafia.hussain@example.com",
    phone: "+92 331 5550106",
    country: "Pakistan",
    city: "Lahore",
    education: "MS Computer Science, LUMS (2025) — thesis on Urdu tokenisation",
    experience: "Research assistant; co-author on the UrduQA benchmark.",
    statement: statement("I want to spend a year on tokenisation for Urdu and Sindhi with the Language & Reasoning Lab"),
    status: "INTERVIEW",
    score: 88,
    reviewerKey: "bilal",
    createdDaysAgo: 25,
    events: [{ type: "SCORE", body: "Scored 88/100.", actorKey: "bilal" }, { type: "STATUS", body: "Panel interview scheduled.", actorKey: "admin" }],
  },
  {
    programSlug: "professional-diploma-applied-ai",
    firstName: "Zeeshan",
    lastName: "Malik",
    email: "zeeshan.malik@example.com",
    phone: "+92 300 5550107",
    country: "United Arab Emirates",
    city: "Dubai",
    education: "BSc Software Engineering, COMSATS (2018)",
    experience: "Six years as a full-stack developer in Dubai.",
    statement: statement("I want to move from building CRUD apps to building systems that learn"),
    status: "WAITLISTED",
    score: 68,
    reviewerKey: "usman",
    decided: true,
    createdDaysAgo: 28,
    events: [{ type: "SCORE", body: "Scored 68/100.", actorKey: "usman" }, { type: "STATUS", body: "Waitlisted for September; strong candidate for January.", actorKey: "staff" }],
  },
  {
    programSlug: "advanced-certificate-llm-engineering",
    firstName: "Tooba",
    lastName: "Khan",
    email: "tooba.khan@example.com",
    phone: "+92 322 5550108",
    country: "Pakistan",
    city: "Peshawar",
    education: "BS Computer Science, UET Peshawar (2021)",
    experience: "Junior ML engineer; one year of production experience.",
    statement: statement("I am the only ML engineer at my company and I need peers and mentors"),
    status: "REJECTED",
    score: 52,
    reviewerKey: "bilal",
    reviewNotes: "Take-home incomplete. Encouraged to apply to the Professional Diploma instead.",
    decided: true,
    createdDaysAgo: 33,
    events: [{ type: "STATUS", body: "Not admitted this cycle; referred to the diploma.", actorKey: "staff" }],
  },
  {
    programSlug: "foundations-of-ai-and-data",
    applicantKey: "noor",
    firstName: "Noor Fatima",
    lastName: "Baig",
    email: "noor.baig@example.com",
    phone: "+92 311 5550109",
    country: "Pakistan",
    city: "Quetta",
    education: "BS Statistics, University of Balochistan (2025)",
    experience: "Fresh graduate; internship with a provincial statistics bureau.",
    statement: statement("Balochistan has almost no AI practitioners and I intend to be one of the first"),
    status: "ACCEPTED",
    score: 76,
    reviewerKey: "staff",
    decided: true,
    createdDaysAgo: 40,
    events: [{ type: "STATUS", body: "Accepted with a need-based award.", actorKey: "staff" }],
  },
  {
    programSlug: "executive-ai-strategy",
    firstName: "Mehwish",
    lastName: "Qadir",
    email: "mehwish.qadir@gov.example",
    phone: "+92 300 5550110",
    country: "Pakistan",
    city: "Islamabad",
    education: "MPA, Harvard Kennedy School (2015)",
    experience: "Joint Secretary in a federal ministry.",
    statement: statement("my ministry is drafting AI procurement rules and I want them to be grounded in how the technology actually behaves"),
    status: "SUBMITTED",
    createdDaysAgo: 1,
    events: [],
  },
];

export type SeedConversation = {
  userKey: string;
  title: string;
  mode: "tutor" | "lab";
  courseSlug?: string;
  lessonIndex?: number;
  daysAgo: number;
  messages: { role: MessageRole; content: string }[];
};

export const conversations: SeedConversation[] = [
  {
    userKey: "ali",
    title: "Why does my gradient descent diverge?",
    mode: "tutor",
    courseSlug: "foundations-of-machine-learning",
    lessonIndex: 4,
    daysAgo: 2,
    messages: [
      { role: "USER", content: "My loss goes to infinity after a few steps in the gradient descent lab. I'm using lr=0.5. What's wrong?" },
      {
        role: "ASSISTANT",
        content:
          "Before I point at anything: what happens to the loss on the very first few steps — does it decrease at all, or does it grow immediately?\n\nHere is a way to think about it. Each step moves the parameters by `lr × gradient`. If that step is larger than the distance to the minimum, you overshoot to the other side, and with a large learning rate each overshoot is bigger than the last. That is exactly the runaway you are describing.\n\nTry this experiment rather than taking my word for it: keep everything the same and run with `lr=0.05`, then `lr=0.01`. Plot the loss for each. What pattern do you see, and which learning rate would you choose from those plots?",
      },
      { role: "USER", content: "With 0.05 it converges in about 200 steps. With 0.01 it's slower but smooth. So the rule is smaller is safer?" },
      {
        role: "ASSISTANT",
        content:
          "Smaller is *safer*, not *better* — you have just seen the trade-off: 0.01 was stable but needed more steps. In the lecture Dr. Rehman calls the learning rate the first hyperparameter you will ever tune, for exactly this reason.\n\nOne more thing worth noticing: your features are on the scale 0–4, so the gradients are modest. If the inputs were in the thousands, even 0.05 would diverge. That is why standardising features (the z-score lab in *Python for AI Engineers*) matters before optimisation.\n\nGo back to the lab and see whether your tests pass with 0.05 and 2,000 steps. If the second (noisy) test fails, tell me the values of w and b you get and we will look at why.",
      },
    ],
  },
  {
    userKey: "daniyal",
    title: "Chunking strategy for policy documents",
    mode: "tutor",
    courseSlug: "llm-engineering-and-evaluation",
    lessonIndex: 3,
    daysAgo: 5,
    messages: [
      { role: "USER", content: "Our bank's policy documents have numbered clauses. Should I chunk by fixed token windows or by clause?" },
      {
        role: "ASSISTANT",
        content:
          "Chunk by clause, and keep the clause number and section heading as metadata on every chunk. Fixed windows will split a clause across two chunks and a retrieval query about that clause will then match half of it.\n\nTwo refinements from the lecture: add a small overlap (the previous clause’s last sentence) so cross-references survive, and cap very long clauses at a sensible token limit with a continuation marker.\n\nThen measure: build twenty questions whose source clause you know, and compute recall@5 for both strategies. Which one you *expect* to win matters less than the number.",
      },
    ],
  },
];

export const settings: Record<string, unknown> = {
  "site.banner": { enabled: true, text: "Applications for the September Professional Diploma cohort close 18 July.", href: "/apply" },
  "admissions.intakes": { diploma: "September 2026", llm: "October 2026", executive: "Quarterly", foundations: "Rolling", "short courses": "Monthly" },
  "platform.ai": { tutorEnabled: true, labHintsEnabled: true, dailyMessageCap: 200 },
  "academy.promotion": { active: true, percentOff: 50, label: "50% off all programs" },
};
