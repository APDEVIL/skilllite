import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="relative bg-[#080d1a] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            Prep<span className="text-blue-400">IQ</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <Link href="#features" className="hover:text-slate-400 transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-slate-400 transition-colors">
            How It Works
          </Link>
          <Link href="/login" className="hover:text-slate-400 transition-colors">
            Login
          </Link>
          <Link href="/register" className="hover:text-slate-400 transition-colors">
            Register
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-700">
          © {new Date().getFullYear()} PrepIQ. Built for placement season.
        </p>
      </div>
    </footer>
  );
}