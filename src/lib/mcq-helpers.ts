// ─────────────────────────────────────────────
// MCQ HELPERS — pure functions, no server imports
// Safe to use in both client and server components
// ─────────────────────────────────────────────

/**
 * Encodes MCQ data into the expectedKeyPoints array so no schema change is needed.
 * Format: ["MCQ_OPTIONS", "A) ...", "B) ...", "C) ...", "D) ...", "CORRECT:A", "Explanation: ..."]
 */
export function encodeMCQ(
  options: { A: string; B: string; C: string; D: string },
  correctLetter: "A" | "B" | "C" | "D",
  explanation: string,
): string[] {
  return [
    "MCQ_OPTIONS",
    `A) ${options.A}`,
    `B) ${options.B}`,
    `C) ${options.C}`,
    `D) ${options.D}`,
    `CORRECT:${correctLetter}`,
    `Explanation: ${explanation}`,
  ];
}

export function isMCQQuestion(expectedKeyPoints: string[]): boolean {
  return expectedKeyPoints[0] === "MCQ_OPTIONS";
}

export function decodeMCQ(expectedKeyPoints: string[]): {
  options: { A: string; B: string; C: string; D: string };
  correctLetter: string;
  explanation: string;
} {
  const A = expectedKeyPoints[1]?.replace(/^A\) /, "") ?? "";
  const B = expectedKeyPoints[2]?.replace(/^B\) /, "") ?? "";
  const C = expectedKeyPoints[3]?.replace(/^C\) /, "") ?? "";
  const D = expectedKeyPoints[4]?.replace(/^D\) /, "") ?? "";
  const correctLetter = expectedKeyPoints[5]?.replace("CORRECT:", "") ?? "A";
  const explanation   = expectedKeyPoints[6]?.replace("Explanation: ", "") ?? "";
  return {
    options: { A, B, C, D },
    correctLetter,
    explanation,
  };
}