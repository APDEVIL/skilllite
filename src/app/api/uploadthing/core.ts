import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // file.url is deprecated in uploadthing v8 and removed in v9.
      // file.ufsUrl is the persistent, CDN-backed URL — use this everywhere.
      return {
        userId: metadata.userId,
        fileUrl: file.ufsUrl,
        fileKey: file.key,
        fileName: file.name,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;