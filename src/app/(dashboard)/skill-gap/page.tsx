"use client";

import {
  GitBranch,
  Loader2,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Star,
  Clock,
} from "lucide-react";
import { api } from "@/trpc/react";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { SkillBadge } from "@/components/skills/skill-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PRIORITY_CONFIG = {
  high: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "High Priority",
  },
  medium: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    label: "Medium",
  },
  low: {
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    label: "Low",
  },
};

export default function SkillGapPage() {
  const { data: reports, isLoading } =
    api.company.getMySkillGapReports.useQuery();
  const { data: roleInterests } = api.user.getRoleInterests.useQuery();

  const latest = reports?.[0];
  const learningPath =
    (latest?.learningPath as {
      skill: string;
      priority: "high" | "medium" | "low";
      estimatedWeeks: number;
      reason: string;
    }[]) ?? [];
  const missingSkills = (latest?.missingSkills as string[]) ?? [];
  const presentSkills = (latest?.presentSkills as string[]) ?? [];
  const strongSkills = (latest?.strongSkills as string[]) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">
            No skill gap analysis yet
          </p>
          <p className="text-xs text-slate-600 mb-5">
            Select a role you're targeting and click "Analyze Skill Gap" to get
            started
          </p>
          <Link href="/roles">
            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 h-9 text-sm">
              Browse Roles
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Skill Gap</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {latest.targetRole?.title
              ? `Analysis for ${latest.targetRole.title}`
              : "Your latest skill gap analysis"}
          </p>
        </div>
        <Link href="/roles">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] h-9 text-xs"
          >
            <GitBranch className="w-3.5 h-3.5 mr-1.5" />
            Re-analyze
          </Button>
        </Link>
      </div>

      {/* Readiness + summary */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
        <div className="flex items-center gap-6">
          <ScoreRing
            score={latest.readinessScore ?? 0}
            size={110}
            label="Readiness"
            sublabel={latest.targetRole?.title ?? ""}
          />
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white mb-2">AI Summary</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {latest.aiSummary}
            </p>
            <div className="flex gap-5 mt-3 pt-3 border-t border-white/[0.05]">
              {[
                {
                  label: "Present",
                  count: presentSkills.length,
                  color: "text-emerald-400",
                },
                {
                  label: "Missing",
                  count: missingSkills.length,
                  color: "text-red-400",
                },
                {
                  label: "Strong",
                  count: strongSkills.length,
                  color: "text-blue-400",
                },
              ].map((s) => (
                <div key={s.label}>
                  <p className={cn("text-xl font-extrabold", s.color)}>
                    {s.count}
                  </p>
                  <p className="text-[10px] text-slate-600">{s.label} skills</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strong skills */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Strong Skills
            </h3>
          </div>
          {strongSkills.length === 0 ? (
            <p className="text-xs text-slate-700">None identified yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {strongSkills.map((s) => (
                <SkillBadge key={s} name={s} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* Present skills */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Present Skills
            </h3>
          </div>
          {presentSkills.length === 0 ? (
            <p className="text-xs text-slate-700">None matched</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {presentSkills.map((s) => (
                <SkillBadge key={s} name={s} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* Missing skills */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Missing Skills
            </h3>
          </div>
          {missingSkills.length === 0 ? (
            <p className="text-xs text-slate-700">Nothing missing!</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((s) => (
                <SkillBadge key={s} name={s} size="sm" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning path */}
      {learningPath.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Recommended Learning Path
          </h2>
          <div className="space-y-2">
            {learningPath.map((item, i) => {
              const p = PRIORITY_CONFIG[item.priority];
              return (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 flex items-start gap-4"
                >
                  {/* Step number */}
                  <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-500">
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white">
                        {item.skill}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-2 h-4 border",
                          p.color,
                          p.bg,
                          p.border,
                        )}
                      >
                        {p.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>

                  {/* Weeks */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    ~{item.estimatedWeeks}w
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        <Link href="/courses" className="flex-1">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 h-10 font-semibold text-sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Find Courses for Missing Skills
          </Button>
        </Link>
        <Link href="/interview">
          <Button
            variant="ghost"
            className="h-10 text-slate-500 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] text-sm"
          >
            Practice Interview
          </Button>
        </Link>
      </div>
    </div>
  );
}