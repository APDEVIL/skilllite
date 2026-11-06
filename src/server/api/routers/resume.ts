import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import { resumes, userSkills, skills } from "@/server/db/schema";
import {
  analyzeResume,
  downloadFileAsBuffer,
  extractTextFromPDF,
} from "@/server/ai/resume-analyzer";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const resumeRouter = createTRPCRouter({
  // ── GET MY RESUMES ───────────────────────────
  getMyResumes: protectedProcedure.query(async ({ ctx }) => {
    return db.query.resumes.findMany({
      where: eq(resumes.userId, ctx.session.user.id),
      orderBy: (resumes, { desc }) => [desc(resumes.createdAt)],
    });
  }),

  // ── GET ACTIVE RESUME ────────────────────────
  getActiveResume: protectedProcedure.query(async ({ ctx }) => {
    return (
      (await db.query.resumes.findFirst({
        where: and(
          eq(resumes.userId, ctx.session.user.id),
          eq(resumes.isActive, true),
        ),
      })) ?? null
    );
  }),

  // ── GET RESUME BY ID ─────────────────────────
  getById: protectedProcedure
    .input(z.object({ resumeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const resume = await db.query.resumes.findFirst({
        where: and(
          eq(resumes.id, input.resumeId),
          eq(resumes.userId, ctx.session.user.id),
        ),
      });
      if (!resume) throw new Error("Resume not found");
      return resume;
    }),

  // ── REGISTER UPLOAD + TRIGGER ANALYSIS ───────
  analyzeResume: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Deactivate all previous resumes for this user
      await db
        .update(resumes)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(resumes.userId, userId));

      // Insert new resume record with processing status
      const [resume] = await db
        .insert(resumes)
        .values({
          userId,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileKey: input.fileKey,
          isActive: true,
          analysisStatus: "processing",
        })
        .returning();

      if (!resume) throw new Error("Failed to create resume record");

      try {
        console.log("[resume] Step 1: downloading PDF from", input.fileUrl);
        const buffer = await downloadFileAsBuffer(input.fileUrl);
        console.log("[resume] Step 1 done — buffer size:", buffer.byteLength);

        console.log("[resume] Step 2: extracting text from PDF");
        const parsedText = await extractTextFromPDF(buffer);
        console.log("[resume] Step 2 done — text length:", parsedText.length);

        console.log("[resume] Step 3: running AI analysis");
        const analysis = await analyzeResume(parsedText);
        console.log("[resume] Step 3 done — atsScore:", analysis.atsScore);

        // Step 4: Persist analysis results
        await db
          .update(resumes)
          .set({
            parsedText,
            extractedSkills: analysis.extractedSkills,
            extractedExperience: analysis.extractedExperience,
            extractedProjects: analysis.extractedProjects,
            extractedEducation: analysis.extractedEducation,
            atsScore: analysis.atsScore,
            analysisSummary: analysis.analysisSummary,
            analysisStatus: "done",
            updatedAt: new Date(),
          })
          .where(eq(resumes.id, resume.id));

        // Step 5: Auto-add extracted skills to userSkills table
        let skillsAdded = 0;
        for (const skillName of analysis.extractedSkills) {
          const skill = await db.query.skills.findFirst({
            where: ilike(skills.name, skillName),
          });

          if (skill) {
            await db
              .insert(userSkills)
              .values({
                userId,
                skillId: skill.id,
                proficiencyLevel: 2,
                source: "resume",
              })
              .onConflictDoNothing();
            skillsAdded++;
          }
        }

        return {
          success: true,
          resumeId: resume.id,
          atsScore: analysis.atsScore,
          extractedSkillsCount: analysis.extractedSkills.length,
          skillsAddedToProfile: skillsAdded,
          analysisSummary: analysis.analysisSummary,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          improvementSuggestions: analysis.improvementSuggestions,
        };
      } catch (err) {
        // ── FULL STACK TRACE FOR DEBUGGING ──────
        console.error("FULL ERROR STACK:", err);

        await db
          .update(resumes)
          .set({ analysisStatus: "failed", updatedAt: new Date() })
          .where(eq(resumes.id, resume.id));

        throw new Error(
          `Resume analysis failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    }),

  // ── SET ACTIVE RESUME ────────────────────────
  setActiveResume: protectedProcedure
    .input(z.object({ resumeId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const resume = await db.query.resumes.findFirst({
        where: and(
          eq(resumes.id, input.resumeId),
          eq(resumes.userId, userId),
        ),
      });
      if (!resume) throw new Error("Resume not found");

      await db
        .update(resumes)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(resumes.userId, userId));

      await db
        .update(resumes)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(resumes.id, input.resumeId));

      return { success: true };
    }),

  // ── DELETE RESUME ────────────────────────────
  deleteResume: protectedProcedure
    .input(z.object({ resumeId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const resume = await db.query.resumes.findFirst({
        where: and(
          eq(resumes.id, input.resumeId),
          eq(resumes.userId, userId),
        ),
      });
      if (!resume) throw new Error("Resume not found");

      await db
        .delete(resumes)
        .where(
          and(
            eq(resumes.id, input.resumeId),
            eq(resumes.userId, userId),
          ),
        );

      return { success: true, fileKey: resume.fileKey };
    }),
});