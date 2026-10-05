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
  {
    key: "ayesha",
    email: "instructor@pioai.edu.pk",
    name: "Dr. Ayesha Rehman",
    role: "INSTRUCTOR",
    headline: "Professor of Machine Learning · Dean of the Academy",
    bio: "Ayesha builds curricula that take engineers from first principles to production. Her research spans probabilistic modelling and AI for public health.",
    createdDaysAgo: 420,
    lastLoginDaysAgo: 0,
  },
  {
    key: "bilal",
    email: "bilal.ahmed@pioai.edu.pk",
    name: "Dr. Bilal Ahmed",
    role: "INSTRUCTOR",
    headline: "Associate Professor · Language & Reasoning",
    bio: "Bilal works on evaluation, retrieval and the reasoning behaviour of large language models, with a focus on Urdu and low-resource languages.",
    createdDaysAgo: 410,
    lastLoginDaysAgo: 2,
  },
  {
    key: "zara",
    email: "zara.siddiqui@pioai.edu.pk",
    name: "Dr. Zara Siddiqui",
    role: "INSTRUCTOR",
    headline: "Assistant Professor · Perception & Robotics",
    bio: "Zara’s lab builds vision systems for agriculture and infrastructure inspection, and teaches the institute’s computer vision track.",
    createdDaysAgo: 300,
    lastLoginDaysAgo: 4,
  },
  {
    key: "usman",
    email: "usman.tariq@pioai.edu.pk",
    name: "Usman Tariq",
    role: "INSTRUCTOR",
    headline: "Professor of Practice · AI Engineering",
    bio: "Fifteen years shipping data platforms in fintech and telecoms. Usman teaches the engineering craft behind every model that reaches users.",
    createdDaysAgo: 260,
    lastLoginDaysAgo: 1,
  },
  {
    key: "fatima",
    email: "fatima.noor@pioai.edu.pk",
    name: "Dr. Fatima Noor",
    role: "INSTRUCTOR",
    headline: "Research Lead · Safety, Alignment & Governance",
    bio: "Fatima leads the institute’s work on evaluation, red-teaming and policy for AI systems deployed in the public sector.",
    createdDaysAgo: 330,
    lastLoginDaysAgo: 3,
  },
  {
    key: "omar",
    email: "omar.farooq@pioai.edu.pk",
    name: "Dr. Omar Farooq",
    role: "INSTRUCTOR",
    headline: "Associate Professor · Systems & Optimisation",
    bio: "Omar researches efficient training and serving of large models on constrained hardware and teaches MLOps.",
    createdDaysAgo: 350,
    lastLoginDaysAgo: 6,
  },
  {
    key: "mahnoor",
    email: "mahnoor.qazi@pioai.edu.pk",
    name: "Mahnoor Qazi",
    role: "INSTRUCTOR",
    headline: "Lecturer · Digital Marketing & Growth",
    bio: "Mahnoor ran performance marketing for e-commerce and fintech brands across Pakistan and the Gulf before joining the institute to lead the short-course track in digital media marketing.",
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
