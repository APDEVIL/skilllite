"use client";

import { ScoreRing } from "@/components/dashboard/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  cn,
  getScoreColor,
  getScoreLabel,
  DIFFICULTY_COLORS,
  formatDate,
} from "@/lib/utils";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type SessionResult =
  inferRouterOutputs<AppRouter>["interview"]["getSessionResult"];

interface ResultBreakdownProps {
  session: NonNullable<SessionResult>;
}

const TYPE_COLORS: Record<string, string> = {
  technical: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  behavioral: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  scenario: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
};

function QuestionRow({
  question,
  index,
}: {
  question: NonNullable<SessionResult>["questions"][0];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const score = question.answerScore ?? 0;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors text-left"
      >
        {/* Score */}
        <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
          <span
            className={cn(
              "text-sm font-extrabold tabular-nums",
              getScoreColor(score),
            )}
          >
            {score}
          </span>
        </div>

        {/* Question */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] text-slate-700">Q{index + 1}</span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-2 h-4 border",
                TYPE_COLORS[question.questionType] ?? TYPE_COLORS.technical,
              )}
            >
              {question.questionType}
            </Badge>
          </div>
          <p className="text-sm text-slate-300 truncate">
            {question.questionText}
          </p>
        </div>

        {/* Expand */}
        <div className="flex-shrink-0 text-slate-700">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.05] p-4 space-y-3">
          {/* Full question */}
          <div>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Question
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {question.questionText}
            </p>
          </div>

          {/* User's answer */}
          <div>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Your Answer
            </p>
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
              <p className="text-sm text-slate-400 leading-relaxed">
                {question.userAnswer ?? (
                  <span className="text-slate-700 italic">No answer given</span>
                )}
              </p>
            </div>
          </div>

          {/* AI feedback */}
          {question.aiFeedback && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3 h-3 text-blue-400" />
                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                  AI Feedback
                </p>
              </div>
              <div className="rounded-lg bg-blue-500/[0.05] border border-blue-500/20 p-3">
                <p className="text-sm text-slate-400 leading-relaxed">
                  {question.aiFeedback}
                </p>
              </div>
            </div>
          )}

          {/* Score bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>Score</span>
              <span className={getScoreColor(score)}>
                {score}/100 · {getScoreLabel(score)}
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  score >= 80
                    ? "bg-emerald-500"
                    : score >= 60
                      ? "bg-blue-500"
                      : score >= 40
                        ? "bg-amber-500"
                        : "bg-red-500",
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ResultBreakdown({ session }: ResultBreakdownProps) {
  const overall = session.overallScore ?? 0;
  const technical = session.technicalScore ?? 0;
  const behavioral = session.behavioralScore ?? 0;
  const communication = session.communicationScore ?? 0;

  const radarData = [
    { subject: "Technical", score: technical },
    { subject: "Behavioral", score: behavioral },
    { subject: "Communication", score: communication },
    { subject: "Overall", score: overall },
  ];

  const answered = session.questions.filter((q) => q.userAnswer !== null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Interview Complete
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          {session.role?.title ?? "Interview"} Results
        </h1>
        <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
          {session.company && (
            <>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {session.company.name}
              </span>
              <span>·</span>
            </>
          )}
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2 h-4 border",
              DIFFICULTY_COLORS[session.difficulty ?? "medium"],
            )}
          >
            {session.difficulty}
          </Badge>
          <span>·</span>
          {session.durationMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {session.durationMinutes}m
            </span>
          )}
          <span>{formatDate(session.createdAt)}</span>
        </div>
      </div>

      {/* Score rings + radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Score rings */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">
            Score Breakdown
          </h2>
          <div className="flex items-center justify-around flex-wrap gap-4">
            <ScoreRing
              score={overall}
              size={110}
              label="Overall"
              sublabel="Combined score"
            />
            <div className="flex flex-col gap-4">
              {[
                { label: "Technical", score: technical },
                { label: "Behavioral", score: behavioral },
                { label: "Communication", score: communication },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-28 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{item.label}</span>
                      <span className={getScoreColor(item.score)}>
                        {item.score}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          item.score >= 80
                            ? "bg-emerald-500"
                            : item.score >= 60
                              ? "bg-blue-500"
                              : item.score >= 40
                                ? "bg-amber-500"
                                : "bg-red-500",
                        )}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar chart */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Performance Radar
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#475569", fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(13,21,48,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#94a3b8",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Feedback summary */}
      {session.aiFeedbackSummary && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">AI Coach Feedback</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {session.aiFeedbackSummary}
          </p>
        </div>
      )}

      {/* Per-question breakdown */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Question-by-Question ({answered.length}/{session.totalQuestions ?? 0} answered)
        </h2>
        <div className="space-y-2">
          {session.questions.map((q, i) => (
            <QuestionRow key={q.id} question={q} index={i} />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link href="/interview" className="flex-1">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 h-11 font-semibold">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Another Interview
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="h-11 text-slate-500 hover:text-white hover:bg-white/[0.05] border border-white/[0.08]"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}