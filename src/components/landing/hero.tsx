"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Upload, Brain, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// INTERACTIVE PARTICLE CANVAS
// ─────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const clickRipples = useRef<{ x: number; y: number; r: number; opacity: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLORS = ["#3b82f6", "#7c3aed", "#06b6d4", "#6366f1"];
    const COUNT = 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    }));

    const MOUSE_RADIUS = 120;
    const CONNECT_DIST = 100;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update + draw particles
      for (const p of particles) {
        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Clamp velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) {
          p.vx = (p.vx / speed) * 1.5;
          p.vy = (p.vy / speed) * 1.5;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]!;
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw mouse highlight
      if (mouse.x > 0) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
        grad.addColorStop(0, "rgba(59, 130, 246, 0.06)");
        grad.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw click ripples
      clickRipples.current = clickRipples.current.filter((r) => r.opacity > 0);
      for (const ripple of clickRipples.current) {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(99, 102, 241, ${ripple.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ripple.r += 3;
        ripple.opacity -= 0.025;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    const onClick = (e: MouseEvent) => {
      clickRipples.current.push({ x: e.clientX, y: e.clientY, r: 0, opacity: 0.7 });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ─────────────────────────────────────────────
// FLOATING CARDS (decorative)
// ─────────────────────────────────────────────

function FloatingCard({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "absolute backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl",
        "animate-float",
        className,
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080d1a]">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Deep gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#080d1a] via-[#0d1530] to-[#080d1a]" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      {/* Interactive particles */}
      <ParticleCanvas />

      {/* Floating UI cards */}
      <FloatingCard
        className="hidden lg:block top-32 right-16 w-56"
        delay={0}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium">Readiness Score</span>
        </div>
        <div className="text-2xl font-bold text-white">84%</div>
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[84%] bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
        </div>
        <p className="text-xs text-emerald-400 mt-1.5">↑ 12% this week</p>
      </FloatingCard>

      <FloatingCard
        className="hidden lg:block bottom-40 left-12 w-52"
        delay={1.2}
      >
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-slate-400 font-medium">AI Analysis</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {["React", "Node.js", "SQL"].map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">
              {s}
            </span>
          ))}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/20">
            +3 missing
          </span>
        </div>
      </FloatingCard>

      <FloatingCard
        className="hidden lg:block top-48 left-16 w-48"
        delay={0.6}
      >
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-slate-400 font-medium">Resume Parsed</span>
        </div>
        <div className="text-sm text-white font-semibold">ATS Score</div>
        <div className="text-3xl font-bold text-blue-400 mt-0.5">76</div>
        <p className="text-xs text-slate-500 mt-1">Good match for SDE roles</p>
      </FloatingCard>

      {/* Main hero content */}
      <div
        className={cn(
          "relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-1000",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}
      >
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Interview Preparation
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
          Know Your{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Skill Gap.
            </span>
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/60 to-blue-500/0" />
          </span>
          <br />
          <span className="text-slate-300">Ace Every Interview.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your resume, let AI analyze your skills, discover exactly what
          you're missing, and practice with role-specific mock interviews.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link href="/register">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 px-8 py-6 text-base font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
            >
              Start for Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button
              size="lg"
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-white/5 px-8 py-6 text-base border border-white/10"
            >
              See How It Works
            </Button>
          </a>
        </div>

        {/* Social proof */}
        <p className="mt-10 text-sm text-slate-600">
          Trusted by{" "}
          <span className="text-slate-400 font-medium">2,000+ students</span>{" "}
          from top engineering colleges
        </p>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080d1a] to-transparent pointer-events-none" />
    </section>
  );
}