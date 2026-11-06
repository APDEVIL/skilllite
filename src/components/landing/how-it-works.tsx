"use client";

import { useRef, useEffect, useState } from "react";
import { Upload, Cpu, Map, Mic, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Upload,
    number: "01",
    title: "Upload Your Resume",
    description:
      "Drop your PDF resume. Our AI reads every line — skills, projects, experience, education — and extracts it all in seconds.",
    color: "blue",
  },
  {
    icon: Cpu,
    number: "02",
    title: "AI Analyzes & Scores",
    description:
      "Gemini AI parses your resume, gives you an ATS score, identifies your top skills, and automatically adds them to your profile.",
    color: "violet",
  },
  {
    icon: Map,
    number: "03",
    title: "Discover Your Skill Gap",
    description:
      "Pick your target companies and roles. Get a real-time fit score and a prioritized learning path for every skill you're missing.",
    color: "cyan",
  },
  {
    icon: Mic,
    number: "04",
    title: "Practice Mock Interviews",
    description:
      "Start an AI interview session for your chosen role. Answer questions, get per-answer feedback, and complete with a full score breakdown.",
    color: "pink",
  },
  {
    icon: TrendingUp,
    number: "05",
    title: "Track Your Growth",
    description:
      "Watch your readiness score improve over time. Your dashboard tracks every session, skill added, and gap closed.",
    color: "emerald",
  },
];

const COLOR_MAP: Record<string, { icon: string; glow: string; line: string; number: string }> = {
  blue: {
    icon: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    glow: "shadow-blue-500/20",
    line: "bg-blue-500/30",
    number: "text-blue-500/30",
  },
  violet: {
    icon: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    glow: "shadow-violet-500/20",
    line: "bg-violet-500/30",
    number: "text-violet-500/30",
  },
  cyan: {
    icon: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    glow: "shadow-cyan-500/20",
    line: "bg-cyan-500/30",
    number: "text-cyan-500/30",
  },
  pink: {
    icon: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    glow: "shadow-pink-500/20",
    line: "bg-pink-500/30",
    number: "text-pink-500/30",
  },
  emerald: {
    icon: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    line: "bg-emerald-500/30",
    number: "text-emerald-500/30",
  },
};

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      className="relative py-28 bg-[#080d1a] overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6" ref={ref}>
        {/* Heading */}
        <div
          className={cn(
            "text-center mb-20 transition-all duration-700",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-5">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            How it works
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            From zero to interview-ready in 5 steps. The whole process takes
            under 10 minutes to set up.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/20 via-violet-500/20 to-emerald-500/20 hidden md:block" />

          <div className="flex flex-col gap-8">
            {STEPS.map((step, i) => {
              const colors = COLOR_MAP[step.color]!;
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className={cn(
                    "relative flex gap-6 items-start transition-all duration-700",
                    visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6",
                  )}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  {/* Icon circle */}
                  <div
                    className={cn(
                      "relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg",
                      colors.icon,
                      colors.glow,
                    )}
                  >
                    <Icon className="w-7 h-7" />
                    {/* Step number overlay */}
                    <span
                      className={cn(
                        "absolute -top-2 -right-2 text-[10px] font-black",
                        colors.number,
                      )}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Text content */}
                  <div className="pt-2 flex-1">
                    <h3 className="text-lg font-bold text-white mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-sm md:text-base max-w-xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}