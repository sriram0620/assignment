"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

type NavItem = {
  path: string;
  label: string;
  badge: string | null;
  roles: string[];
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    badge: null,
    roles: ["admin", "hr_manager", "manager", "employee"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: "/tasks",
    label: "Tasks",
    badge: null,
    roles: ["admin", "hr_manager", "manager", "employee"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    path: "/employees",
    label: "Employees",
    badge: null,
    roles: ["admin", "hr_manager", "manager"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: "/ai",
    label: "AI Intelligence",
    badge: "AI",
    roles: ["admin", "hr_manager", "manager"],
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

const roleBadgeColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-violet-600/20 text-violet-300 border-violet-500/30";
    case "hr_manager": return "bg-cyan-600/20 text-cyan-300 border-cyan-500/30";
    case "manager": return "bg-blue-600/20 text-blue-300 border-blue-500/30";
    default: return "bg-emerald-600/20 text-emerald-300 border-emerald-500/30";
  }
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, walletConnected, walletAddress, theme, setTheme } = useAppStore();

  const isDark = theme !== "light";
  const role = user?.hrms_role ?? "employee";
  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path + "/"));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <aside className="w-64 min-h-screen bg-[#0a0e1a] border-r border-[#1e2a45] flex flex-col sticky top-0 h-screen overflow-y-auto flex-shrink-0">

      {/* Logo */}
      <div className="p-5 border-b border-[#1e2a45]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-900/30 group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-sm truncate">Mini AI-HRMS</div>
            <div className="text-xs text-gray-500 truncate">{user?.org_name}</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">
          {role === "employee" ? "My Workspace" : "Main Menu"}
        </div>

        {visibleNav.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                }`}
            >
              <span className={active ? "text-violet-400" : "text-gray-500"}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${item.badge === "AI"
                      ? "bg-orange-600/20 text-orange-300 border-orange-500/30"
                      : "bg-blue-600/20 text-blue-300 border-blue-500/30"
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Wallet */}
      {walletConnected && walletAddress && (
        <div className="px-4 pb-2">
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Wallet Connected</div>
                <div className="text-xs text-gray-400 font-mono truncate">
                  {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── User Footer ─────────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-[#1e2a45] space-y-2">

        {/* Profile trigger — navigates to /profile */}
        <Link
          href="/profile"
          className={`w-full flex items-center gap-3 rounded-xl px-2 py-2.5 transition-all group text-left border ${isActive("/profile")
              ? "bg-violet-600/15 border-violet-500/30"
              : "border-transparent hover:bg-white/5 hover:border-white/5"
            }`}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white group-hover:scale-105 transition-transform">
              {user?.full_name?.charAt(0) ?? "U"}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0a0e1a]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-sm font-semibold truncate transition-colors ${isActive("/profile") ? "text-violet-300" : "text-white group-hover:text-violet-300"}`}>
              {user?.full_name}
            </div>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${roleBadgeColor(role)}`}>
              {role.replace("_", " ").toUpperCase()}
            </span>
          </div>
          {/* Chevron */}
          <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isActive("/profile") ? "text-violet-400" : "text-gray-600 group-hover:text-violet-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Actions: theme toggle + sign out */}
        <div className="flex items-center gap-2">
          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${isDark
                ? "border-[#1e2a45] text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/5 hover:border-yellow-500/30"
                : "border-[#1e2a45] text-gray-500 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium border border-[#1e2a45] text-gray-500 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/30 transition-all"
            title="Sign out"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
