"use client";

import { useState } from "react";
import {
  Send, Loader2, CheckCircle2, ChevronRight,
  XCircle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn, getScoreColor } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { isMCQQuestion, decodeMCQ } from "@/lib/mcq-helpers"; // ← fixed: no longer importing from server

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  expectedKeyPoints?: string[] | null;
  userAnswer?: string | null;
  answerScore?: number | null;
  aiFeedback?: string | null;
}

interface QuestionPanelProps {
  question: Question;
  sessionId: string;
  totalQuestions: number;
  onAnswered: () => void;
  isLast: boolean;
  onComplete: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  technical:  "bg-blue-500/15 text-blue-400 border-blue-500/25",
  behavioral: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  scenario:   "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
};

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

export function QuestionPanel({
  question,
  sessionId,
  totalQuestions,
  onAnswered,
  isLast,
  onComplete,
}: QuestionPanelProps) {
  const [openAnswer, setOpenAnswer]         = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted]           = useState(false);
  const [result, setResult]                 = useState<{
    score: number;
    feedback: string;
    isMCQ: boolean;
    isCorrect: boolean | null;
  } | null>(null);

  const utils = api.useUtils();

  const keyPoints = (question.expectedKeyPoints ?? []) as string[];
  const isMCQ     = isMCQQuestion(keyPoints);
  const mcqData   = isMCQ ? decodeMCQ(keyPoints) : null;

  const submitAnswer = api.interview.submitAnswer.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      setResult({
        score:     data.score,
        feedback:  data.feedback,
        isMCQ:     data.isMCQ,
        isCorrect: data.isCorrect,
      });
      void utils.interview.getSession.invalidate({ sessionId });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmitOpen = () => {
    if (!openAnswer.trim()) {
      toast.error("Please write your answer before submitting.");
      return;
    }
    submitAnswer.mutate({
      questionId: question.id,
      sessionId,
      userAnswer: openAnswer.trim(),
    });
  };

  const handleSelectMCQ = (letter: string) => {
    if (submitted) return;
    setSelectedOption(letter);
  };

  const handleSubmitMCQ = () => {
    if (!selectedOption) {
      toast.error("Please select an option.");
      return;
    }
    submitAnswer.mutate({
      questionId: question.id,
      sessionId,
      userAnswer: selectedOption,
    });
  };

  const progressPct = ((question.questionNumber - 1) / totalQuestions) * 100;

  // Can user proceed after MCQ? Only if correct.
  const canProceed = !isMCQ || result?.isCorrect === true;

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Progress ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Question {question.questionNumber} of {totalQuestions}</span>
          <span>{Math.round(progressPct)}% complete</span>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Question card ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2.5 py-0.5 border font-semibold uppercase tracking-wide",
              TYPE_COLORS[question.questionType] ?? TYPE_COLORS.technical,
            )}
          >
            {question.questionType}
          </Badge>
          {isMCQ && (
            <Badge
              variant="outline"
              className="text-[10px] px-2.5 py-0.5 border font-semibold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            >
              MCQ
            </Badge>
          )}
          <span className="text-[10px] text-slate-700">Q{question.questionNumber}</span>
        </div>
        <p className="text-base font-semibold text-white leading-relaxed">
          {question.questionText}
        </p>
      </div>

      {/* ── MCQ Options ── */}
      {isMCQ && mcqData && (
        <div className="space-y-2.5">
          {OPTION_LETTERS.map((letter) => {
            const text      = mcqData.options[letter];
            const isChosen  = selectedOption === letter;
            const isCorrect = letter === mcqData.correctLetter;

            let optionStyle = "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] cursor-pointer";

            if (submitted) {
              if (isCorrect) {
                optionStyle = "border-emerald-500/40 bg-emerald-500/10 cursor-default";
              } else if (isChosen && !isCorrect) {
                optionStyle = "border-red-500/40 bg-red-500/10 cursor-default";
              } else {
                optionStyle = "border-white/[0.04] bg-white/[0.01] opacity-40 cursor-default";
              }
            } else if (isChosen) {
              optionStyle = "border-blue-500/40 bg-blue-500/10 cursor-pointer";
            }

            return (
              <button
                key={letter}
                disabled={submitted}
                onClick={() => handleSelectMCQ(letter)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-150 text-left",
                  optionStyle,
                )}
              >
                {/* Letter badge */}
                <span
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 border transition-all",
                    submitted && isCorrect
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : submitted && isChosen && !isCorrect
                        ? "bg-red-500 border-red-400 text-white"
                        : isChosen
                          ? "bg-blue-500 border-blue-400 text-white"
                          : "border-white/[0.12] text-slate-500",
                  )}
                >
                  {letter}
                </span>

                {/* Option text */}
                <span
                  className={cn(
                    "flex-1 text-sm font-medium transition-colors",
                    submitted && isCorrect
                      ? "text-emerald-300"
                      : submitted && isChosen && !isCorrect
                        ? "text-red-300"
                        : isChosen
                          ? "text-white"
                          : "text-slate-300",
                  )}
                >
                  {text}
                </span>

                {/* Result icon */}
                {submitted && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
                {submitted && isChosen && !isCorrect && (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
              </button>
            );
          })}

          {/* Submit MCQ button */}
          {!submitted && (
            <Button
              onClick={handleSubmitMCQ}
              disabled={!selectedOption || submitAnswer.isPending}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 font-semibold mt-1"
            >
              {submitAnswer.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking…</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Submit Answer</>
              )}
            </Button>
          )}
        </div>
      )}

      {/* ── Open Answer ── */}
      {!isMCQ && !submitted && (
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              placeholder="Type your answer here. Be as detailed as you can — the AI evaluates depth, accuracy, and communication..."
              rows={7}
              className="bg-white/[0.03] border-white/[0.08] text-slate-300 placeholder:text-slate-700 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/40 resize-none rounded-xl text-sm leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-700">
              {openAnswer.length} chars
            </div>
          </div>
          <Button
            onClick={handleSubmitOpen}
            disabled={submitAnswer.isPending || !openAnswer.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 h-11 font-semibold"
          >
            {submitAnswer.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI is evaluating…</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />Submit Answer</>
            )}
          </Button>
        </div>
      )}

      {/* ── Feedback card (shown after submit) ── */}
      {submitted && result && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="flex items-start gap-4">
              {/* Score / icon */}
              {isMCQ ? (
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border",
                    result.isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-red-500/10 border-red-500/20",
                  )}
                >
                  {result.isCorrect ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <XCircle className="w-7 h-7 text-red-400" />
                  )}
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/[0.04] flex flex-col items-center justify-center flex-shrink-0 border border-white/[0.06]">
                  <span className={cn("text-2xl font-extrabold tabular-nums", getScoreColor(result.score))}>
                    {result.score}
                  </span>
                  <span className="text-[9px] text-slate-700">/100</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-white">
                    {isMCQ
                      ? result.isCorrect ? "Correct!" : "Incorrect"
                      : "AI Feedback"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {result.feedback}
                </p>
              </div>
            </div>

            {/* Score bar for open questions */}
            {!isMCQ && (
              <div className="mt-4 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    result.score >= 80 ? "bg-emerald-500"
                    : result.score >= 60 ? "bg-blue-500"
                    : result.score >= 40 ? "bg-amber-500"
                    : "bg-red-500",
                  )}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            )}
          </div>

          {/* ── MCQ wrong answer — blocked state ── */}
          {isMCQ && !result.isCorrect && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 leading-relaxed">
                Review the explanation above before moving on. Understanding
                why the correct answer is right matters more than just moving
                forward.
              </p>
            </div>
          )}

          {/* ── Next / Finish ── */}
          {isLast ? (
            <Button
              onClick={onComplete}
              disabled={!canProceed}
              className={cn(
                "w-full h-11 font-semibold border-0 shadow-lg transition-all",
                canProceed
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20"
                  : "bg-white/[0.04] text-slate-600 cursor-not-allowed shadow-none",
              )}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {canProceed ? "Complete Interview & See Results" : "Read the explanation to continue"}
            </Button>
          ) : (
            <Button
              onClick={onAnswered}
              disabled={!canProceed}
              className={cn(
                "w-full h-11 font-semibold border-0 transition-all",
                canProceed
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white"
                  : "bg-white/[0.04] text-slate-600 cursor-not-allowed",
              )}
            >
              {canProceed ? (
                <>Next Question <ChevronRight className="w-4 h-4 ml-2" /></>
              ) : (
                <>Read explanation to continue <AlertCircle className="w-4 h-4 ml-2 text-amber-400" /></>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}