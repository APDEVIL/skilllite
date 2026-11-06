import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { auth } from "@/server/better-auth";

export const authRouter = createTRPCRouter({
  // ── GET SESSION ──────────────────────────────
  getSession: publicProcedure.query(async ({ ctx }) => {
    return ctx.session ?? null;
  }),

  // ── GET CURRENT USER ─────────────────────────
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user;
  }),
});