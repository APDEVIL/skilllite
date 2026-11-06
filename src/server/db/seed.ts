/**
 * Seed Script — Synthetic Data
 * Run with: bun run db:seed
 */

import { config } from "dotenv";
config({ path: ".env" }); // ← must be before any imports that use env

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false }, // ← required for Neon cloud
});
const db = drizzle(pool, { schema });

// ─────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────

const skillsData = [
  // Frontend
  { name: "React", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "JavaScript", category: "frontend" },
  { name: "HTML/CSS", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "Vue.js", category: "frontend" },
  { name: "Angular", category: "frontend" },
  // Backend
  { name: "Node.js", category: "backend" },
  { name: "Python", category: "backend" },
  { name: "Java", category: "backend" },
  { name: "Go", category: "backend" },
  { name: "Express.js", category: "backend" },
  { name: "FastAPI", category: "backend" },
  { name: "Django", category: "backend" },
  { name: "Spring Boot", category: "backend" },
  { name: "REST APIs", category: "backend" },
  { name: "GraphQL", category: "backend" },
  // Database
  { name: "PostgreSQL", category: "database" },
  { name: "MySQL", category: "database" },
  { name: "MongoDB", category: "database" },
  { name: "Redis", category: "database" },
  { name: "Prisma", category: "database" },
  { name: "Drizzle ORM", category: "database" },
  // DevOps & Cloud
  { name: "Docker", category: "devops" },
  { name: "Kubernetes", category: "devops" },
  { name: "AWS", category: "devops" },
  { name: "GCP", category: "devops" },
  { name: "Azure", category: "devops" },
  { name: "CI/CD", category: "devops" },
  { name: "Linux", category: "devops" },
  { name: "Terraform", category: "devops" },
  // AI/ML
  { name: "Machine Learning", category: "ai_ml" },
  { name: "Deep Learning", category: "ai_ml" },
  { name: "TensorFlow", category: "ai_ml" },
  { name: "PyTorch", category: "ai_ml" },
  { name: "Data Analysis", category: "ai_ml" },
  { name: "LLM Integration", category: "ai_ml" },
  // DSA & CS Fundamentals
  { name: "Data Structures", category: "cs_fundamentals" },
  { name: "Algorithms", category: "cs_fundamentals" },
  { name: "System Design", category: "cs_fundamentals" },
  { name: "OOP", category: "cs_fundamentals" },
  // Soft Skills
  { name: "Communication", category: "soft" },
  { name: "Problem Solving", category: "soft" },
  { name: "Teamwork", category: "soft" },
  { name: "Leadership", category: "soft" },
  { name: "Time Management", category: "soft" },
];

// ─────────────────────────────────────────────
// COMPANIES
// ─────────────────────────────────────────────

const companiesData = [
  {
    name: "Google",
    industry: "Technology",
    description:
      "Global technology leader in search, cloud, and AI products.",
    size: "mnc",
    website: "https://google.com",
    logo: "https://logo.clearbit.com/google.com",
  },
  {
    name: "Microsoft",
    industry: "Technology",
    description:
      "Enterprise software, cloud (Azure), and productivity solutions.",
    size: "mnc",
    website: "https://microsoft.com",
    logo: "https://logo.clearbit.com/microsoft.com",
  },
  {
    name: "Amazon",
    industry: "E-Commerce & Cloud",
    description: "E-commerce giant and AWS cloud services leader.",
    size: "mnc",
    website: "https://amazon.com",
    logo: "https://logo.clearbit.com/amazon.com",
  },
  {
    name: "Flipkart",
    industry: "E-Commerce",
    description: "India's leading e-commerce marketplace.",
    size: "large",
    website: "https://flipkart.com",
    logo: "https://logo.clearbit.com/flipkart.com",
  },
  {
    name: "Infosys",
    industry: "IT Services",
    description: "Global IT consulting and services company.",
    size: "mnc",
    website: "https://infosys.com",
    logo: "https://logo.clearbit.com/infosys.com",
  },
  {
    name: "Tata Consultancy Services",
    industry: "IT Services",
    description: "India's largest IT services multinational.",
    size: "mnc",
    website: "https://tcs.com",
    logo: "https://logo.clearbit.com/tcs.com",
  },
  {
    name: "Razorpay",
    industry: "Fintech",
    description: "India's leading full-stack payments solution.",
    size: "large",
    website: "https://razorpay.com",
    logo: "https://logo.clearbit.com/razorpay.com",
  },
  {
    name: "Zepto",
    industry: "Quick Commerce",
    description: "10-minute grocery delivery startup.",
    size: "mid",
    website: "https://zeptonow.com",
    logo: "https://logo.clearbit.com/zeptonow.com",
  },
  {
    name: "PhonePe",
    industry: "Fintech",
    description: "Digital payments platform built on UPI.",
    size: "large",
    website: "https://phonepe.com",
    logo: "https://logo.clearbit.com/phonepe.com",
  },
  {
    name: "Swiggy",
    industry: "Food Tech",
    description: "On-demand food delivery and quick commerce.",
    size: "large",
    website: "https://swiggy.com",
    logo: "https://logo.clearbit.com/swiggy.com",
  },
];

