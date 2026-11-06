"use client";

import { useState } from "react";
import {
  Mic2,
  Play,
  Loader2,
  ChevronRight,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { SessionCard } from "@/components/interview/session-card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const DIFFICULTIES = [
  {
    value: "easy" as const,
    label: "Easy",
    desc: "Fundamentals & basics",
    color:
      "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 data-[active=true]:border-emerald-500/60 data-[active=true]:bg-emerald-500/20",
  },
  {
    value: "medium" as const,
    label: "Medium",
    desc: "Intermediate concepts",
    color:
      "border-amber-500/30 text-amber-400 bg-amber-500/10 data-[active=true]:border-amber-500/60 data-[active=true]:bg-amber-500/20",
  },
  {
    value: "hard" as const,
    label: "Hard",
    desc: "Advanced & system design",
    color:
      "border-red-500/30 text-red-400 bg-red-500/10 data-[active=true]:border-red-500/60 data-[active=true]:bg-red-500/20",
  },
];

const QUESTION_COUNTS = [3, 5, 7, 10];

export default function InterviewPage() {
  const router = useRouter();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [questionCount, setQuestionCount] = useState(5);

  const { data: roles } = api.company.listRoles.useQuery({ genericOnly: true });
  const { data: roleInterests } = api.user.getRoleInterests.useQuery();
  const { data: sessions } = api.interview.getMySessions.useQuery();

  const startSession = api.interview.startSession.useMutation({
    onSuccess: (data) => {
      router.push(`/interview/${data.sessionId}`);
    },
    onError: (err) => toast.error(err.message),
  });

  // Show interested roles first
  const interestRoleIds = new Set(
    roleInterests?.map((ri) => ri.roleId) ?? [],
  );
  const sortedRoles = [...(roles ?? [])].sort((a, b) => {
    const aInterested = interestRoleIds.has(a.id) ? -1 : 1;
    const bInterested = interestRoleIds.has(b.id) ? -1 : 1;
    return aInterested - bInterested;
  });

  const handleStart = () => {
    if (!selectedRoleId) {
      toast.error("Please select a role first");
      return;
    }
    startSession.mutate({
      roleId: selectedRoleId,
      companyId: selectedCompanyId ?? undefined,
      difficulty,
      totalQuestions: questionCount,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-white">Mock Interview</h1>
        <p className="text-xs text-slate-600 mt-0.5">
          AI-powered interview practice — get scored and receive detailed
          feedback
        </p>
      </div>

      {/* Setup card */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 space-y-5">
        <h2 className="text-sm font-bold text-white">Setup Your Interview</h2>

        {/* Role selection */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            1. Select Role
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {sortedRoles?.map((role) => {
              const isSelected = selectedRoleId === role.id;
              const isInterested = interestRoleIds.has(role.id);
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all duration-200 flex items-center gap-3",
                    isSelected
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                      : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/[0.12] hover:text-slate-300",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      isSelected ? "bg-blue-500/20" : "bg-white/[0.04]",
                    )}
                  >
                    <Briefcase
                      className={cn(
                        "w-4 h-4",
                        isSelected ? "text-blue-400" : "text-slate-600",
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {role.title}
                    </p>
                    {isInterested && (
                      <p className="text-[10px] text-blue-400/70 mt-0.5">
                        ★ Interested
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            2. Difficulty
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                data-active={difficulty === d.value}
                onClick={() => setDifficulty(d.value)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all duration-200",
                  d.color,
                )}
              >
                <p className="text-xs font-bold">{d.label}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            3. Number of Questions
          </p>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={cn(
                  "w-12 h-10 rounded-xl border text-sm font-bold transition-all duration-200",
                  questionCount === n
                    ? "border-blue-500/40 bg-blue-500/20 text-blue-300"
                    : "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:text-slate-300 hover:border-white/[0.12]",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <Button
          onClick={handleStart}
          disabled={!selectedRoleId || startSession.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 h-11 font-semibold"
        >
          {startSession.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating questions...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start Interview
            </>
          )}
        </Button>
      </div>

      {/* Past sessions */}
      {sessions && sessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Past Sessions ({sessions.length})
            </h2>
          </div>
          <div className="space-y-2">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}