import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "recruiter",
  "college",
  "admin",
]);

export const interviewStatusEnum = pgEnum("interview_status", [
  "pending",
  "in_progress",
  "completed",
  "abandoned",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "technical",
  "behavioral",
  "scenario",
]);

// ─────────────────────────────────────────────
// BETTER-AUTH REQUIRED TABLES
// ─────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: userRoleEnum("role").notNull().default("student"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  phone: varchar("phone", { length: 20 }),
  location: varchar("location", { length: 100 }),
  // Education
  collegeName: varchar("college_name", { length: 200 }),
  degree: varchar("degree", { length: 100 }),
  branch: varchar("branch", { length: 100 }),
  graduationYear: integer("graduation_year"),
  cgpa: real("cgpa"),
  // Career
  careerGoal: text("career_goal"),
  experienceYears: integer("experience_years").default(0),
  // Profile completion (0-100)
  completionScore: integer("completion_score").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// SKILLS
// ─────────────────────────────────────────────

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(), // e.g. "frontend", "backend", "devops", "soft"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSkills = pgTable("user_skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  proficiencyLevel: integer("proficiency_level").notNull().default(1), // 1-5
  source: varchar("source", { length: 20 }).default("manual"), // "manual" | "resume"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// RESUME
// ─────────────────────────────────────────────

export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(), // UploadThing URL
  fileKey: text("file_key").notNull(), // UploadThing key for deletion
  isActive: boolean("is_active").notNull().default(true),
  // AI Parsed Data
  parsedText: text("parsed_text"), // raw extracted text
  extractedSkills: jsonb("extracted_skills").$type<string[]>(), // skill names from resume
  extractedExperience: jsonb("extracted_experience").$type<
    {
      company: string;
      role: string;
      duration: string;
      description: string;
    }[]
  >(),
  extractedProjects: jsonb("extracted_projects").$type<
    {
      name: string;
      description: string;
      techStack: string[];
    }[]
  >(),
  extractedEducation: jsonb("extracted_education").$type<
    {
      institution: string;
      degree: string;
      year: string;
    }[]
  >(),
  atsScore: integer("ats_score"), // 0-100
  analysisSummary: text("analysis_summary"), // AI generated summary
  analysisStatus: varchar("analysis_status", { length: 20 }).default("pending"), // "pending" | "processing" | "done" | "failed"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// SKILL GAP ANALYSIS
// ─────────────────────────────────────────────

export const skillGapReports = pgTable("skill_gap_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resumeId: uuid("resume_id").references(() => resumes.id, {
    onDelete: "set null",
  }),
  targetRoleId: uuid("target_role_id").references(() => roles.id, {
    onDelete: "set null",
  }),
  // Gap analysis
  presentSkills: jsonb("present_skills").$type<string[]>(),
  missingSkills: jsonb("missing_skills").$type<string[]>(),
  strongSkills: jsonb("strong_skills").$type<string[]>(),
  readinessScore: integer("readiness_score"), // 0-100
  // AI generated learning path
  learningPath: jsonb("learning_path").$type<
    {
      skill: string;
      priority: "high" | "medium" | "low";
      estimatedWeeks: number;
      reason: string;
    }[]
  >(),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// COMPANIES & ROLES (Seed Data)
