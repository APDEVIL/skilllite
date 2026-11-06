import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = "text-blue-400",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 overflow-hidden group hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300",
        className,
      )}
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-600/5 to-violet-600/5 rounded-2xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-white leading-none mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-600 truncate">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium mt-1.5",
                trend.positive ? "text-emerald-400" : "text-red-400",
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>

        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0 ml-3",
            iconColor,
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}