// ─────────────────────────────────────────────
// ROLES (Generic — not tied to company)
// ─────────────────────────────────────────────

const genericRolesData = [
  {
    title: "Frontend Developer",
    description: "Build responsive, performant user interfaces.",
    salaryMin: 6,
    salaryMax: 25,
    experienceRequired: 0,
    requiredSkills: [
      "React",
      "TypeScript",
      "JavaScript",
      "HTML/CSS",
      "REST APIs",
    ],
    niceToHaveSkills: ["Next.js", "Tailwind CSS", "GraphQL"],
    isGeneric: true,
  },
  {
    title: "Backend Developer",
    description: "Design and build scalable server-side applications.",
    salaryMin: 6,
    salaryMax: 30,
    experienceRequired: 0,
    requiredSkills: [
      "Node.js",
      "PostgreSQL",
      "REST APIs",
      "Data Structures",
      "Algorithms",
    ],
    niceToHaveSkills: ["Docker", "Redis", "System Design"],
    isGeneric: true,
  },
  {
    title: "Full Stack Developer",
    description: "End-to-end development across frontend and backend.",
    salaryMin: 8,
    salaryMax: 35,
    experienceRequired: 1,
    requiredSkills: [
      "React",
      "Node.js",
      "PostgreSQL",
      "TypeScript",
      "REST APIs",
    ],
    niceToHaveSkills: ["Docker", "AWS", "System Design", "GraphQL"],
    isGeneric: true,
  },
  {
    title: "DevOps Engineer",
    description: "Manage infrastructure, CI/CD, and cloud deployments.",
    salaryMin: 8,
    salaryMax: 32,
    experienceRequired: 1,
    requiredSkills: ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD"],
    niceToHaveSkills: ["Terraform", "GCP", "Python"],
    isGeneric: true,
  },
  {
    title: "Data Engineer",
    description: "Build and maintain data pipelines and warehouses.",
    salaryMin: 8,
    salaryMax: 30,
    experienceRequired: 1,
    requiredSkills: ["Python", "PostgreSQL", "Data Analysis", "SQL"],
    niceToHaveSkills: ["AWS", "Spark", "Airflow"],
    isGeneric: true,
  },
  {
    title: "Machine Learning Engineer",
    description: "Build and deploy ML models at scale.",
    salaryMin: 10,
    salaryMax: 40,
    experienceRequired: 1,
    requiredSkills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Data Analysis",
      "Algorithms",
    ],
    niceToHaveSkills: ["TensorFlow", "PyTorch", "AWS", "LLM Integration"],
    isGeneric: true,
  },
  {
    title: "Software Development Engineer (SDE-1)",
    description: "Entry-level software engineering role at product companies.",
    salaryMin: 12,
    salaryMax: 45,
    experienceRequired: 0,
    requiredSkills: [
      "Data Structures",
      "Algorithms",
      "OOP",
      "System Design",
      "Problem Solving",
    ],
    niceToHaveSkills: ["Java", "Python", "Go"],
    isGeneric: true,
  },
  {
    title: "React Native Developer",
    description: "Build cross-platform mobile applications.",
    salaryMin: 6,
    salaryMax: 24,
    experienceRequired: 0,
    requiredSkills: ["React", "JavaScript", "TypeScript", "REST APIs"],
    niceToHaveSkills: ["Node.js", "Redux"],
    isGeneric: true,
  },
];

