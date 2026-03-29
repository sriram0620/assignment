"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";

/** Pages that require admin / hr / manager roles — employees are redirected to /dashboard */
const ADMIN_ONLY_PATHS = ["/employees", "/ai"];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, token, logout, theme } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [isInactive, setIsInactive] = useState(false);

  // ── Apply theme class to <html> globally on every theme change ──────────
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(theme ?? "dark");
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Block employee role from accessing admin-only pages
    const isEmployee = user?.hrms_role === "employee";
    const forbidden = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
    if (isEmployee && forbidden) {
      router.replace("/dashboard");
      return;
    }

    // For non-admin roles, check if the employee account is still active
    if (user?.hrms_role !== "admin") {
      fetch("/api/employee/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.employee && data.employee.is_active === false) {
            setIsInactive(true);
          } else {
            setIsInactive(false);
          }
          setReady(true);
        })
        .catch(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [isAuthenticated, user, pathname, router, token]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 animate-pulse" />
          <span className="text-gray-400 text-sm font-medium">Loading AI-HRMS…</span>
        </div>
      </div>
    );
  }

  if (isInactive) {
    return (
      <InactiveScreen
        userName={user?.full_name ?? "User"}
        onLogout={() => {
          logout();
          router.replace("/login");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen app-shell flex">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-y-auto app-main">
        {children}
      </main>
    </div>
  );
}

// ─── Inactive Account Screen ──────────────────────────────────────────────────
function InactiveScreen({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-lg w-full relative z-10">
        {/* Card */}
        <div className="bg-[#0d1120] border border-red-500/20 rounded-3xl p-10 text-center shadow-2xl shadow-red-900/10">

          {/* Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping opacity-30" />
            </div>
          </div>

          {/* Branding */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-gray-500 text-xs font-semibold tracking-wider uppercase">AI-HRMS</span>
          </div>

          {/* Greeting */}
          <p className="text-gray-500 text-sm mb-2">Hi, {userName}</p>

          {/* Headline */}
          <h1 className="text-2xl font-bold text-white mb-3">Account Deactivated</h1>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            Your account has been deactivated by your HR administrator. You cannot access any part of the system at this time.
          </p>

          {/* Divider */}
          <div className="border-t border-[#1e2a45] mb-8" />

          {/* Contact info box */}
          <div className="bg-[#080d1a] border border-[#1e2a45] rounded-2xl p-5 mb-8 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What to do next
            </div>
            {[
              "Contact your HR Manager or system administrator",
              "Ask them to reactivate your account in the employee settings",
              "Once reactivated, log in again with your credentials",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a2035] hover:bg-red-600/20 border border-[#2a3550] hover:border-red-500/40 text-gray-300 hover:text-red-300 rounded-xl text-sm font-semibold transition-all duration-200 group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-600 text-xs mt-6">
          © {new Date().getFullYear()} AI-HRMS · If you believe this is an error, contact{" "}
          <span className="text-violet-400">support@yourcompany.com</span>
        </p>
      </div>
    </div>
  );
}
