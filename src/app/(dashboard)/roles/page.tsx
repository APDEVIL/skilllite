"use client";

import { useState } from "react";
import {
  Briefcase,
  Loader2,
  GitBranch,
  ChevronRight,
  Check,
  Building2,
  DollarSign,
} from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillBadge } from "@/components/skills/skill-badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function RolesPage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: roles, isLoading } = api.company.listRoles.useQuery({
    genericOnly: true,
  });
  const { data: roleInterests } = api.user.getRoleInterests.useQuery();
  const utils = api.useUtils();

  const setRoleInterests = api.user.setRoleInterests.useMutation({
    onSuccess: () => {
      toast.success("Role interests saved");
      utils.user.getRoleInterests.invalidate();
      setSaving(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setSaving(false);
    },
  });

  const getSkillGap = api.company.getSkillGap.useMutation({
    onSuccess: (data) => {
      toast.success("Skill gap analysis ready");
      router.push("/skill-gap");
    },
    onError: (err) => toast.error(err.message),
  });

  // Pre-fill from existing interests
  useState(() => {
    if (roleInterests) {
      setSelectedIds(new Set(roleInterests.map((ri) => ri.roleId)));
    }
  });

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    setSaving(true);
    setRoleInterests.mutate({ roleIds: Array.from(selectedIds) });
  };

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Roles</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Select roles you're targeting — we'll calculate your fit score and
            skill gaps
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 h-9 text-sm font-semibold flex-shrink-0"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Save ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Roles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles?.map((role) => {
          const isSelected = selectedIds.has(role.id);
          const requiredSkills = (role.requiredSkills as string[]) ?? [];
          const niceSkills = (role.niceToHaveSkills as string[]) ?? [];
          const interest = roleInterests?.find((ri) => ri.roleId === role.id);

          return (
            <div
              key={role.id}
              onClick={() => toggle(role.id)}
              className={cn(
                "rounded-2xl border p-5 cursor-pointer transition-all duration-200 group relative",
                isSelected
                  ? "border-blue-500/40 bg-blue-500/[0.06] shadow-lg shadow-blue-500/10"
                  : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]",
              )}
            >
              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Title + salary */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-bold text-white truncate">
                    {role.title}
                  </p>
                  {role.salaryMin && role.salaryMax && (
                    <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {role.salaryMin}–{role.salaryMax} LPA
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {role.description && (
                <p className="text-xs text-slate-500 mb-3 leading-relaxed line-clamp-2">
                  {role.description}
                </p>
              )}

              {/* Fit score — if saved */}
              {interest?.fitScore !== undefined && (
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                      style={{ width: `${interest.fitScore}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-blue-400 tabular-nums">
                    {interest.fitScore}%
                  </span>
                </div>
              )}

              {/* Required skills */}
              <div className="space-y-2">
                {requiredSkills.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-700 mb-1 uppercase tracking-wider font-semibold">
                      Required
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {requiredSkills.slice(0, 5).map((s) => (
                        <SkillBadge key={s} name={s} size="sm" />
                      ))}
                      {requiredSkills.length > 5 && (
                        <span className="text-[10px] text-slate-700 px-2 py-0.5">
                          +{requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Analyze skill gap button */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      getSkillGap.mutate({ roleId: role.id });
                    }}
                    disabled={getSkillGap.isPending}
                    className="w-full h-7 text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                    variant="ghost"
                  >
                    {getSkillGap.isPending ? (
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    ) : (
                      <GitBranch className="w-3 h-3 mr-1.5" />
                    )}
                    Analyze Skill Gap
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}