// ─────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────

const coursesData = [
  {
    title: "The Complete JavaScript Course 2024",
    provider: "Udemy",
    url: "https://www.udemy.com/course/the-complete-javascript-course/",
    description:
      "From zero to expert — the most complete JS course on the market.",
    durationHours: 69,
    isFree: false,
    rating: 4.7,
    skillsCovered: ["JavaScript", "OOP"],
    difficulty: "easy" as const,
  },
  {
    title: "React — The Complete Guide",
    provider: "Udemy",
    url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
    description: "Dive in and learn React from scratch.",
    durationHours: 68,
    isFree: false,
    rating: 4.8,
    skillsCovered: ["React", "TypeScript", "JavaScript"],
    difficulty: "medium" as const,
  },
  {
    title: "Next.js 14 & React — The Complete Guide",
    provider: "Udemy",
    url: "https://www.udemy.com/course/nextjs-react-the-complete-guide/",
    description: "The ultimate guide to building full-stack React apps.",
    durationHours: 37,
    isFree: false,
    rating: 4.7,
    skillsCovered: ["Next.js", "React", "TypeScript"],
    difficulty: "medium" as const,
  },
  {
    title: "Node.js — The Complete Bootcamp",
    provider: "Udemy",
    url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/",
    description: "Master Node, Express, MongoDB and more.",
    durationHours: 42,
    isFree: false,
    rating: 4.8,
    skillsCovered: ["Node.js", "Express.js", "MongoDB", "REST APIs"],
    difficulty: "medium" as const,
  },
  {
    title: "Python for Everybody Specialization",
    provider: "Coursera",
    url: "https://www.coursera.org/specializations/python",
    description: "Learn to program and analyze data with Python.",
    durationHours: 80,
    isFree: false,
    rating: 4.8,
    skillsCovered: ["Python", "Data Analysis"],
    difficulty: "easy" as const,
  },
  {
    title: "Docker & Kubernetes: The Practical Guide",
    provider: "Udemy",
    url: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/",
    description: "Learn Docker and Kubernetes from scratch.",
    durationHours: 23,
    isFree: false,
    rating: 4.7,
    skillsCovered: ["Docker", "Kubernetes"],
    difficulty: "medium" as const,
  },
  {
    title: "AWS Certified Developer Associate",
    provider: "Udemy",
    url: "https://www.udemy.com/course/aws-certified-developer-associate-dva-c01/",
    description: "Complete prep for the AWS Developer exam.",
    durationHours: 32,
    isFree: false,
    rating: 4.7,
    skillsCovered: ["AWS", "CI/CD", "Cloud"],
    difficulty: "hard" as const,
  },
  {
    title: "Machine Learning Specialization",
    provider: "Coursera",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    description: "Andrew Ng's legendary ML course updated for 2024.",
    durationHours: 100,
    isFree: false,
    rating: 4.9,
    skillsCovered: ["Machine Learning", "Python", "Data Analysis"],
    difficulty: "medium" as const,
  },
  {
    title: "CS50's Introduction to Computer Science",
    provider: "edX",
    url: "https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science",
    description: "Harvard's legendary intro CS course — free audit.",
    durationHours: 100,
    isFree: true,
    rating: 4.9,
    skillsCovered: ["Algorithms", "Data Structures", "OOP", "Problem Solving"],
    difficulty: "medium" as const,
  },
  {
    title: "System Design for Interviews and Beyond",
    provider: "Udemy",
    url: "https://www.udemy.com/course/system-design-interview-prep/",
    description: "Learn system design concepts used in FAANG interviews.",
    durationHours: 18,
    isFree: false,
    rating: 4.6,
    skillsCovered: ["System Design", "Redis", "PostgreSQL"],
    difficulty: "hard" as const,
  },
  {
    title: "DSA — LeetCode Masterclass",
    provider: "YouTube",
    url: "https://www.youtube.com/playlist?list=PLot-Xpze53ldVwtstag2TL4HQhAnC8ATf",
    description: "Free comprehensive DSA playlist by NeetCode.",
    durationHours: 40,
    isFree: true,
    rating: 4.9,
    skillsCovered: ["Data Structures", "Algorithms", "Problem Solving"],
    difficulty: "medium" as const,
  },
  {
    title: "TypeScript Full Course for Beginners",
    provider: "YouTube",
    url: "https://www.youtube.com/watch?v=30LWjhZzg50",
    description:
      "Complete TypeScript tutorial free on YouTube by Dave Gray.",
    durationHours: 8,
    isFree: true,
    rating: 4.8,
    skillsCovered: ["TypeScript", "JavaScript"],
    difficulty: "easy" as const,
  },
  {
    title: "PostgreSQL for Beginners",
    provider: "YouTube",
    url: "https://www.youtube.com/watch?v=qw--VYLpxG4",
    description: "Learn PostgreSQL from scratch — free tutorial.",
    durationHours: 5,
    isFree: true,
    rating: 4.6,
    skillsCovered: ["PostgreSQL"],
    difficulty: "easy" as const,
  },
  {
    title: "LLM Engineering: Master AI & Large Language Models",
    provider: "Udemy",
    url: "https://www.udemy.com/course/llm-engineering-master-ai-and-large-language-models/",
    description: "Build real LLM apps with OpenAI, HuggingFace and more.",
    durationHours: 28,
    isFree: false,
    rating: 4.7,
    skillsCovered: ["LLM Integration", "Python", "Machine Learning"],
    difficulty: "hard" as const,
  },
  {
    title: "Tailwind CSS Full Course",
    provider: "YouTube",
    url: "https://www.youtube.com/watch?v=lCxcTsOHrjo",
    description: "Complete Tailwind CSS tutorial — free on YouTube.",
    durationHours: 4,
    isFree: true,
    rating: 4.7,
    skillsCovered: ["Tailwind CSS", "HTML/CSS"],
    difficulty: "easy" as const,
  },
];

