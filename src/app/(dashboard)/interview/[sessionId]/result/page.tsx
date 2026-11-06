"use client";

import { use, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/trpc/react";
import { ResultBreakdown } from "@/components/interview/result-breakdown";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function InterviewResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();

  const { data: session, isLoading } = api.interview.getSession.useQuery({
    sessionId,
  });

  // ── Fix: never call router.push() during render ──
  useEffect(() => {
    if (session && session.status !== "completed") {
      router.push(`/interview/${sessionId}`);
    }
  }, [session, sessionId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-sm text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-white font-semibold">Results not found</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/interview")}
            className="text-slate-500 hover:text-white text-xs"
          >
            Back to Interviews
          </Button>
        </div>
      </div>
    );
  }

  // Render nothing while the useEffect redirect fires
  if (session.status !== "completed") return null;

  return (
    <div className="p-6">
      <ResultBreakdown session={session} />
    </div>
  );
}