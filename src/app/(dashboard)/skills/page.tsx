"use client";

import { Plus, Zap, Trash2, Loader2, SlidersHorizontal } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/skills/skill-badge";
import { SkillPicker } from "@/components/skills/skil-picker";
import { toast } from "sonner";
import { cn, CATEGORY_LABELS } from "@/lib/utils";

const CATEGORIES = [
  "frontend",
  "backend",
  "database",
  "devops",
  "ai_ml",
  "cs_fundamentals",
  "soft",
] as const;

export default function SkillsPage() {
  const { data: userSkills, isLoading } = api.user.getSkills.useQuery();
  const utils = api.useUtils();

  const removeSkill = api.user.removeSkill.useMutation({
    onSuccess: () => {
      toast.success("Skill removed");
      utils.user.getSkills.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] =
        userSkills?.filter((us) => us.skill.category === cat) ?? [];
      return acc;
    },
    {} as Record<string, typeof userSkills>,
  );

  const totalSkills = userSkills?.length ?? 0;
  const resumeSkills =
    userSkills?.filter((us) => us.source === "resume").length ?? 0;
  const manualSkills = totalSkills - resumeSkills;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Skills</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage your technical and soft skills
          </p>
        </div>
        <SkillPicker>
          <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 h-9 text-sm font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </SkillPicker>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Skills", value: totalSkills, color: "text-blue-400" },
          {
            label: "From Resume",
            value: resumeSkills,
            color: "text-violet-400",
          },
          {
            label: "Added Manually",
            value: manualSkills,
            color: "text-cyan-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-center"
          >
            <p className={cn("text-2xl font-extrabold", stat.color)}>
              {stat.value}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {totalSkills === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">
            No skills yet
          </p>
          <p className="text-xs text-slate-600 mb-4">
            Upload your resume or add skills manually to get started
          </p>
          <SkillPicker>
            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0 text-sm h-9">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Skill
            </Button>
          </SkillPicker>
        </div>
      )}

      {/* Grouped skills */}
      {totalSkills > 0 && (
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const skills = grouped[cat];
            if (!skills || skills.length === 0) return null;

            return (
              <div
                key={cat}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {CATEGORY_LABELS[cat] ?? cat}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-600 font-bold">
                      {skills.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((us) => (
                    <SkillBadge
                      key={us.id}
                      name={us.skill.name}
                      category={us.skill.category}
                      proficiencyLevel={us.proficiencyLevel}
                      source={us.source ?? undefined}
                      showProficiency
                      onRemove={() =>
                        removeSkill.mutate({ skillId: us.skillId })
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {totalSkills > 0 && (
        <div className="flex items-center gap-4 text-[11px] text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Dot = extracted from resume
          </div>
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3" />
            Hover badge to remove
          </div>
        </div>
      )}
    </div>
  );
}