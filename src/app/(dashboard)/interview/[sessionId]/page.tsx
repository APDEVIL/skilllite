"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/trpc/react";
import { QuestionPanel } from "@/components/interview/question-panel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: session, isLoading } = api.interview.getSession.useQuery({
    sessionId,
  });

  // ── Fix: never call router.push() during render ──
  useEffect(() => {
    if (session?.status === "completed") {
      router.push(`/interview/${sessionId}/result`);
    }
  }, [session?.status, sessionId, router]);

  const completeSession = api.interview.completeSession.useMutation({
    onSuccess: () => {
      router.push(`/interview/${sessionId}/result`);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-sm text-slate-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-white font-semibold">Session not found</p>
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
  if (session.status === "completed") return null;

  const questions = session.questions ?? [];
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-600 text-sm">No questions found.</p>
      </div>
    );
  }

  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center p-6">
      <div className="max-w-3xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium text-slate-400">
            {session.role?.title ?? "Interview"}
          </span>
          <span className="capitalize">{session.difficulty}</span>
        </div>
      </div>

      <QuestionPanel
        question={currentQuestion}
        sessionId={sessionId}
        totalQuestions={questions.length}
        isLast={isLast}
        onAnswered={() => setCurrentIndex((i) => i + 1)}
        onComplete={() => completeSession.mutate({ sessionId })}
      />

      {completeSession.isPending && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0d1530] border border-white/[0.08] rounded-2xl p-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
            <p className="text-sm font-semibold text-white">
              Generating your results...
            </p>
            <p className="text-xs text-slate-600">
              AI is calculating scores and feedback
            </p>
          </div>
        </div>
      )}
    </div>
  );
}