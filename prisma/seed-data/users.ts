import type { Role } from "../../src/generated/prisma/enums";

export type SeedUser = {
  key: string;
  email: string;
  name: string;
  role: Role;
  headline?: string;
  bio?: string;
  timezone?: string;
  createdDaysAgo?: number;
  lastLoginDaysAgo?: number;
};

export const users: SeedUser[] = [
  {
    key: "admin",
    email: "admin@pioai.edu.pk",
    name: "Dr. Sana Malik",
    role: "ADMIN",
    headline: "Registrar and Director of Platform",
    bio: "Runs the institute’s academic operations and the systems that support them.",
    createdDaysAgo: 400,
    lastLoginDaysAgo: 0,
  },
  {
    key: "staff",
    email: "staff@pioai.edu.pk",
    name: "Hamza Qureshi",
    role: "STAFF",
    headline: "Head of Admissions and Partnerships",
    bio: "Leads admissions, enterprise partnerships and the institute’s outreach programme.",
    createdDaysAgo: 380,
    lastLoginDaysAgo: 1,
  },
  // Instructor accounts are named for the track they teach rather than for an
  // individual, so the public catalog attributes each course to the institute's
  // teaching faculty. Rename these when the real faculty roster is published.
  {
    key: "ayesha",
    email: "instructor@pioai.edu.pk",
    name: "PIOAI Faculty · Machine Learning",
    role: "INSTRUCTOR",
    headline: "Machine Learning teaching faculty",
    bio: "The institute’s machine learning faculty build curricula that take engineers from first principles to production.",
    createdDaysAgo: 420,
    lastLoginDaysAgo: 0,
  },
  {
    key: "bilal",
    email: "language.faculty@pioai.edu.pk",
    name: "PIOAI Faculty · Language & Reasoning",
    role: "INSTRUCTOR",
    headline: "Language & Reasoning teaching faculty",
    bio: "The institute’s language faculty teach evaluation, retrieval and the reasoning behaviour of large language models, with a focus on Urdu and low-resource languages.",
    createdDaysAgo: 410,
    lastLoginDaysAgo: 2,
  },
  {
    key: "zara",
    email: "vision.faculty@pioai.edu.pk",
    name: "PIOAI Faculty · Computer Vision",
    role: "INSTRUCTOR",
    headline: "Computer Vision teaching faculty",
    bio: "The institute’s vision faculty teach systems for agriculture and infrastructure inspection that run on low-cost hardware.",
    createdDaysAgo: 300,
    lastLoginDaysAgo: 4,
  },
  {
    key: "usman",
    email: "engineering.faculty@pioai.edu.pk",
    name: "PIOAI Faculty · AI Engineering",
    role: "INSTRUCTOR",
    headline: "AI Engineering teaching faculty",
    bio: "The institute’s engineering faculty teach the craft behind every model that reaches users, drawn from years of shipping data platforms.",
    createdDaysAgo: 260,
    lastLoginDaysAgo: 1,
  },
  {
    key: "fatima",
    email: "safety.faculty@pioai.edu.pk",
    name: "PIOAI Faculty · Safety & Governance",
    role: "INSTRUCTOR",
    headline: "Safety, Alignment & Governance teaching faculty",
    bio: "The institute’s safety faculty teach evaluation, red-teaming and policy for AI systems deployed in the public sector.",
    createdDaysAgo: 330,
    lastLoginDaysAgo: 3,
  },
  {
    key: "omar",
    email: "systems.faculty@pioai.edu.pk",
    name: "PIOAI Faculty · Systems & MLOps",
    role: "INSTRUCTOR",
    headline: "Systems & MLOps teaching faculty",
    bio: "The institute’s systems faculty teach efficient training and serving of large models on constrained hardware.",
    createdDaysAgo: 350,
    lastLoginDaysAgo: 6,
  },
  {
    key: "mahnoor",
    email: "marketing.faculty@pioai.edu.pk",
    name: "PIOAI Faculty · Digital Marketing",
    role: "INSTRUCTOR",
    headline: "Digital Marketing & Growth teaching faculty",
    bio: "The institute’s marketing faculty teach performance marketing, content strategy and analytics the way they practised it for e-commerce and fintech brands.",
    createdDaysAgo: 150,
    lastLoginDaysAgo: 1,
  },

  // Students
  { key: "ali", email: "student@pioai.edu.pk", name: "Ali Hassan", role: "STUDENT", headline: "Software engineer · Lahore", createdDaysAgo: 95, lastLoginDaysAgo: 0 },
  { key: "maryam", email: "maryam.khan@example.com", name: "Maryam Khan", role: "STUDENT", headline: "Data analyst · Karachi", createdDaysAgo: 80, lastLoginDaysAgo: 1 },
  { key: "hassan", email: "hassan.raza@example.com", name: "Hassan Raza", role: "STUDENT", headline: "Final-year CS student · Islamabad", createdDaysAgo: 70, lastLoginDaysAgo: 2 },
  { key: "zainab", email: "zainab.iqbal@example.com", name: "Zainab Iqbal", role: "STUDENT", headline: "Product manager · Lahore", createdDaysAgo: 60, lastLoginDaysAgo: 5 },
  { key: "ahmed", email: "ahmed.shah@example.com", name: "Ahmed Shah", role: "STUDENT", headline: "Backend developer · Peshawar", createdDaysAgo: 45, lastLoginDaysAgo: 9 },
  { key: "noor", email: "noor.baig@example.com", name: "Noor Fatima Baig", role: "STUDENT", headline: "Statistics graduate · Quetta", createdDaysAgo: 30, lastLoginDaysAgo: 1 },

  // Enterprise learners and managers
  {
    key: "kamran",
    email: "enterprise@nexus-bank.example",
    name: "Kamran Baig",
    role: "STUDENT",
    headline: "Head of Data Platforms · Nexus Bank",
    bio: "Sponsors the Nexus Bank AI upskilling cohort.",
    createdDaysAgo: 75,
    lastLoginDaysAgo: 1,
  },
  { key: "daniyal", email: "daniyal.mirza@nexus-bank.example", name: "Daniyal Mirza", role: "STUDENT", headline: "Data engineer · Nexus Bank", createdDaysAgo: 70, lastLoginDaysAgo: 2 },
  { key: "hira", email: "hira.yousaf@nexus-bank.example", name: "Hira Yousaf", role: "STUDENT", headline: "Risk analyst · Nexus Bank", createdDaysAgo: 70, lastLoginDaysAgo: 3 },
  { key: "sara", email: "sara.jamal@kpl.example", name: "Sara Jamal", role: "STUDENT", headline: "Learning & Development · Karachi Port Logistics", createdDaysAgo: 40, lastLoginDaysAgo: 4 },
  { key: "bilquis", email: "bilquis.ahmad@kpl.example", name: "Bilquis Ahmad", role: "STUDENT", headline: "Operations analyst · Karachi Port Logistics", createdDaysAgo: 38, lastLoginDaysAgo: 6 },
];
