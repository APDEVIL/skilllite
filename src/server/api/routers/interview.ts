import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import { interviewSessions, interviewQuestions } from "@/server/db/schema";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateSessionFeedback,
  isMCQQuestion,
} from "@/server/ai/interview-engine";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const interviewRouter = createTRPCRouter({
  // ── START SESSION ────────────────────────────
  startSession: protectedProcedure
    .input(
      z.object({
        roleId: z.string().uuid(),
        companyId: z.string().uuid().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        totalQuestions: z.number().int().min(3).max(10).default(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const role = await db.query.roles.findFirst({
        where: (roles, { eq }) => eq(roles.id, input.roleId),
      });
      if (!role) throw new Error("Role not found");

      const generated = await generateInterviewQuestions(
        role.title,
        (role.requiredSkills as string[]) ?? [],
        input.difficulty,
        input.totalQuestions,
      );

      if (!generated.length) throw new Error("Failed to generate questions");

      const [session] = await db
        .insert(interviewSessions)
        .values({
          userId,
          roleId: input.roleId,
          companyId: input.companyId ?? null,
          difficulty: input.difficulty,
          status: "in_progress",
          totalQuestions: generated.length,
          answeredQuestions: 0,
          startedAt: new Date(),
        })
        .returning();

      if (!session) throw new Error("Failed to create interview session");

      for (let i = 0; i < generated.length; i++) {
        const q = generated[i]!;
        await db.insert(interviewQuestions).values({
          sessionId: session.id,
          questionNumber: i + 1,
          questionText: q.questionText,
          questionType: q.questionType,
          expectedKeyPoints: q.expectedKeyPoints,
        });
      }

      return {
        sessionId: session.id,
        totalQuestions: generated.length,
        roleTitle: role.title,
        difficulty: input.difficulty,
      };
    }),

  // ── GET SESSION WITH QUESTIONS ───────────────
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await db.query.interviewSessions.findFirst({
        where: and(
          eq(interviewSessions.id, input.sessionId),
          eq(interviewSessions.userId, ctx.session.user.id),
        ),
        with: {
          questions: {
            orderBy: (q, { asc }) => [asc(q.questionNumber)],
          },
          role: true,
          company: true,
        },
      });

      if (!session) throw new Error("Session not found");
      return session;
    }),

  // ── GET CURRENT QUESTION ─────────────────────
  getCurrentQuestion: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await db.query.interviewSessions.findFirst({
        where: and(
          eq(interviewSessions.id, input.sessionId),
          eq(interviewSessions.userId, ctx.session.user.id),
        ),
      });
      if (!session) throw new Error("Session not found");

      const nextQuestion = await db.query.interviewQuestions.findFirst({
        where: and(
          eq(interviewQuestions.sessionId, input.sessionId),
          isNull(interviewQuestions.userAnswer),
        ),
        orderBy: (q, { asc }) => [asc(q.questionNumber)],
      });

      return nextQuestion ?? null;
    }),

  // ── SUBMIT ANSWER ────────────────────────────
  submitAnswer: protectedProcedure
    .input(
      z.object({
        questionId: z.string().uuid(),
        sessionId: z.string().uuid(),
        // For MCQ: single letter "A"/"B"/"C"/"D"
        // For open: free text
        userAnswer: z.string().min(1, "Answer cannot be empty"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const session = await db.query.interviewSessions.findFirst({
        where: and(
          eq(interviewSessions.id, input.sessionId),
          eq(interviewSessions.userId, userId),
        ),
        with: { role: true },
      });
      if (!session) throw new Error("Session not found");
      if (session.status === "completed")
        throw new Error("Session already completed");

      const question = await db.query.interviewQuestions.findFirst({
        where: and(
          eq(interviewQuestions.id, input.questionId),
          eq(interviewQuestions.sessionId, input.sessionId),
        ),
      });
      if (!question) throw new Error("Question not found");
      if (question.userAnswer !== null)
        throw new Error("Question already answered");

      const keyPoints = (question.expectedKeyPoints as string[]) ?? [];
      const isMCQ = isMCQQuestion(keyPoints);

      const evaluation = await evaluateAnswer(
        question.questionText,
        keyPoints,
        input.userAnswer,
        session.role?.title ?? "Software Engineer",
      );

      await db
        .update(interviewQuestions)
        .set({
          userAnswer: input.userAnswer,
          answerScore: evaluation.score,
          aiFeedback: evaluation.aiFeedback,
          answeredAt: new Date(),
        })
        .where(eq(interviewQuestions.id, input.questionId));

      await db
        .update(interviewSessions)
        .set({
          answeredQuestions: (session.answeredQuestions ?? 0) + 1,
        })
        .where(eq(interviewSessions.id, input.sessionId));

      return {
        score: evaluation.score,
        feedback: evaluation.aiFeedback,
        questionNumber: question.questionNumber,
        totalQuestions: session.totalQuestions,
        isMCQ,
        isCorrect: isMCQ ? evaluation.score === 100 : null,
      };
    }),

  // ── COMPLETE SESSION ─────────────────────────
  completeSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const session = await db.query.interviewSessions.findFirst({
        where: and(
          eq(interviewSessions.id, input.sessionId),
          eq(interviewSessions.userId, userId),
        ),
        with: {
          questions: {
            orderBy: (q, { asc }) => [asc(q.questionNumber)],
          },
          role: true,
        },
      });

      if (!session) throw new Error("Session not found");
      if (session.status === "completed")
        throw new Error("Session already completed");

      const answered = session.questions.filter((q) => q.userAnswer !== null);
      if (answered.length === 0) throw new Error("No answers submitted");

      const allScores = answered.map((q) => q.answerScore ?? 0);
      const overallScore = Math.round(
        allScores.reduce((a, b) => a + b, 0) / allScores.length,
      );

      const technical  = answered.filter((q) => q.questionType === "technical");
      const behavioral = answered.filter((q) => q.questionType === "behavioral");
      const scenario   = answered.filter((q) => q.questionType === "scenario");

      const avgScore = (arr: typeof answered): number =>
        arr.length > 0
          ? Math.round(
              arr.reduce((a, q) => a + (q.answerScore ?? 0), 0) / arr.length,
            )
          : overallScore;

      const technicalScore    = avgScore(technical);
      const behavioralScore   = avgScore([...behavioral, ...scenario]);
      const communicationScore = Math.round(behavioralScore * 0.6 + overallScore * 0.4);

      const aiFeedbackSummary = await generateSessionFeedback(
        session.role?.title ?? "Software Engineer",
        overallScore,
        technicalScore,
        behavioralScore,
        answered.map((q) => ({
          question: q.questionText,
          answer: q.userAnswer ?? "",
          score: q.answerScore ?? 0,
        })),
      );

      const completedAt = new Date();
      const durationMinutes = session.startedAt
        ? Math.round(
            (completedAt.getTime() - session.startedAt.getTime()) / 60000,
          )
        : null;

      await db
        .update(interviewSessions)
        .set({
          status: "completed",
          overallScore,
          technicalScore,
          behavioralScore,
          communicationScore,
          aiFeedbackSummary,
          completedAt,
          durationMinutes,
        })
        .where(eq(interviewSessions.id, input.sessionId));

      return {
        overallScore,
        technicalScore,
        behavioralScore,
        communicationScore,
        aiFeedbackSummary,
        durationMinutes,
        totalAnswered: answered.length,
        totalQuestions: session.totalQuestions,
      };
    }),

  // ── GET MY SESSIONS ──────────────────────────
  getMySessions: protectedProcedure.query(async ({ ctx }) => {
    return db.query.interviewSessions.findMany({
      where: eq(interviewSessions.userId, ctx.session.user.id),
      with: { role: true, company: true },
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    });
  }),

  // ── GET SESSION RESULT ───────────────────────
  getSessionResult: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await db.query.interviewSessions.findFirst({
        where: and(
          eq(interviewSessions.id, input.sessionId),
          eq(interviewSessions.userId, ctx.session.user.id),
        ),
        with: {
          questions: { orderBy: (q, { asc }) => [asc(q.questionNumber)] },
          role: true,
          company: true,
        },
      });

      if (!session) throw new Error("Session not found");
      if (session.status !== "completed")
        throw new Error("Session not completed yet");

      return session;
    }),

  // ── ABANDON SESSION ──────────────────────────
 // ── ABANDON SESSION ──────────────────────────
  abandonSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(interviewSessions)
        .set({ status: "abandoned" })
        .where(
          and(
            eq(interviewSessions.id, input.sessionId),
            eq(interviewSessions.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),   // ← comma kept (optional but clean)
});       // ← THIS is what's missing — closes createTRPCRouter({