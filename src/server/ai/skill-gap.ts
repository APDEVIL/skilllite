import { generateJSON } from "./gemini";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface SkillGapResult {
  presentSkills: string[];
  missingSkills: string[];
  strongSkills: string[];
  readinessScore: number; // 0-100
  learningPath: {
    skill: string;
    priority: "high" | "medium" | "low";
    estimatedWeeks: number;
    reason: string;
  }[];
  aiSummary: string;
}

// ─────────────────────────────────────────────
// ANALYZER
// ─────────────────────────────────────────────

export async function analyzeSkillGap(
  userSkills: string[],
  requiredSkills: string[],
  niceToHaveSkills: string[],
  roleTitle: string,
): Promise<SkillGapResult> {
  const prompt = `
You are a technical career advisor. Analyze a student's skills vs job role requirements.

ROLE: ${roleTitle}
REQUIRED SKILLS: ${requiredSkills.join(", ")}
NICE TO HAVE SKILLS: ${niceToHaveSkills.join(", ")}
STUDENT'S CURRENT SKILLS: ${userSkills.join(", ")}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "presentSkills": ["skills the student has that match required or nice-to-have"],
  "missingSkills": ["required skills the student is missing"],
  "strongSkills": ["skills student has that are particularly strong for this role"],
  "readinessScore": 72,
  "learningPath": [
    {
      "skill": "Missing Skill Name",
      "priority": "high",
      "estimatedWeeks": 4,
      "reason": "Why this skill is critical for the role"
    }
  ],
  "aiSummary": "2-3 sentence summary of student's readiness for this role"
}

Rules:
- readinessScore: 0-100 based on how many required skills are present and their importance
- priority: "high" for required skills, "medium" for nice-to-have, "low" for optional
- Sort learningPath by priority (high first)
- Be realistic and specific in the reason field
- Return empty arrays if nothing matches
`;

  return generateJSON<SkillGapResult>(prompt);
}

// ─────────────────────────────────────────────
// FIT SCORE (lightweight, no AI call)
// ─────────────────────────────────────────────

/**
 * Fast readiness score without AI — used for bulk company fit scoring.
 * Simple intersection ratio of user skills vs required skills.
 */
export function calculateFitScore(
  userSkills: string[],
  requiredSkills: string[],
  niceToHaveSkills: string[],
): number {
  if (requiredSkills.length === 0) return 0;

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());

  const requiredMatches = requiredSkills.filter((s) =>
    userSkillsLower.includes(s.toLowerCase()),
  ).length;

  const niceMatches = niceToHaveSkills.filter((s) =>
    userSkillsLower.includes(s.toLowerCase()),
  ).length;

  // Required skills = 80% weight, nice-to-have = 20%
  const requiredScore = (requiredMatches / requiredSkills.length) * 80;
  const niceScore =
    niceToHaveSkills.length > 0
      ? (niceMatches / niceToHaveSkills.length) * 20
      : 20;

  return Math.round(requiredScore + niceScore);
}