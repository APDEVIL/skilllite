"use client";

import { X } from "lucide-react";
import { cn, PROFICIENCY_LABELS, PROFICIENCY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/utils";

interface SkillBadgeProps {
  name: string;
  category?: string;
  proficiencyLevel?: number;
  source?: string;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md";
  showCategory?: boolean;
  showProficiency?: boolean;
  selected?: boolean;
  className?: string;
}

export function SkillBadge({
  name,
  category,
  proficiencyLevel,
  source,
  onRemove,
  onClick,
  size = "md",
  showCategory = false,
  showProficiency = false,
  selected = false,
  className,
}: SkillBadgeProps) {
  const categoryStyle = category
    ? CATEGORY_COLORS[category] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30"
    : "bg-slate-500/20 text-slate-400 border-slate-500/30";

  const proficiencyStyle = proficiencyLevel
    ? PROFICIENCY_COLORS[proficiencyLevel] ?? ""
    : "";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all duration-200",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1.5 text-xs",
        selected
          ? "bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm shadow-blue-500/10"
          : categoryStyle,
        onClick && !selected && "cursor-pointer hover:brightness-125 hover:scale-105",
        onClick && selected && "cursor-pointer",
        className,
      )}
    >
      {/* Source dot — resume vs manual */}
      {source === "resume" && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0"
          title="Extracted from resume"
        />
      )}

      <span className="leading-none">{name}</span>

      {/* Category label */}
      {showCategory && category && (
        <span className="opacity-50 font-normal">
          · {CATEGORY_LABELS[category] ?? category}
        </span>
      )}

      {/* Proficiency badge */}
      {showProficiency && proficiencyLevel && (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border ml-0.5",
            proficiencyStyle,
          )}
        >
          {PROFICIENCY_LABELS[proficiencyLevel]}
        </span>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10"
          aria-label={`Remove ${name}`}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}