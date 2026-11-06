"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  cn,
  CATEGORY_LABELS,
  PROFICIENCY_LABELS,
  PROFICIENCY_COLORS,
} from "@/lib/utils";

const CATEGORIES = [
  "all",
  "frontend",
  "backend",
  "database",
  "devops",
  "ai_ml",
  "cs_fundamentals",
  "soft",
] as const;

const CATEGORY_DOTS: Record<string, string> = {
  frontend:        "bg-cyan-400",
  backend:         "bg-violet-400",
  database:        "bg-amber-400",
  devops:          "bg-orange-400",
  ai_ml:           "bg-pink-400",
  cs_fundamentals: "bg-emerald-400",
  soft:            "bg-blue-400",
};

interface SkillPickerProps {
  children: React.ReactNode;
}

export function SkillPicker({ children }: SkillPickerProps) {
  const [open, setOpen]                       = useState(false);
  const [query, setQuery]                     = useState("");
  const [activeCategory, setActiveCategory]   = useState<string>("all");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [proficiency, setProficiency]         = useState(1);

  const utils = api.useUtils();
  const { data: allSkills }  = api.user.getAllSkills.useQuery();
  const { data: userSkills } = api.user.getSkills.useQuery();

  const addSkill = api.user.addSkill.useMutation({
    onSuccess: () => {
      toast.success("Skill added to your profile");
      void utils.user.getSkills.invalidate();
      setSelectedSkillId(null);
      setProficiency(1);
    },
    onError: (err) => toast.error(err.message),
  });

  const userSkillIds = useMemo(
    () => new Set(userSkills?.map((us) => us.skillId) ?? []),
    [userSkills],
  );

  const filtered = useMemo(() => {
    if (!allSkills) return [];
    return allSkills.filter((s) => {
      const matchesQuery    = s.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === "all" || s.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [allSkills, query, activeCategory]);

  const selectedSkill = allSkills?.find((s) => s.id === selectedSkillId);

  const handleAdd = () => {
    if (!selectedSkillId) return;
    addSkill.mutate({ skillId: selectedSkillId, proficiencyLevel: proficiency });
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setQuery("");
      setActiveCategory("all");
      setSelectedSkillId(null);
      setProficiency(1);
    }
    setOpen(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/*
        ── LAYOUT STRATEGY ──────────────────────────────────────────────
        The modal is a fixed-height flex column:
          [Header]        — fixed, never scrolls
          [Search]        — fixed
          [Category tabs] — fixed, horizontal scroll internally
          [Skill list]    — flex-1, overflow-y-auto  ← only this scrolls
          [Bottom panel]  — fixed, slides up when skill selected
        This guarantees the Add button is ALWAYS visible and nothing clips.
        ─────────────────────────────────────────────────────────────────
      */}
      <DialogContent
        className="
          bg-[#0b1120] border border-white/[0.08] text-white
          w-full max-w-md p-0 gap-0 rounded-2xl
          shadow-2xl shadow-black/70
          flex flex-col
          overflow-hidden
        "
        style={{ maxHeight: "min(680px, 88vh)" }}
      >
        {/* ── HEADER ── */}
        <DialogHeader className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <DialogTitle className="text-[15px] font-bold text-white tracking-tight">
            Add Skills to Profile
          </DialogTitle>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Select a skill · set proficiency · add to profile
          </p>
        </DialogHeader>

        {/* ── SEARCH ── */}
        <div className="flex-shrink-0 px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search — React, Python, Docker…"
              className="
                pl-9 pr-8 h-9 text-[13px]
                bg-white/[0.04] border-white/[0.08]
                text-slate-200 placeholder:text-slate-600
                focus-visible:ring-1 focus-visible:ring-blue-500/40
                focus-visible:border-blue-500/30 rounded-xl
              "
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── CATEGORY TABS — scrollable, no clip ── */}
        <div
          className="flex-shrink-0 px-4 pb-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex gap-1.5" style={{ width: "max-content" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-semibold",
                  "border transition-all duration-150 whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/25"
                    : "text-slate-500 border-white/[0.07] hover:text-slate-300 hover:bg-white/[0.04]",
                )}
              >
                {cat === "all" ? "All" : (CATEGORY_LABELS[cat] ?? cat)}
              </button>
            ))}
          </div>
        </div>

        {/* ── SKILL LIST — this is the ONLY scrolling region ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-2">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-600 text-sm">
              {query ? `No results for "${query}"` : "No skills in this category"}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((skill) => {
                const alreadyAdded = userSkillIds.has(skill.id);
                const isSelected   = selectedSkillId === skill.id;
                const dot          = CATEGORY_DOTS[skill.category] ?? "bg-slate-500";

                return (
                  <button
                    key={skill.id}
                    disabled={alreadyAdded}
                    onClick={() =>
                      setSelectedSkillId(isSelected ? null : skill.id)
                    }
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                      "text-left transition-all duration-150 group",
                      alreadyAdded
                        ? "opacity-35 cursor-not-allowed"
                        : isSelected
                          ? "bg-blue-500/10 ring-1 ring-blue-500/20"
                          : "hover:bg-white/[0.04] cursor-pointer",
                    )}
                  >
                    {/* Dot */}
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-150",
                        dot,
                        isSelected ? "scale-125" : "",
                      )}
                    />

                    {/* Name */}
                    <span
                      className={cn(
                        "flex-1 text-[13px] font-medium transition-colors duration-150",
                        alreadyAdded
                          ? "text-slate-500"
                          : isSelected
                            ? "text-white"
                            : "text-slate-300 group-hover:text-white",
                      )}
                    >
                      {skill.name}
                    </span>

                    {/* Category label — hidden on very small */}
                    <span className="text-[10px] text-slate-600 font-medium flex-shrink-0">
                      {CATEGORY_LABELS[skill.category] ?? skill.category}
                    </span>

                    {/* Radio / check */}
                    {alreadyAdded ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : isSelected ? (
                      <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-white/[0.12] flex-shrink-0 group-hover:border-white/25 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── BOTTOM PANEL — always at bottom, never overlaps list ── */}
        <div
          className={cn(
            "flex-shrink-0 border-t border-white/[0.06] bg-[#0d1428]",
            "transition-all duration-200 ease-in-out overflow-hidden",
            selectedSkill
              ? "opacity-100"
              : "max-h-0 border-t-0 opacity-0 pointer-events-none",
          )}
        >
          {selectedSkill && (
            <div className="px-4 py-3 space-y-3">

              {/* Selected skill row */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    CATEGORY_DOTS[selectedSkill.category] ?? "bg-slate-500",
                  )}
                />
                <span className="text-[13px] font-semibold text-white flex-1">
                  {selectedSkill.name}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Proficiency
                </span>
              </div>

              {/* Proficiency row — all 5 levels, equal width */}
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setProficiency(level)}
                    className={cn(
                      "py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide",
                      "border transition-all duration-150 text-center",
                      proficiency === level
                        ? cn(PROFICIENCY_COLORS[level], "scale-[1.03]")
                        : "text-slate-600 border-white/[0.07] hover:text-slate-400 hover:border-white/[0.14]",
                    )}
                  >
                    {PROFICIENCY_LABELS[level]}
                  </button>
                ))}
              </div>

              {/* Add button — full width, always fully visible */}
              <Button
                onClick={handleAdd}
                disabled={addSkill.isPending}
                className="
                  w-full h-9 rounded-xl
                  bg-gradient-to-r from-blue-600 to-violet-600
                  hover:from-blue-500 hover:to-violet-500
                  text-white text-[13px] font-semibold
                  border-0 shadow-lg shadow-blue-500/20
                  transition-all duration-150
                "
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                {addSkill.isPending
                  ? "Adding…"
                  : `Add ${selectedSkill.name}`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}