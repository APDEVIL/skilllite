import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Tailwind class merger ─────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Score color helpers ───────────────────────
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

export function getScoreRingColor(score: number): string {
  if (score >= 80) return "#34d399"; // emerald
  if (score >= 60) return "#60a5fa"; // blue
  if (score >= 40) return "#fbbf24"; // amber
  return "#f87171"; // red
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

// ── Proficiency helpers ───────────────────────
export const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

export const PROFICIENCY_COLORS: Record<number, string> = {
  1: "bg-red-500/20 text-red-400 border-red-500/30",
  2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  3: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  4: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  5: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

// ── Difficulty helpers ────────────────────────
export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

// ── Skill category colors ─────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  backend: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  database: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  devops: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ai_ml: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  cs_fundamentals: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  soft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  ai_ml: "AI / ML",
  cs_fundamentals: "CS Fundamentals",
  soft: "Soft Skills",
};

// ── Date helpers ──────────────────────────────
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Number helpers ────────────────────────────
export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export function formatLPA(min: number, max: number): string {
  return `₹${min}–${max} LPA`;
}