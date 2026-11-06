"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Zap,
  FileText,
  Building2,
  Briefcase,
  GitBranch,
  Mic2,
  BookOpen,
  LogOut,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/better-auth/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
  { label: "Profile",   href: "/profile",    icon: User            },
  { label: "Skills",    href: "/skills",     icon: Zap             },
  { label: "Resume",    href: "/resume",     icon: FileText        },
  { label: "Companies", href: "/companies",  icon: Building2       },
  { label: "Roles",     href: "/roles",      icon: Briefcase       },
  { label: "Skill Gap", href: "/skill-gap",  icon: GitBranch       },
  { label: "Interview", href: "/interview",  icon: Mic2            },
  { label: "Courses",   href: "/courses",    icon: BookOpen        },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out",
        "bg-[#080d1a] border-r border-white/[0.06]",
        collapsed ? "w-[68px]" : "w-[220px]",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-white/[0.06] flex-shrink-0",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
          <BrainCircuit className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-white tracking-tight text-base">
            Prep<span className="text-blue-400">IQ</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon     = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500/15 to-violet-500/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] border border-transparent",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "flex-shrink-0 transition-colors",
                  collapsed ? "w-5 h-5" : "w-4 h-4",
                  isActive
                    ? "text-blue-400"
                    : "text-slate-600 group-hover:text-slate-400",
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: collapse toggle + logout */}
      <div className="flex-shrink-0 p-2 border-t border-white/[0.06] space-y-0.5">
        <button
          onClick={() => onCollapse(!collapsed)}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] transition-all duration-200 text-sm",
            collapsed && "justify-center px-2",
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 hover:text-red-400 hover:bg-red-500/[0.05] transition-all duration-200 text-sm",
            collapsed && "justify-center px-2",
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}