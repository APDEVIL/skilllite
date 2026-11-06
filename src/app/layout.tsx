import type { Metadata } from "next";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/trpc/react";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "PrepIQ — AI Interview & Skill Gap Analyzer",
    template: "%s | PrepIQ",
  },
  description:
    "Upload your resume, discover your skill gap, and ace every interview with AI-powered mock sessions.",
  keywords: ["interview prep", "skill gap", "AI interview", "resume analysis", "placement"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080d1a] antialiased">
        <TRPCReactProvider>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "hsl(222 47% 10%)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "hsl(210 40% 96%)",
                fontFamily: "'DM Sans', sans-serif",
              },
            }}
          />
        </TRPCReactProvider>
      </body>
    </html>
  );
}