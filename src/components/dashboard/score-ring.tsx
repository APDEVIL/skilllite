"use client";

import { useEffect, useRef, useState } from "react";
import { getScoreRingColor, getScoreLabel, cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  animate?: boolean;
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  className,
  animate = true,
}: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  const animRef = useRef<number>(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreRingColor(score);
  const scoreLabel = label ?? getScoreLabel(score);

  // Animate score counter
  useEffect(() => {
    if (!animate) return;
    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [score, animate]);

  const offset = circumference - (displayed / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex flex-col items-center gap-2", className)}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: animate ? "none" : "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
          {/* Glow filter */}
          <defs>
            <filter id={`glow-${score}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Glowing arc overlay */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 0.4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            opacity={0.4}
            filter={`url(#glow-${score})`}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-extrabold leading-none tabular-nums"
            style={{
              fontSize: size * 0.22,
              color,
            }}
          >
            {displayed}
          </span>
          <span
            className="text-slate-600 font-medium mt-0.5"
            style={{ fontSize: size * 0.09 }}
          >
            / 100
          </span>
        </div>
      </div>

      {/* Labels below */}
      {scoreLabel && (
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{scoreLabel}</p>
          {sublabel && <p className="text-xs text-slate-600 mt-0.5">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}