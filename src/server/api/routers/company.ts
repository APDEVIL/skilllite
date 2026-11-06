import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import { skillGapReports, userSkills } from "@/server/db/schema";
import { analyzeSkillGap } from "@/server/ai/skill-gap";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const companyRouter = createTRPCRouter({
  // ── LIST ALL COMPANIES ───────────────────────
  list: publicProcedure.query(async () => {
    return db.query.companies.findMany({
      with: { roles: true },
      orderBy: (c, { asc }) => [asc(c.name)],
    });
  }),

  // ── LIST ALL ROLES ───────────────────────────
  listRoles: publicProcedure
    .input(
      z.object({
        companyId: z.string().uuid().optional(),
        genericOnly: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      return db.query.roles.findMany({
        where: (roles, { eq, and, isNull }) => {
          if (input.genericOnly) return eq(roles.isGeneric, true);
          if (input.companyId) return eq(roles.companyId, input.companyId);
          return undefined;
        },
        with: { company: true },
        orderBy: (r, { asc }) => [asc(r.title)],
      });
    }),

  // ── GET SKILL GAP FOR ROLE (AI) ──────────────
  getSkillGap: protectedProcedure
    .input(
      z.object({
        roleId: z.string().uuid(),
        resumeId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get role
      const role = await db.query.roles.findFirst({
        where: (roles, { eq }) => eq(roles.id, input.roleId),
      });
      if (!role) throw new Error("Role not found");

      // Get user skills
      const userSkillRows = await db.query.userSkills.findMany({
        where: eq(userSkills.userId, userId),
        with: { skill: true },
      });
      const userSkillNames = userSkillRows.map((us) => us.skill.name);

      // Run Gemini skill gap analysis
      const gapResult = await analyzeSkillGap(
        userSkillNames,
        (role.requiredSkills as string[]) ?? [],
        (role.niceToHaveSkills as string[]) ?? [],
        role.title,
      );

      // Save report to DB
      const [report] = await db
        .insert(skillGapReports)
        .values({
          userId,
          resumeId: input.resumeId ?? null,
          targetRoleId: input.roleId,
          presentSkills: gapResult.presentSkills,
          missingSkills: gapResult.missingSkills,
          strongSkills: gapResult.strongSkills,
          readinessScore: gapResult.readinessScore,
          learningPath: gapResult.learningPath,
          aiSummary: gapResult.aiSummary,
        })
        .returning();

      return report;
    }),

  // ── GET MY SKILL GAP REPORTS ─────────────────
  getMySkillGapReports: protectedProcedure.query(async ({ ctx }) => {
    return db.query.skillGapReports.findMany({
      where: eq(skillGapReports.userId, ctx.session.user.id),
      with: { targetRole: true },
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });
  }),
});