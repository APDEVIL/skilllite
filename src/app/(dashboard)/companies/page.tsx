"use client";

import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Building2,
  Search,
  Check,
  Loader2,
  ExternalLink,
  Sparkles,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getScoreColor } from "@/lib/utils";

const SIZE_LABELS: Record<string, string> = {
  startup: "Startup",
  mid: "Mid-size",
  large: "Large",
  mnc: "MNC",
};

const SIZE_COLORS: Record<string, string> = {
  startup: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  mid: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  large: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  mnc: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

function CompanySkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-3">
      <Skeleton className="h-5 w-32 bg-white/[0.05]" />
      <Skeleton className="h-3 w-20 bg-white/[0.05]" />
      <Skeleton className="h-10 w-full bg-white/[0.05]" />
      <Skeleton className="h-8 w-full bg-white/[0.05]" />
    </div>
  );
}

export default function CompaniesPage() {
  const [query, setQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const utils = api.useUtils();
  const { data: companies, isLoading } = api.company.list.useQuery();
  const { data: interests } = api.user.getCompanyInterests.useQuery();

  const recalculateFit = api.user.recalculateFitScores.useMutation();

  const setInterests = api.user.setCompanyInterests.useMutation({
    onSuccess: () => {
      toast.success("Company interests updated!");
      utils.user.getCompanyInterests.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setPendingIds(new Set()),
  });

  const selectedIds = useMemo(
    () => new Set(interests?.map((i) => i.companyId) ?? []),
    [interests],
  );

  const fitMap = useMemo(() => {
    const map: Record<string, number> = {};
    interests?.forEach((i) => {
      map[i.companyId] = i.fitScore ?? 0;
    });
    return map;
  }, [interests]);

  const filtered = useMemo(() => {
    if (!companies) return [];
    return companies.filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.industry?.toLowerCase().includes(query.toLowerCase()) ?? false);
      const matchesSize =
        sizeFilter === "all" || c.size === sizeFilter;
      return matchesQuery && matchesSize;
    });
  }, [companies, query, sizeFilter]);

  const toggleCompany = (companyId: string) => {
    const next = new Set(selectedIds);
    if (next.has(companyId)) {
      next.delete(companyId);
    } else {
      next.add(companyId);
    }
    setPendingIds(new Set([companyId]));
    setInterests.mutate({ companyIds: Array.from(next) });
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Companies</h1>
          <p className="text-slate-500 text-sm mt-1">
            Select companies you're targeting. We'll calculate your fit score for each.
          </p>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400">
              {selectedIds.size} selected
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies or industries..."
            className="pl-10 bg-white/[0.04] border-white/[0.08] text-slate-300 placeholder:text-slate-700 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/40 h-10 rounded-xl"
          />
        </div>

        {/* Size filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {["all", "mnc", "large", "mid", "startup"].map((size) => (
            <button
              key={size}
              onClick={() => setSizeFilter(size)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
                sizeFilter === size
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "text-slate-600 border-white/[0.06] hover:text-slate-400 hover:bg-white/[0.04]",
              )}
            >
              {size === "all" ? "All" : SIZE_LABELS[size]}
            </button>
          ))}
        </div>
      </div>

      {/* Companies grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CompanySkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
            <Building2 className="w-6 h-6 text-slate-600" />
          </div>
          <p className="text-slate-500 text-sm">No companies found for "{query}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((company) => {
            const isSelected = selectedIds.has(company.id);
            const isPending = pendingIds.has(company.id) && setInterests.isPending;
            const fitScore = fitMap[company.id];
            const roleCount = (company.roles as unknown[])?.length ?? 0;

            return (
              <div
                key={company.id}
                className={cn(
                  "group rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200",
                  isSelected
                    ? "border-blue-500/30 bg-blue-500/[0.06]"
                    : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]",
                )}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Logo placeholder */}
                      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-sm font-bold text-slate-400">
                        {company.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {company.name}
                        </p>
                      </div>
                    </div>
                    {company.industry && (
                      <p className="text-xs text-slate-600">{company.industry}</p>
                    )}
                  </div>

                  {/* Selected check */}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {company.size && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-2 h-5 border",
                        SIZE_COLORS[company.size] ?? "bg-slate-500/15 text-slate-400 border-slate-500/25",
                      )}
                    >
                      {SIZE_LABELS[company.size]}
                    </Badge>
                  )}
                  {roleCount > 0 && (
                    <span className="text-[10px] text-slate-700">
                      {roleCount} role{roleCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Fit score — shown if selected */}
                {isSelected && fitScore !== undefined && (
                  <div className="rounded-xl bg-white/[0.04] p-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Your fit score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            fitScore >= 80
                              ? "bg-emerald-500"
                              : fitScore >= 60
                                ? "bg-blue-500"
                                : fitScore >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500",
                          )}
                          style={{ width: `${fitScore}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-extrabold tabular-nums",
                          getScoreColor(fitScore),
                        )}
                      >
                        {fitScore}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Toggle button */}
                <Button
                  size="sm"
                  onClick={() => toggleCompany(company.id)}
                  disabled={isPending}
                  variant={isSelected ? "outline" : "default"}
                  className={cn(
                    "w-full h-9 text-xs font-semibold transition-all duration-200",
                    isSelected
                      ? "border-blue-500/30 text-blue-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 bg-transparent"
                      : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0",
                  )}
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isSelected ? (
                    "Remove"
                  ) : (
                    "Track This Company"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}