// ─────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting seed...");

  // 1. Skills
  console.log("  → Seeding skills...");
  for (const skill of skillsData) {
    await db
      .insert(schema.skills)
      .values({ name: skill.name, category: skill.category })
      .onConflictDoNothing();
  }

  // 2. Companies
  console.log("  → Seeding companies...");
  const insertedCompanies: Record<string, string> = {};
  for (const company of companiesData) {
    const [inserted] = await db
      .insert(schema.companies)
      .values(company)
      .onConflictDoNothing()
      .returning({ id: schema.companies.id, name: schema.companies.name });
    if (inserted) {
      insertedCompanies[inserted.name] = inserted.id;
    }
  }

  // 3. Generic Roles
  console.log("  → Seeding roles...");
  for (const role of genericRolesData) {
    await db
      .insert(schema.roles)
      .values({
        title: role.title,
        description: role.description,
        salaryMin: role.salaryMin,
        salaryMax: role.salaryMax,
        experienceRequired: role.experienceRequired,
        requiredSkills: role.requiredSkills,
        niceToHaveSkills: role.niceToHaveSkills,
        isGeneric: true,
        companyId: null,
      })
      .onConflictDoNothing();
  }

  // 4. Courses
  console.log("  → Seeding courses...");
  for (const course of coursesData) {
    await db
      .insert(schema.courses)
      .values({
        title: course.title,
        provider: course.provider,
        url: course.url,
        description: course.description,
        durationHours: course.durationHours,
        isFree: course.isFree,
        rating: course.rating,
        skillsCovered: course.skillsCovered,
        difficulty: course.difficulty,
      })
      .onConflictDoNothing();
  }

  console.log("✅ Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});