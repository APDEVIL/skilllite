"use client";

import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import {
  BookOpen,
  Search,
  ExternalLink,
  Star,
  Clock,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, DIFFICULTY_COLORS } from "@/lib/utils";

const PROVIDER_COLORS: Record<string, string> = {
  Udemy:    "bg-orange-500/15 text-orange-400 border-orange-500/25",
  Coursera: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  YouTube:  "bg-red-500/15 text-red-400 border-red-500/25",
  edX:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

function CourseCard({
  course,
}: {
  course: {
    id: string;
    title: string;
    provider: string;
    url: string;
    description?: string | null;
    durationHours?: number | null;
    isFree: boolean;
    rating?: number | null;
    skillsCovered?: unknown;
    difficulty: string;
    matchScore?: number;
  };
}) {
  const skills = (course.skillsCovered as string[]) ?? [];
  const providerColor =
    PROVIDER_COLORS[course.provider] ??
    "bg-slate-500/15 text-slate-400 border-slate-500/25";

  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 flex flex-col gap-4 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-200">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="outline" className={cn("text-[10px] px-2 h-5 border", providerColor)}>
            {course.provider}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2 h-5 border",
              DIFFICULTY_COLORS[course.difficulty] ?? DIFFICULTY_COLORS.medium,
            )}
          >
            {course.difficulty}
          </Badge>
          {course.isFree && (
            <Badge variant="outline" className="text-[10px] px-2 h-5 border bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
              Free
            </Badge>
          )}
          {course.matchScore !== undefined && course.matchScore > 0 && (
            <Badge variant="outline" className="text-[10px] px-2 h-5 border bg-blue-500/15 text-blue-400 border-blue-500/25">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              {course.matchScore} match
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-blue-100 transition-colors">
          {course.title}
        </h3>
      </div>

      {course.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {course.description}
        </p>
      )}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-500 border border-white/[0.06]"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="text-[10px] text-slate-700">+{skills.length - 4} more</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-white/[0.05] mt-auto">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          {course.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-amber-400 font-semibold">{course.rating}</span>
            </span>
          )}
          {course.durationHours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.durationHours}h
            </span>
          )}
        </div>
        <a href={course.url} target="_blank" rel="noopener noreferrer">
          <Button
            size="sm"
            className="h-8 text-xs bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 gap-1.5"
          >
            Enroll <ExternalLink className="w-3 h-3" />
          </Button>
        </a>
      </div>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-3">
      <Skeleton className="h-4 w-24 bg-white/[0.05]" />
      <Skeleton className="h-5 w-full bg-white/[0.05]" />
      <Skeleton className="h-3 w-3/4 bg-white/[0.05]" />
      <Skeleton className="h-8 w-full bg-white/[0.05]" />
    </div>
  );
}

type TabValue = "all" | "recommended";

export default function CoursesPage() {
  const [tab, setTab]                           = useState<TabValue>("all");
  const [query, setQuery]                       = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [freeOnly, setFreeOnly]                 = useState(false);

  const { data: allCourses, isLoading } = api.course.list.useQuery({});
  const { data: latestReport }          = api.company.getMySkillGapReports.useQuery();

  const missingSkills = useMemo(
    () => (latestReport?.[0]?.missingSkills as string[]) ?? [],
    [latestReport],
  );

  const { data: recommended } = api.course.getRecommended.useQuery(
    { missingSkills },
    { enabled: missingSkills.length > 0 },
  );

  const filtered = useMemo(() => {
    if (!allCourses) return [];
    return allCourses.filter((c) => {
      const skills = (c.skillsCovered as string[]) ?? [];
      const matchesQuery =
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.provider.toLowerCase().includes(query.toLowerCase()) ||
        skills.some((s) => s.toLowerCase().includes(query.toLowerCase()));
      const matchesDiff = difficultyFilter === "all" || c.difficulty === difficultyFilter;
      const matchesFree = !freeOnly || c.isFree;
      return matchesQuery && matchesDiff && matchesFree;
    });
  }, [allCourses, query, difficultyFilter, freeOnly]);

  return (
    <div className="w-full space-y-5">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Courses</h1>
        <p className="text-slate-500 text-sm mt-1">
          Curated learning resources to close your skill gaps and upskill faster.
        </p>
      </div>

      {/* ── Search (full width, above tabs) ── */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, skills, providers..."
          className="pl-10 w-full bg-white/[0.04] border-white/[0.08] text-slate-300 placeholder:text-slate-700 focus-visible:ring-blue-500/30 h-10 rounded-xl"
        />
      </div>

      {/* ── Tabs + Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Custom tab pills — replaces shadcn Tabs to avoid overflow bugs */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 flex-shrink-0">
          {missingSkills.length > 0 && (
            <button
              onClick={() => setTab("recommended")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                tab === "recommended"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-600 hover:text-slate-400",
              )}
            >
              <Sparkles className="w-3 h-3" />
              Recommended
              <span className="text-[10px] opacity-60">{recommended?.length ?? 0}</span>
            </button>
          )}
          <button
            onClick={() => setTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              tab === "all"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-600 hover:text-slate-400",
            )}
          >
            All Courses
          </button>
        </div>

        {/* Difficulty + free filters */}
        <div className="flex gap-2 flex-wrap">
          {["all", "easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 capitalize",
                difficultyFilter === d
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "text-slate-600 border-white/[0.06] hover:text-slate-400",
              )}
            >
              {d === "all" ? "All Levels" : d}
            </button>
          ))}
          <button
            onClick={() => setFreeOnly(!freeOnly)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
              freeOnly
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "text-slate-600 border-white/[0.06] hover:text-slate-400",
            )}
          >
            Free only
          </button>
        </div>
      </div>

      {/* ── Recommended content ── */}
      {tab === "recommended" && (
        <div className="space-y-4">
          {missingSkills.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/[0.06] border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <p className="text-xs text-slate-400">
                Based on your skill gap:{" "}
                <span className="text-blue-400 font-medium">
                  {missingSkills.slice(0, 3).join(", ")}
                  {missingSkills.length > 3 && ` +${missingSkills.length - 3} more`}
                </span>
              </p>
            </div>
          )}
          {!recommended || recommended.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <GraduationCap className="w-10 h-10 text-slate-700" />
              <p className="text-sm text-slate-600">
                No recommendations yet. Run a skill gap analysis first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {recommended.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── All courses content ── */}
      {tab === "all" && (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <CourseSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <BookOpen className="w-10 h-10 text-slate-700" />
              <p className="text-sm text-slate-600">No courses match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}