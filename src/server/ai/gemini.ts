import Groq from "groq-sdk";
import { env } from "@/env";

// ─────────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────────

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// Model to use — llama-3.3-70b is Groq's best free model.
// Fast, high quality, handles long resume text and JSON output well.
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ─────────────────────────────────────────────
// TEXT GENERATION
// ─────────────────────────────────────────────

/**
 * Sends a prompt and returns the text response.
 * Drop-in replacement for the Gemini generateText function —
 * same signature, same behaviour, same error types.
 */
export async function generateText(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 4096,
  });

  const choice = completion.choices[0];

  if (!choice) {
    throw new Error("Groq returned no choices in the response.");
  }

  const finishReason = choice.finish_reason;
  if (finishReason && finishReason !== "stop") {
    throw new Error(
      `Groq stopped early — finish_reason: ${finishReason}. ` +
        "The response may be incomplete.",
    );
  }

  const text = choice.message?.content;
  if (!text?.trim()) {
    throw new Error("Groq returned an empty text response.");
  }

  return text.trim();
}

// ─────────────────────────────────────────────
// JSON GENERATION
// ─────────────────────────────────────────────

/**
 * Sends a prompt and parses the response as JSON.
 * Strips markdown code fences that LLMs sometimes wrap around JSON.
 * Drop-in replacement for the Gemini generateJSON function.
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const raw = await generateText(prompt);

  // Strip ```json ... ``` or ``` ... ``` fences
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `Failed to parse Groq JSON response.\n` +
        `Raw output (first 500 chars): ${cleaned.slice(0, 500)}`,
    );
  }
}