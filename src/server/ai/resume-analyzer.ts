import { generateJSON } from "./gemini";
import { extractText } from "unpdf";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ExtractedExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ExtractedProject {
  name: string;
  description: string;
  techStack: string[];
}

export interface ExtractedEducation {
  institution: string;
  degree: string;
  year: string;
}

export interface ResumeAnalysisResult {
  extractedSkills: string[];
  extractedExperience: ExtractedExperience[];
  extractedProjects: ExtractedProject[];
  extractedEducation: ExtractedEducation[];
  atsScore: number;
  analysisSummary: string;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
}

// ─────────────────────────────────────────────
// ANALYZER
// ─────────────────────────────────────────────

export async function analyzeResume(
  resumeText: string,
): Promise<ResumeAnalysisResult> {
  if (!resumeText?.trim()) {
    throw new Error(
      "Resume text is empty — PDF extraction may have failed or the PDF " +
        "contains only scanned images with no selectable text.",
    );
  }

  const prompt = `
You are an expert resume analyzer and ATS (Applicant Tracking System).
Analyze the resume text below and extract structured information.

RESUME TEXT:
---
${resumeText}
---

Return ONLY a valid JSON object with this exact structure.
Do NOT include markdown fences, comments, or any text outside the JSON.

{
  "extractedSkills": ["skill1", "skill2"],
  "extractedExperience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Jan 2022 - Dec 2023",
      "description": "Brief description of responsibilities and achievements"
    }
  ],
  "extractedProjects": [
    {
      "name": "Project Name",
      "description": "What the project does and its impact",
      "techStack": ["React", "Node.js"]
    }
  ],
  "extractedEducation": [
    {
      "institution": "University Name",
      "degree": "B.Tech Computer Science",
      "year": "2024"
    }
  ],
  "atsScore": 75,
  "analysisSummary": "2-3 sentence professional summary of the candidate",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvementSuggestions": [
    "Add quantifiable achievements to experience section",
    "Include relevant certifications"
  ]
}

Rules:
- extractedSkills: list ALL technical skills, languages, frameworks, and tools found
- atsScore: integer 0-100 based on formatting, keyword density, completeness, quantifiable achievements
- Be specific and honest in weaknesses and suggestions
- Use empty arrays [] for any section not found in the resume
- The JSON must be valid and directly parseable by JSON.parse()
`;

  const result = await generateJSON<ResumeAnalysisResult>(prompt);

  return {
    extractedSkills: result.extractedSkills ?? [],
    extractedExperience: result.extractedExperience ?? [],
    extractedProjects: result.extractedProjects ?? [],
    extractedEducation: result.extractedEducation ?? [],
    atsScore: typeof result.atsScore === "number" ? result.atsScore : 0,
    analysisSummary: result.analysisSummary ?? "",
    strengths: result.strengths ?? [],
    weaknesses: result.weaknesses ?? [],
    improvementSuggestions: result.improvementSuggestions ?? [],
  };
}

// ─────────────────────────────────────────────
// PDF TEXT EXTRACTION  (unpdf — Next.js/Bun safe)
// ─────────────────────────────────────────────

/**
 * Extracts raw text from a PDF buffer using unpdf.
 *
 * Why unpdf instead of pdfjs-dist or pdf-parse?
 *   - pdf-parse: broken CJS/ESM interop under Bun, unmaintained.
 *   - pdfjs-dist: requires a Worker thread or a valid workerSrc URL,
 *     neither of which exists in a Next.js server-side environment.
 *   - unpdf: thin wrapper around pdfjs built specifically for server-side
 *     and edge runtimes (Next.js, Cloudflare Workers, Bun). No worker needed.
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(
    pdfBuffer.buffer,
    pdfBuffer.byteOffset,
    pdfBuffer.byteLength,
  );

  let text: string;

  try {
    // Try without mergePages first — returns string[] (one per page)
    const result = await extractText(uint8Array, {
      mergePages: false,
    });

    // Debug: log the raw shape so we can see exactly what unpdf returns
    console.log("[pdf] unpdf raw result type:", typeof result);
    console.log("[pdf] unpdf result keys:", Object.keys(result as object));
    console.log("[pdf] text type:", typeof result.text);
    console.log("[pdf] text isArray:", Array.isArray(result.text));
    console.log("[pdf] text value:", JSON.stringify(result.text).slice(0, 300));
    console.log("[pdf] totalPages:", result.totalPages);

    if (Array.isArray(result.text)) {
      text = result.text.join("\n");
    } else if (typeof result.text === "string") {
      text = result.text;
    } else {
      text = String(result.text ?? "");
    }
  } catch (err) {
    throw new Error(
      `unpdf failed to extract text from PDF: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  console.log("[pdf] final extracted text length:", text.length);
  console.log("[pdf] first 200 chars:", text.slice(0, 200));

  if (!text?.trim()) {
    throw new Error(
      "PDF text extraction returned empty text. The file may be " +
        "a scanned image PDF with no embedded text layer.",
    );
  }

  return text.trim();
}
// ─────────────────────────────────────────────
// FILE DOWNLOAD
// ─────────────────────────────────────────────

/**
 * Downloads a file from a URL and returns it as a Buffer.
 * Used to download uploaded PDFs from UploadThing before parsing.
 */
export async function downloadFileAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to download file from UploadThing: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("Downloaded file is empty (0 bytes).");
  }

  return Buffer.from(arrayBuffer);
}