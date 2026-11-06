"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, getScoreColor, getScoreLabel, DIFFICULTY_COLORS, timeAgo } from "@/lib/utils";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type Session = inferRouterOutputs<AppRouter>["interview"]["getMySessions"][0];

interface SessionCardProps {
  session: Session;
}

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Completed",
  },
  in_progress: {
    icon: Timer,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    label: "In Progress",
  },
  abandoned: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Abandoned",
  },
  pending: {
    icon: Timer,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    label: "Pending",
  },
};

export function SessionCard({ session }: SessionCardProps) {
  const status = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const isCompleted = session.status === "completed";
  const score = session.overallScore ?? 0;

  return (
    <Link
      href={
        isCompleted
          ? `/interview/${session.id}/result`
          : `/interview/${session.id}`
      }
      className="group block"
    >
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-200">
        <div className="flex items-start gap-4">
          {/* Score or status circle */}
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border",
              isCompleted
                ? "bg-white/[0.04] border-white/[0.08]"
                : cn(status.bg, "border-white/[0.06]"),
            )}
          >
            {isCompleted ? (
              <>
                <span
                  className={cn(
                    "text-xl font-extrabold leading-none tabular-nums",
                    getScoreColor(score),
                  )}
                >
                  {score}
                </span>
                <span className="text-[9px] text-slate-700 mt-0.5">score</span>
              </>
            ) : (
              <StatusIcon className={cn("w-6 h-6", status.color)} />
            )}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-200 truncate">
                  {session.role?.title ?? "Unknown Role"}
                </p>
                {session.company && (
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" />
                    {session.company.name}
                  </p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-2 py-0 h-4 border",
                  DIFFICULTY_COLORS[session.difficulty ?? "medium"],
                )}
              >
                {session.difficulty}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-2 py-0 h-4 border",
                  status.color,
                  status.bg,
                  "border-white/[0.08]",
                )}
              >
                {status.label}
              </Badge>

              <span className="text-[10px] text-slate-700 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {timeAgo(session.createdAt)}
              </span>

              {session.durationMinutes && (
                <span className="text-[10px] text-slate-700">
                  · {session.durationMinutes}m
                </span>
              )}
            </div>

            {/* Score breakdown — only for completed */}
            {isCompleted && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.05]">
                {[
                  { label: "Technical", score: session.technicalScore ?? 0 },
                  { label: "Behavioral", score: session.behavioralScore ?? 0 },
                  { label: "Overall", score: session.overallScore ?? 0 },
                ].map((item) => (
                  <div key={item.label}>
                    <p
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        getScoreColor(item.score),
                      )}
                    >
                      {item.score}
                      <span className="text-[10px] font-normal text-slate-700">
                        /100
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}