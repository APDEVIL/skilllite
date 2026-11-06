"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

export function Topbar() {
  const { data: user } = api.auth.me.useQuery();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#080d1a]/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-64 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
        <Input
          placeholder="Search..."
          className="pl-9 h-9 bg-white/[0.04] border-white/[0.08] text-slate-400 placeholder:text-slate-700 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/40 text-sm rounded-xl"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-300 leading-none">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>
    </header>
  );
}