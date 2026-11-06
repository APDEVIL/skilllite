"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/server/better-auth/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PERKS = [
  "AI resume analysis with ATS scoring",
  "Role-specific mock interview sessions",
  "Personalized skill gap reports",
  "Curated learning paths for every gap",
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Registration failed. Please try again.");
      return;
    }

    toast.success("Account created! Setting up your profile...");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left — value prop */}
        <div className="hidden md:flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">
              Prep<span className="text-blue-400">IQ</span>
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
              Your AI-powered
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                interview coach.
              </span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Join thousands of students who use PrepIQ to land their dream
              jobs. Start for free — no credit card needed.
            </p>
          </div>

          {/* Perks list */}
          <ul className="space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-400">{perk}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 mt-2">
            <p className="text-sm text-slate-400 italic leading-relaxed mb-3">
              "PrepIQ told me I was missing Docker and Kubernetes for DevOps
              roles. I spent 3 weeks learning them and cracked my first SRE
              interview."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                R
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300">
                  Rahul Menon
                </p>
                <p className="text-[10px] text-slate-600">
                  SRE @ Razorpay · NIT Trichy '24
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div>
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2.5 mb-6 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">
              Prep<span className="text-blue-400">IQ</span>
            </span>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
            <div className="mb-6">
              <h1 className="text-xl font-extrabold text-white mb-1">
                Create your account
              </h1>
              <p className="text-sm text-slate-500">
                Free forever. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Sharma"
                  autoComplete="name"
                  required
                  className="h-11 bg-white/[0.04] border-white/[0.08] text-slate-200 placeholder:text-slate-700 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/40 rounded-xl"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arjun@example.com"
                  autoComplete="email"
                  required
                  className="h-11 bg-white/[0.04] border-white/[0.08] text-slate-200 placeholder:text-slate-700 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/40 rounded-xl"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="h-11 bg-white/[0.04] border-white/[0.08] text-slate-200 placeholder:text-slate-700 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/40 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-0.5 flex-1 rounded-full transition-all duration-300",
                          password.length >= level * 4
                            ? level === 3
                              ? "bg-emerald-500"
                              : level === 2
                                ? "bg-amber-500"
                                : "bg-red-500"
                            : "bg-white/[0.08]",
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-blue-500/20 font-semibold mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-slate-700 mt-2">
                By signing up you agree to our Terms of Service.
              </p>
            </form>

            {/* Login link */}
            <p className="text-center text-sm text-slate-600 mt-5">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}