// ─────────────────────────────────────────────

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull().unique(),
  logo: text("logo"), // URL
  industry: varchar("industry", { length: 100 }),
  description: text("description"),
  size: varchar("size", { length: 50 }), // "startup" | "mid" | "large" | "mnc"
  website: text("website"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  description: text("description"),
  salaryMin: integer("salary_min"), // in LPA (lakhs per annum)
  salaryMax: integer("salary_max"),
  experienceRequired: integer("experience_required").default(0), // years
  requiredSkills: jsonb("required_skills").$type<string[]>(), // skill names
  niceToHaveSkills: jsonb("nice_to_have_skills").$type<string[]>(),
  isGeneric: boolean("is_generic").notNull().default(false), // true = not tied to specific company
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// USER INTERESTS
// ─────────────────────────────────────────────

export const userCompanyInterests = pgTable("user_company_interests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  fitScore: integer("fit_score"), // 0-100, calculated
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userRoleInterests = pgTable("user_role_interests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  fitScore: integer("fit_score"), // 0-100, calculated
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// COURSES (Seed Data)
// ─────────────────────────────────────────────

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 300 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(), // "Udemy", "Coursera", "YouTube", etc.
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  description: text("description"),
  durationHours: integer("duration_hours"),
  isFree: boolean("is_free").notNull().default(false),
  rating: real("rating"), // 0-5
  skillsCovered: jsonb("skills_covered").$type<string[]>(),
  difficulty: difficultyEnum("difficulty").notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// MOCK INTERVIEW
// ─────────────────────────────────────────────

export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").references(() => roles.id, { onDelete: "set null" }),
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  difficulty: difficultyEnum("difficulty").notNull().default("medium"),
  status: interviewStatusEnum("status").notNull().default("pending"),
  // Scoring
  overallScore: integer("overall_score"), // 0-100
  technicalScore: integer("technical_score"),
  behavioralScore: integer("behavioral_score"),
  communicationScore: integer("communication_score"),
  aiFeedbackSummary: text("ai_feedback_summary"),
  totalQuestions: integer("total_questions").default(0),
  answeredQuestions: integer("answered_questions").default(0),
  durationMinutes: integer("duration_minutes"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => interviewSessions.id, { onDelete: "cascade" }),
  questionNumber: integer("question_number").notNull(),
  questionText: text("question_text").notNull(),
  questionType: questionTypeEnum("question_type").notNull().default("technical"),
  expectedKeyPoints: jsonb("expected_key_points").$type<string[]>(), // what a good answer covers
  // User response
  userAnswer: text("user_answer"),
  answerScore: integer("answer_score"), // 0-100
  aiFeedback: text("ai_feedback"), // per-question feedback
  answeredAt: timestamp("answered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  sessions: many(sessions),
  accounts: many(accounts),
  userSkills: many(userSkills),
  resumes: many(resumes),
  skillGapReports: many(skillGapReports),
  companyInterests: many(userCompanyInterests),
  roleInterests: many(userRoleInterests),
  interviewSessions: many(interviewSessions),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, { fields: [resumes.userId], references: [users.id] }),
  skillGapReports: many(skillGapReports),
}));

export const skillGapReportsRelations = relations(
  skillGapReports,
  ({ one }) => ({
    user: one(users, {
      fields: [skillGapReports.userId],
      references: [users.id],
    }),
    resume: one(resumes, {
      fields: [skillGapReports.resumeId],
      references: [resumes.id],
    }),
    targetRole: one(roles, {
      fields: [skillGapReports.targetRoleId],
      references: [roles.id],
    }),
  }),
);

export const companiesRelations = relations(companies, ({ many }) => ({
  roles: many(roles),
  userInterests: many(userCompanyInterests),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  company: one(companies, {
    fields: [roles.companyId],
    references: [companies.id],
  }),
  userInterests: many(userRoleInterests),
  skillGapReports: many(skillGapReports),
  interviewSessions: many(interviewSessions),
}));

export const userCompanyInterestsRelations = relations(
  userCompanyInterests,
  ({ one }) => ({
    user: one(users, {
      fields: [userCompanyInterests.userId],
      references: [users.id],
    }),
    company: one(companies, {
      fields: [userCompanyInterests.companyId],
      references: [companies.id],
    }),
  }),
);

export const userRoleInterestsRelations = relations(
  userRoleInterests,
  ({ one }) => ({
    user: one(users, {
      fields: [userRoleInterests.userId],
      references: [users.id],
    }),
    role: one(roles, {
      fields: [userRoleInterests.roleId],
      references: [roles.id],
    }),
  }),
);

export const interviewSessionsRelations = relations(
  interviewSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [interviewSessions.userId],
      references: [users.id],
    }),
    role: one(roles, {
      fields: [interviewSessions.roleId],
      references: [roles.id],
    }),
    company: one(companies, {
      fields: [interviewSessions.companyId],
      references: [companies.id],
    }),
    questions: many(interviewQuestions),
  }),
);

export const interviewQuestionsRelations = relations(
  interviewQuestions,
  ({ one }) => ({
    session: one(interviewSessions, {
      fields: [interviewQuestions.sessionId],
      references: [interviewSessions.id],
    }),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));