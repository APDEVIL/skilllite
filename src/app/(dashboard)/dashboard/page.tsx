"use client";

import { api } from "@/trpc/react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ScoreRing } from "@/components/dashboard/score-ring";
import {
  FileText,
  Mic2,
  Zap,
  Building2,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn, timeAgo, getScoreColor, DIFFICULTY_COLORS } from "@/lib/utils";

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-72 rounded-2xl bg-white/[0.04] col-span-1" />
        <Skeleton className="h-72 rounded-2xl bg-white/[0.04] lg:col-span-2" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: user } = api.auth.me.useQuery();
  const { data: profile } = api.user.getProfile.useQuery();
  const { data: activeResume } = api.resume.getActiveResume.useQuery();
  const { data: userSkills } = api.user.getSkills.useQuery();
  const { data: sessions } = api.interview.getMySessions.useQuery();
  const { data: companyInterests } = api.user.getCompanyInterests.useQuery();
  const { data: skillGapReports } = api.company.getMySkillGapReports.useQuery();

  const isLoading = !user;

  if (isLoading) return <PageSkeleton />;

  // Derived stats
  const completedSessions =
    sessions?.filter((s) => s.status === "completed") ?? [];
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((a, s) => a + (s.overallScore ?? 0), 0) /
            completedSessions.length,
        )
      : 0;

  const latestReport = skillGapReports?.[0];
  const readinessScore = latestReport?.readinessScore ?? 0;

  const topCompanyFit =
    companyInterests && companyInterests.length > 0
      ? Math.max(...companyInterests.map((c) => c.fitScore ?? 0))
      : 0;

  const recentSessions = completedSessions.slice(0, 4);

  return (
    <div className="space-y-6 stagger-children max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            {user?.name?.split(" ")[0] ?? "there"}
          </span>{" "}
          👋
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Here's your preparation overview for today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Skills Added"
          value={userSkills?.length ?? 0}
          subtitle="across all categories"
          icon={Zap}
          iconColor="text-blue-400"
          trend={
            userSkills && userSkills.length > 0
              ? { value: `${userSkills.length} skills`, positive: true }
              : undefined
          }
        />
        <StatCard
          title="Interviews Done"
          value={completedSessions.length}
          subtitle="mock sessions completed"
          icon={Mic2}
          iconColor="text-violet-400"
        />
        <StatCard
          title="Avg Interview Score"
          value={avgScore > 0 ? `${avgScore}%` : "—"}
          subtitle={avgScore > 0 ? "across all sessions" : "No sessions yet"}
          icon={CheckCircle2}
          iconColor={
            avgScore >= 70
              ? "text-emerald-400"
              : avgScore > 0
                ? "text-amber-400"
                : "text-slate-600"
          }
        />
        <StatCard
          title="Companies Tracking"
          value={companyInterests?.length ?? 0}
          subtitle="companies selected"
          icon={Building2}
          iconColor="text-cyan-400"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness score card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Role Readiness
            </h2>
            {latestReport && (
              <Link href="/skill-gap">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-600 hover:text-blue-400 px-2 h-7"
                >
                  Details <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          <ScoreRing
            score={readinessScore}
            size={140}
            sublabel={
              latestReport
                ? `for ${latestReport.targetRole?.title ?? "target role"}`
                : "No analysis yet"
            }
          />

          {!latestReport && (
            <Link href="/roles" className="w-full">
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 text-xs"
              >
                Analyze Skill Gap
              </Button>
            </Link>
          )}

          {/* Mini stats */}
          {latestReport && (
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                <p className="text-lg font-bold text-emerald-400">
                  {(latestReport.presentSkills as string[])?.length ?? 0}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">Skills Match</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3 text-center">
                <p className="text-lg font-bold text-red-400">
                  {(latestReport.missingSkills as string[])?.length ?? 0}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">Gaps Found</p>
              </div>
            </div>
          )}
        </div>

        {/* Right column — recent interviews + quick actions */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Recent interview sessions */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Recent Interviews
              </h2>
              <Link href="/interview">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-600 hover:text-blue-400 px-2 h-7"
                >
                  New Session <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center">
                  <Mic2 className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-sm text-slate-600 text-center">
                  No interviews yet. Start your first mock session.
                </p>
                <Link href="/interview">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 text-xs"
                  >
                    Start Interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/interview/${session.id}/result`}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-200 border border-transparent hover:border-white/[0.06]"
                  >
                    {/* Score badge */}
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <span
                        className={cn(
                          "text-lg font-extrabold",
                          getScoreColor(session.overallScore ?? 0),
                        )}
                      >
                        {session.overallScore ?? "—"}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-300 truncate">
                        {session.role?.title ?? "Unknown Role"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          className={cn(
                            "text-[10px] px-2 py-0 h-4 border",
                            DIFFICULTY_COLORS[session.difficulty ?? "medium"],
                          )}
                          variant="outline"
                        >
                          {session.difficulty}
                        </Badge>
                        <span className="text-[10px] text-slate-700 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(session.createdAt)}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                href: "/resume",
                icon: FileText,
                label: activeResume ? "View Resume" : "Upload Resume",
                desc: activeResume
                  ? `ATS: ${activeResume.atsScore ?? "—"}`
                  : "Not uploaded",
                color: "text-blue-400",
                alert: !activeResume,
              },
              {
                href: "/skill-gap",
                icon: AlertCircle,
                label: "Skill Gap Report",
                desc: latestReport
                  ? `${(latestReport.missingSkills as string[])?.length ?? 0} gaps found`
                  : "Run analysis",
                color: "text-violet-400",
                alert: !latestReport,
              },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2">
                    <action.icon
                      className={cn("w-4 h-4", action.color)}
                    />
                    {action.alert && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Company fit scores */}
      {companyInterests && companyInterests.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Company Fit Scores
            </h2>
            <Link href="/companies">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-600 hover:text-blue-400 px-2 h-7"
              >
                Manage <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {companyInterests.slice(0, 5).map((interest) => (
              <div
                key={interest.id}
                className="rounded-xl bg-white/[0.04] p-3 text-center border border-white/[0.05]"
              >
                <p className="text-xs text-slate-500 font-medium truncate mb-1.5">
                  {interest.company.name}
                </p>
                <p
                  className={cn(
                    "text-2xl font-extrabold",
                    getScoreColor(interest.fitScore ?? 0),
                  )}
                >
                  {interest.fitScore ?? 0}
                  <span className="text-xs font-normal text-slate-600">%</span>
                </p>
                {/* Mini bar */}
                <div className="mt-2 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      (interest.fitScore ?? 0) >= 80
                        ? "bg-emerald-500"
                        : (interest.fitScore ?? 0) >= 60
                          ? "bg-blue-500"
                          : (interest.fitScore ?? 0) >= 40
                            ? "bg-amber-500"
                            : "bg-red-500",
                    )}
                    style={{ width: `${interest.fitScore ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}