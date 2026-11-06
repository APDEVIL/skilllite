import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import {
  profiles,
  userCompanyInterests,
  userRoleInterests,
  userSkills,
  companies,
  roles,
} from "@/server/db/schema";
import { calculateFitScore } from "@/server/ai/skill-gap";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  // ── GET PROFILE ──────────────────────────────
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.session.user.id),
    });
    return profile ?? null;
  }),

  // ── UPSERT PROFILE ───────────────────────────
  upsertProfile: protectedProcedure
    .input(
      z.object({
        bio: z.string().optional(),
        phone: z.string().max(20).optional(),
        location: z.string().max(100).optional(),
        collegeName: z.string().max(200).optional(),
        degree: z.string().max(100).optional(),
        branch: z.string().max(100).optional(),
        graduationYear: z.number().int().optional(),
        cgpa: z.number().min(0).max(10).optional(),
        careerGoal: z.string().optional(),
        experienceYears: z.number().int().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await db.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
      });

      if (existing) {
        await db
          .update(profiles)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(profiles.userId, userId));
      } else {
        await db.insert(profiles).values({ userId, ...input });
      }

      return { success: true };
    }),

  // ── GET ALL SKILLS (for skill picker UI) ─────
  getAllSkills: protectedProcedure.query(async () => {
    return db.query.skills.findMany({
      orderBy: (s, { asc }) => [asc(s.category), asc(s.name)],
    });
  }),

  // ── GET USER SKILLS ──────────────────────────
  getSkills: protectedProcedure.query(async ({ ctx }) => {
    return db.query.userSkills.findMany({
      where: eq(userSkills.userId, ctx.session.user.id),
      with: { skill: true },
    });
  }),

  // ── ADD SKILL MANUALLY ───────────────────────
  addSkill: protectedProcedure
    .input(
      z.object({
        skillId: z.string().uuid(),
        proficiencyLevel: z.number().int().min(1).max(5).default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .insert(userSkills)
        .values({
          userId: ctx.session.user.id,
          skillId: input.skillId,
          proficiencyLevel: input.proficiencyLevel,
          source: "manual",
        })
        .onConflictDoNothing();
      return { success: true };
    }),

  // ── REMOVE SKILL ─────────────────────────────
  removeSkill: protectedProcedure
    .input(z.object({ skillId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(userSkills)
        .where(
          and(
            eq(userSkills.userId, ctx.session.user.id),
            eq(userSkills.skillId, input.skillId),
          ),
        );
      return { success: true };
    }),

  // ── UPDATE SKILL PROFICIENCY ──────────────────
  updateSkillProficiency: protectedProcedure
    .input(
      z.object({
        skillId: z.string().uuid(),
        proficiencyLevel: z.number().int().min(1).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(userSkills)
        .set({ proficiencyLevel: input.proficiencyLevel })
        .where(
          and(
            eq(userSkills.userId, ctx.session.user.id),
            eq(userSkills.skillId, input.skillId),
          ),
        );
      return { success: true };
    }),

  // ── GET COMPANY INTERESTS ────────────────────
  getCompanyInterests: protectedProcedure.query(async ({ ctx }) => {
    return db.query.userCompanyInterests.findMany({
      where: eq(userCompanyInterests.userId, ctx.session.user.id),
      with: { company: true },
    });
  }),

  // ── SET COMPANY INTERESTS ────────────────────
  setCompanyInterests: protectedProcedure
    .input(z.object({ companyIds: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await db
        .delete(userCompanyInterests)
        .where(eq(userCompanyInterests.userId, userId));

      if (input.companyIds.length === 0) return { success: true };

      // Get user skills for fit score calculation
      const userSkillRows = await db.query.userSkills.findMany({
        where: eq(userSkills.userId, userId),
        with: { skill: true },
      });
      const userSkillNames = userSkillRows.map((us) => us.skill.name);

      // Get selected companies with their roles
      const companyRows = await db.query.companies.findMany({
        where: (companies, { inArray }) =>
          inArray(companies.id, input.companyIds),
        with: { roles: true },
      });

      for (const company of companyRows) {
        // Use first role's required skills for fit score estimate
        const firstRole = company.roles[0];
        const fitScore = firstRole
          ? calculateFitScore(
              userSkillNames,
              (firstRole.requiredSkills as string[]) ?? [],
              (firstRole.niceToHaveSkills as string[]) ?? [],
            )
          : 0;

        await db.insert(userCompanyInterests).values({
          userId,
          companyId: company.id,
          fitScore,
        });
      }

      return { success: true };
    }),

  // ── GET ROLE INTERESTS ───────────────────────
  getRoleInterests: protectedProcedure.query(async ({ ctx }) => {
    return db.query.userRoleInterests.findMany({
      where: eq(userRoleInterests.userId, ctx.session.user.id),
      with: { role: true },
    });
  }),

  // ── SET ROLE INTERESTS ───────────────────────
  setRoleInterests: protectedProcedure
    .input(z.object({ roleIds: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await db
        .delete(userRoleInterests)
        .where(eq(userRoleInterests.userId, userId));

      if (input.roleIds.length === 0) return { success: true };

      const userSkillRows = await db.query.userSkills.findMany({
        where: eq(userSkills.userId, userId),
        with: { skill: true },
      });
      const userSkillNames = userSkillRows.map((us) => us.skill.name);

      const roleRows = await db.query.roles.findMany({
        where: (roles, { inArray }) => inArray(roles.id, input.roleIds),
      });

      for (const role of roleRows) {
        const fitScore = calculateFitScore(
          userSkillNames,
          (role.requiredSkills as string[]) ?? [],
          (role.niceToHaveSkills as string[]) ?? [],
        );

        await db.insert(userRoleInterests).values({
          userId,
          roleId: role.id,
          fitScore,
        });
      }

      return { success: true };
    }),

  // ── RECALCULATE ALL FIT SCORES ────────────────
  // Call this after resume analysis adds new skills
  recalculateFitScores: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const userSkillRows = await db.query.userSkills.findMany({
      where: eq(userSkills.userId, userId),
      with: { skill: true },
    });
    const userSkillNames = userSkillRows.map((us) => us.skill.name);

    // Recalculate company fit scores
    const companyInterests = await db.query.userCompanyInterests.findMany({
      where: eq(userCompanyInterests.userId, userId),
      with: { company: { with: { roles: true } } },
    });

    for (const interest of companyInterests) {
      const firstRole = interest.company.roles[0];
      const fitScore = firstRole
        ? calculateFitScore(
            userSkillNames,
            (firstRole.requiredSkills as string[]) ?? [],
            (firstRole.niceToHaveSkills as string[]) ?? [],
          )
        : 0;

      await db
        .update(userCompanyInterests)
        .set({ fitScore })
        .where(
          and(
            eq(userCompanyInterests.userId, userId),
            eq(userCompanyInterests.companyId, interest.companyId),
          ),
        );
    }

    // Recalculate role fit scores
    const roleInterests = await db.query.userRoleInterests.findMany({
      where: eq(userRoleInterests.userId, userId),
      with: { role: true },
    });

    for (const interest of roleInterests) {
      const fitScore = calculateFitScore(
        userSkillNames,
        (interest.role.requiredSkills as string[]) ?? [],
        (interest.role.niceToHaveSkills as string[]) ?? [],
      );

      await db
        .update(userRoleInterests)
        .set({ fitScore })
        .where(
          and(
            eq(userRoleInterests.userId, userId),
            eq(userRoleInterests.roleId, interest.roleId),
          ),
        );
    }

    return { success: true };
  }),
});