import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { resumeRouter } from "./routers/resume";
import { interviewRouter } from "./routers/interview";
import { companyRouter } from "./routers/company";
import { courseRouter } from "./routers/course";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  resume: resumeRouter,
  interview: interviewRouter,
  company: companyRouter,
  course: courseRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);