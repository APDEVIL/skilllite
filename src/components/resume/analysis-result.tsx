"use client";

import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Briefcase,
  FolderGit2,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { cn, getScoreColor, getScoreRingColor, getScoreLabel } from "@/lib/utils";
import { SkillBadge } from "@/components/skills/skill-badge";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type Resume = inferRouterOutputs<AppRouter>["resume"]["getActiveResume"];

interface AnalysisResultProps {
  resume: NonNullable<Resume>;
}

// ── Mini ATS ring ─────────────────────────────
function ATSRing({ score }: { score: number }) {
  const size = 88;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreRingColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[9px] text-slate-600">ATS</span>
      </div>
    </div>
  );
}

// ── Collapsible section ───────────────────────
function Section({
  title,
  icon: Icon,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-300">{title}</span>
          {count !== undefined && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-500">
              {count}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-600" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.05]">
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}

export function AnalysisResult({ resume }: AnalysisResultProps) {
  const atsScore = resume.atsScore ?? 0;
  const extractedSkills = (resume.extractedSkills as string[]) ?? [];
  const experience = (resume.extractedExperience as {
    company: string; role: string; duration: string; description: string;
  }[]) ?? [];
  const projects = (resume.extractedProjects as {
    name: string; description: string; techStack: string[];
  }[]) ?? [];
  const education = (resume.extractedEducation as {
    institution: string; degree: string; year: string;
  }[]) ?? [];

  // Parse strengths/weaknesses/suggestions from analysisSummary if stored as JSON
  // (analyzeResume returns these — but we only saved analysisSummary in schema.
  //  Display what we have; improve suggestions are in resume.analysisSummary for now)
  const summary = resume.analysisSummary ?? "";

  return (
    <div className="space-y-4">
      {/* Header card — ATS score + summary */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <div className="flex items-start gap-5">
          {/* ATS Ring */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <ATSRing score={atsScore} />
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                getScoreColor(atsScore),
              )}
            >
              {getScoreLabel(atsScore)}
            </span>
          </div>

          {/* Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-bold text-white">AI Summary</h3>
              <Badge
                variant="outline"
                className="text-[10px] px-2 h-5 bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                Prep AI Analysis
              </Badge>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{summary}</p>

            {/* Quick stats row */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-white/[0.05]">
              {[
                { label: "Skills found", value: extractedSkills.length, color: "text-blue-400" },
                { label: "Experience", value: experience.length, color: "text-violet-400" },
                { label: "Projects", value: projects.length, color: "text-cyan-400" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className={cn("text-lg font-extrabold", stat.color)}>{stat.value}</p>
                  <p className="text-[10px] text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed detail sections */}
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 h-auto grid grid-cols-4 gap-1">
          {[
            { value: "skills", label: "Skills", count: extractedSkills.length },
            { value: "experience", label: "Experience", count: experience.length },
            { value: "projects", label: "Projects", count: projects.length },
            { value: "education", label: "Education", count: education.length },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg text-xs font-medium data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30 text-slate-600 transition-all"
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-60">{tab.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Skills tab */}
        <TabsContent value="skills" className="mt-4">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            {extractedSkills.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-6">
                No skills extracted from this resume.
              </p>
            ) : (
              <>
                <p className="text-xs text-slate-600 mb-3">
                  These skills were automatically extracted and added to your profile.
                </p>
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map((skill) => (
                    <SkillBadge
                      key={skill}
                      name={skill}
                      source="resume"
                      size="md"
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Experience tab */}
        <TabsContent value="experience" className="mt-4">
          <div className="space-y-3">
            {experience.length === 0 ? (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 text-center text-sm text-slate-600">
                No work experience found.
              </div>
            ) : (
              experience.map((exp, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-white">{exp.role}</p>
                      <p className="text-xs text-blue-400 font-medium mt-0.5">
                        {exp.company}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-600 bg-white/[0.04] px-2 py-1 rounded-lg flex-shrink-0">
                      {exp.duration}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Projects tab */}
        <TabsContent value="projects" className="mt-4">
          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 text-center text-sm text-slate-600">
                No projects found.
              </div>
            ) : (
              projects.map((proj, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                >
                  <p className="text-sm font-bold text-white mb-1">{proj.name}</p>
                  {proj.description && (
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">
                      {proj.description}
                    </p>
                  )}
                  {proj.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Education tab */}
        <TabsContent value="education" className="mt-4">
          <div className="space-y-3">
            {education.length === 0 ? (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 text-center text-sm text-slate-600">
                No education found.
              </div>
            ) : (
              education.map((edu, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{edu.institution}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {edu.degree}
                      {edu.year && (
                        <span className="ml-2 text-slate-700">· {edu.year}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}