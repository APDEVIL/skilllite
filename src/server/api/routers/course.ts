import { z } from "zod";

import { db } from "@/server/db";
import { userSkills } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const courseRouter = createTRPCRouter({
  // ── LIST ALL COURSES ─────────────────────────
  list: publicProcedure
    .input(
      z.object({
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        isFree: z.boolean().optional(),
        skill: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const all = await db.query.courses.findMany({
        orderBy: (c, { desc }) => [desc(c.rating)],
      });

      return all.filter((course) => {
        const skillsCovered = (course.skillsCovered as string[]) ?? [];
        if (input.difficulty && course.difficulty !== input.difficulty)
          return false;
        if (input.isFree !== undefined && course.isFree !== input.isFree)
          return false;
        if (
          input.skill &&
          !skillsCovered.some((s) =>
            s.toLowerCase().includes(input.skill!.toLowerCase()),
          )
        )
          return false;
        return true;
      });
    }),

  // ── RECOMMEND COURSES FOR USER ───────────────
  // Based on missing skills from skill gap reports
  getRecommended: protectedProcedure
    .input(
      z.object({
        missingSkills: z.array(z.string()),
      }),
    )
    .query(async ({ input }) => {
      if (input.missingSkills.length === 0) return [];

      const allCourses = await db.query.courses.findMany({
        orderBy: (c, { desc }) => [desc(c.rating)],
      });

      // Score each course by how many missing skills it covers
      const scored = allCourses
        .map((course) => {
          const skillsCovered = (course.skillsCovered as string[]) ?? [];
          const matches = input.missingSkills.filter((ms) =>
            skillsCovered.some(
              (sc) => sc.toLowerCase() === ms.toLowerCase(),
            ),
          ).length;
          return { ...course, matchScore: matches };
        })
        .filter((c) => c.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore || (b.rating ?? 0) - (a.rating ?? 0));

      return scored.slice(0, 10); // top 10
    }),
});