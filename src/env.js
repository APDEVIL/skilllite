import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        BETTER_AUTH_SECRET:
            process.env.NODE_ENV === "production"
                ? z.string()
                : z.string().optional(),
        BETTER_AUTH_URL: z.string().url().describe("The base URL of your application"),
        BETTER_AUTH_GITHUB_CLIENT_ID: z.string(),
        BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string(),
        DATABASE_URL: z.string().url(),
        GROQ_API_KEY: z.string().min(1, "Groq API Key is required"),
        UPLOADTHING_TOKEN: z.string().min(1, "UploadThing Token is required"),
        NODE_ENV: z
            .enum(["development", "test", "production"])
            .default("development"),
    },

    client: {
        // NEXT_PUBLIC_CLIENTVAR: z.string(),
    },

    runtimeEnv: {
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
        BETTER_AUTH_GITHUB_CLIENT_SECRET:
            process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        GROQ_API_KEY: process.env.GROQ_API_KEY,
        UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
        NODE_ENV: process.env.NODE_ENV,
    },

    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});