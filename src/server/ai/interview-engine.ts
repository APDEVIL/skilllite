import { generateJSON, generateText } from "./gemini";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface GeneratedQuestion {
  questionText: string;
  questionType: "technical" | "behavioral" | "scenario";
  expectedKeyPoints: string[]; // MCQ questions encode options+answer here
  isMCQ: boolean;
}

export interface AnswerEvaluation {
  score: number; // 0-100
  aiFeedback: string;
}

// ─────────────────────────────────────────────
// MCQ HELPERS — re-exported from shared lib
// (keeps server imports clean; client components
//  import directly from @/lib/mcq-helpers)
// ─────────────────────────────────────────────

export { encodeMCQ, isMCQQuestion, decodeMCQ } from "@/lib/mcq-helpers";

// ─────────────────────────────────────────────
// QUESTION GENERATOR
// ─────────────────────────────────────────────

interface RawMCQQuestion {
  questionText: string;
  questionType: "technical" | "behavioral" | "scenario";
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

interface RawOpenQuestion {
  questionText: string;
  questionType: "technical" | "behavioral" | "scenario";
  expectedKeyPoints: string[];
}

export async function generateInterviewQuestions(
  roleTitle: string,
  requiredSkills: string[],
  difficulty: "easy" | "medium" | "hard",
  totalQuestions: number = 5,
): Promise<GeneratedQuestion[]> {
  // easy → all MCQ | medium → half MCQ half open | hard → all open
  if (difficulty === "easy") {
    return generateMCQQuestions(roleTitle, requiredSkills, totalQuestions);
  }

  if (difficulty === "hard") {
    return generateOpenQuestions(roleTitle, requiredSkills, totalQuestions);
  }

  // medium: split evenly
  const mcqCount  = Math.ceil(totalQuestions / 2);
  const openCount = totalQuestions - mcqCount;

  const [mcqs, opens] = await Promise.all([
    generateMCQQuestions(roleTitle, requiredSkills, mcqCount),
    generateOpenQuestions(roleTitle, requiredSkills, openCount),
  ]);

  // Interleave: MCQ, Open, MCQ, Open...
  const result: GeneratedQuestion[] = [];
  const maxLen = Math.max(mcqs.length, opens.length);
  for (let i = 0; i < maxLen; i++) {
    if (mcqs[i])  result.push(mcqs[i]!);
    if (opens[i]) result.push(opens[i]!);
  }
  return result.slice(0, totalQuestions);
}

async function generateMCQQuestions(
  roleTitle: string,
  requiredSkills: string[],
  count: number,
): Promise<GeneratedQuestion[]> {
  // local import to avoid circular — helpers are pure so this is fine
  const { encodeMCQ } = await import("@/lib/mcq-helpers");

  const prompt = `
You are a senior technical interviewer generating multiple-choice questions.

ROLE: ${roleTitle}
KEY SKILLS: ${requiredSkills.join(", ")}
DIFFICULTY: Easy (fundamentals and basic concepts only)
COUNT: ${count}

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {
    "questionText": "What does the 'C' in CSS stand for?",
    "questionType": "technical",
    "options": {
      "A": "Cascading",
      "B": "Computer",
      "C": "Colorful",
      "D": "Creative"
    },
    "correctAnswer": "A",
    "explanation": "CSS stands for Cascading Style Sheets. The 'cascading' refers to how styles are applied in order of specificity and inheritance."
  }
]

Rules:
- questionType must be one of: "technical", "behavioral", "scenario"
- All 4 options must be plausible (no obvious throwaway options)
- correctAnswer must be one of: "A", "B", "C", "D"
- explanation: 1-2 sentences explaining why the correct answer is right
- Focus on fundamentals, definitions, and basic concepts relevant to the role
- Generate exactly ${count} questions
`;

  const raw = await generateJSON<RawMCQQuestion[]>(prompt);

  return raw.map((q) => ({
    questionText:      q.questionText,
    questionType:      q.questionType ?? "technical",
    isMCQ:             true,
    expectedKeyPoints: encodeMCQ(q.options, q.correctAnswer, q.explanation),
  }));
}

async function generateOpenQuestions(
  roleTitle: string,
  requiredSkills: string[],
  count: number,
): Promise<GeneratedQuestion[]> {
  const prompt = `
You are a senior technical interviewer at a top tech company.
Generate ${count} interview questions for the role below.

ROLE: ${roleTitle}
KEY SKILLS: ${requiredSkills.join(", ")}
DIFFICULTY: Hard (advanced concepts, edge cases, system design)

Mix of question types:
- technical: coding concepts, system design, framework-specific
- behavioral: past experience, teamwork, conflict resolution
- scenario: "what would you do if..." situational questions

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "questionText": "Full question text here",
    "questionType": "technical",
    "expectedKeyPoints": ["point1", "point2", "point3"]
  }
]

Rules:
- expectedKeyPoints: 3-5 key points a strong answer should cover
- Make questions specific to the role and skills, not generic
- Generate exactly ${count} questions
`;

  const raw = await generateJSON<RawOpenQuestion[]>(prompt);

  return raw.map((q) => ({
    questionText:      q.questionText,
    questionType:      q.questionType ?? "technical",
    isMCQ:             false,
    expectedKeyPoints: q.expectedKeyPoints ?? [],
  }));
}

// ─────────────────────────────────────────────
// ANSWER EVALUATOR
// ─────────────────────────────────────────────

/**
 * For MCQ: scoring is deterministic — no AI call needed.
 * For open questions: use Gemini.
 */
export async function evaluateAnswer(
  questionText: string,
  expectedKeyPoints: string[],
  userAnswer: string,
  roleTitle: string,
): Promise<AnswerEvaluation> {
  const { isMCQQuestion, decodeMCQ } = await import("@/lib/mcq-helpers");

  // ── MCQ fast path ──────────────────────────
  if (isMCQQuestion(expectedKeyPoints)) {
    const { correctLetter, explanation } = decodeMCQ(expectedKeyPoints);
    const correct =
      userAnswer.trim().toUpperCase() === correctLetter.toUpperCase();
    return {
      score:      correct ? 100 : 0,
      aiFeedback: correct
        ? `Correct! ${explanation}`
        : `Incorrect. The correct answer is ${correctLetter}. ${explanation}`,
    };
  }

  // ── Open question — Gemini evaluation ─────
  const prompt = `
You are a technical interviewer evaluating a candidate's answer.

ROLE: ${roleTitle}
QUESTION: ${questionText}
EXPECTED KEY POINTS: ${expectedKeyPoints.join(", ")}
CANDIDATE'S ANSWER: ${userAnswer}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "score": 75,
  "aiFeedback": "Specific, constructive feedback in 2-3 sentences covering what was good and what was missing"
}

Rules:
- score: 0-100 based on how many key points were addressed and answer quality
- score 0-40: poor answer, missed most key points
- score 41-70: average answer, covered some key points
- score 71-90: good answer, covered most key points well
- score 91-100: excellent answer, comprehensive and well-articulated
- aiFeedback: be specific, mention which key points were hit or missed
- If answer is empty or "I don't know", score is 0-10 with encouragement
`;

  return generateJSON<AnswerEvaluation>(prompt);
}

// ─────────────────────────────────────────────
// SESSION FEEDBACK GENERATOR
// ─────────────────────────────────────────────

export async function generateSessionFeedback(
  roleTitle: string,
  overallScore: number,
  technicalScore: number,
  behavioralScore: number,
  questionsAndAnswers: { question: string; answer: string; score: number }[],
): Promise<string> {
  const qaText = questionsAndAnswers
    .map(
      (qa, i) =>
        `Q${i + 1} (score: ${qa.score}/100): ${qa.question}\nAnswer: ${qa.answer}`,
    )
    .join("\n\n");

  const prompt = `
You are a career coach giving post-interview feedback to a student.

ROLE APPLIED FOR: ${roleTitle}
OVERALL SCORE: ${overallScore}/100
TECHNICAL SCORE: ${technicalScore}/100
BEHAVIORAL SCORE: ${behavioralScore}/100

INTERVIEW Q&A:
${qaText}

Write a concise, encouraging but honest feedback summary in 3-4 sentences.
Cover: overall performance, strongest area, weakest area, one specific improvement tip.
Do NOT use markdown. Plain text only.
`;

  return generateText(prompt);
}