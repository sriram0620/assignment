"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyEmployee } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { Employee } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const avatarGrads = [
    "from-violet-500 to-cyan-500",
    "from-rose-500 to-orange-500",
    "from-blue-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-pink-500 to-purple-500",
    "from-amber-500 to-yellow-500",
];
function nameToGrad(name: string) {
    return avatarGrads[name.charCodeAt(0) % avatarGrads.length];
}

const roleStyleMap: Record<string, { bg: string; text: string; border: string; label: string }> = {
    admin: { bg: "bg-violet-600/20", text: "text-violet-300", border: "border-violet-500/30", label: "Admin" },
    hr_manager: { bg: "bg-cyan-600/20", text: "text-cyan-300", border: "border-cyan-500/30", label: "HR Manager" },
    manager: { bg: "bg-blue-600/20", text: "text-blue-300", border: "border-blue-500/30", label: "Manager" },
    employee: { bg: "bg-emerald-600/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Employee" },
};

const proficiencyLabel = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
const proficiencyColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

function scoreGrad(s: number) {
    return s >= 90 ? "from-green-500 to-emerald-400"
        : s >= 80 ? "from-violet-500 to-cyan-400"
            : s >= 70 ? "from-yellow-500 to-amber-400"
                : "from-red-500 to-rose-400";
}
function scoreLabel(s: number) {
    return s >= 90 ? "Exceptional" : s >= 80 ? "High" : s >= 70 ? "Moderate" : "Needs Attention";
}

// ─── useTheme hook ────────────────────────────────────────────────────────────
export function useTheme() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // On mount, read from localStorage; default to dark
        const stored = localStorage.getItem("hrms-theme");
        const dark = stored !== "light";
        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);
        // Force body background based on theme
        document.body.style.backgroundColor = dark ? "#080d1a" : "#f3f4f6";
        document.body.style.color = dark ? "#f9fafb" : "#111827";
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem("hrms-theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
        document.body.style.backgroundColor = next ? "#080d1a" : "#f3f4f6";
        document.body.style.color = next ? "#f9fafb" : "#111827";
    };

    return { isDark, toggle };
}

// ─── ProfilePanel ─────────────────────────────────────────────────────────────
interface ProfilePanelProps {
    onClose: () => void;
    isDark: boolean;
    onToggleTheme: () => void;
}

export default function ProfilePanel({ onClose, isDark, onToggleTheme }: ProfilePanelProps) {
    const { user } = useAppStore();

    const { data: myEmployee } = useQuery<Employee>({
        queryKey: ["my-employee"],
        queryFn: fetchMyEmployee,
        retry: false,
    });

    if (!user) return null;

    const role = roleStyleMap[user.hrms_role] ?? roleStyleMap.employee;
    const initials = user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const grad = nameToGrad(user.full_name);

    const score = myEmployee?.productivity_score ?? 0;
    const tasksAssigned = myEmployee?.tasks_assigned ?? 0;
    const tasksCompleted = myEmployee?.tasks_completed ?? 0;
    const completionRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;
    const skills = myEmployee?.skills ?? [];

    /* ── Theme-aware class helpers ─────────────────────────────────────────── */
    const panel = isDark ? "bg-[#0a0f1e] border-[#1e2a45]" : "bg-white border-gray-200";
    const header = isDark ? "bg-[#0a0f1e]/95 border-[#1e2a45]" : "bg-white/95 border-gray-200";
    const card = isDark ? "bg-[#0d1120] border-[#1e2a45]" : "bg-gray-50 border-gray-200";
    const cardDeep = isDark ? "bg-[#080d1a] border-[#1e2a45]" : "bg-gray-100 border-gray-200";
    const txt = isDark ? "text-white" : "text-gray-900";
    const txtMuted = isDark ? "text-gray-400" : "text-gray-500";
    const txtFaint = isDark ? "text-gray-500" : "text-gray-400";
    const iconBg = isDark ? "bg-[#1a2035] border-[#2a3550]" : "bg-gray-100 border-gray-300";
    const trackBg = isDark ? "bg-[#1e2a45]" : "bg-gray-200";
    const skillChip = isDark
        ? "bg-[#1a2035] border-[#2a3550] text-gray-300 hover:border-violet-500/40 hover:text-violet-300"
        : "bg-white border-gray-300 text-gray-700 hover:border-violet-400 hover:text-violet-600";

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Slide-over panel */}
            <div
                className={`fixed inset-y-0 right-0 w-full max-w-xl border-l shadow-2xl z-50 overflow-y-auto flex flex-col transition-colors ${panel}`}
            >
                {/* ── Sticky Header ─────────────────────────────────────────────────── */}
                <div className={`sticky top-0 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between z-10 ${header}`}>
                    <div>
                        <div className={`text-sm font-bold ${txt}`}>My Profile</div>
                        <div className={`text-xs mt-0.5 ${txtMuted}`}>{user.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button
                            onClick={onToggleTheme}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isDark
                                    ? "text-yellow-400 hover:bg-yellow-400/10"
                                    : "text-gray-600 hover:bg-gray-200"
                                }`}
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? (
                                /* Sun icon */
                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                </svg>
                            ) : (
                                /* Moon icon */
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isDark ? "text-gray-500 hover:text-white hover:bg-[#1e2a45]" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            title="Close"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Content ──────────────────────────────────────────────────────── */}
                <div className="flex-1 p-6 space-y-5">

                    {/* ── Hero Card ───────────────────────────────────────────────────── */}
                    <div className={`relative border rounded-2xl overflow-hidden ${card}`}>
                        {/* Banner */}
                        <div className={`h-20 bg-gradient-to-r ${grad} opacity-25`} />
                        <div className="px-6 pb-6">
                            <div className="-mt-10 mb-4 flex items-end justify-between">
                                {/* Avatar */}
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-xl font-black text-white ring-4 ${isDark ? "ring-[#0d1120]" : "ring-white"} shadow-xl flex-shrink-0`}>
                                    {initials}
                                </div>
                                {/* Active status */}
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-600/15 text-green-300 border border-green-500/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Active
                                </div>
                            </div>
                            <h2 className={`text-xl font-black mb-0.5 ${txt}`}>{user.full_name}</h2>
                            <p className={`text-sm mb-3 ${txtMuted}`}>{user.org_name}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${role.bg} ${role.text} ${role.border}`}>
                                    {role.label}
                                </span>
                                {myEmployee?.job_title && (
                                    <span className={`text-xs px-2.5 py-1 rounded-lg border ${isDark ? "text-gray-400 bg-[#1a2035] border-[#2a3550]" : "text-gray-600 bg-gray-100 border-gray-300"}`}>
                                        {myEmployee.job_title}
                                    </span>
                                )}
                                {myEmployee?.department_name && (
                                    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${isDark ? "text-gray-400 bg-[#1a2035] border-[#2a3550]" : "text-gray-600 bg-gray-100 border-gray-300"}`}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        {myEmployee.department_name}
                                    </span>
                                )}
                                {myEmployee?.hire_date && (
                                    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${isDark ? "text-gray-400 bg-[#1a2035] border-[#2a3550]" : "text-gray-600 bg-gray-100 border-gray-300"}`}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Joined {new Date(myEmployee.hire_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Stats Grid (only if employee record exists) ──────────────────── */}
                    {myEmployee && (
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Tasks Assigned", value: tasksAssigned || "—", color: "text-blue-400", bg: "bg-blue-600/10" },
                                { label: "Tasks Completed", value: tasksCompleted || "—", color: "text-green-400", bg: "bg-green-600/10" },
                                { label: "Completion Rate", value: tasksAssigned > 0 ? `${completionRate}%` : "—", color: "text-violet-400", bg: "bg-violet-600/10" },
                                { label: "AI Score", value: myEmployee.productivity_score !== undefined ? `${myEmployee.productivity_score}/100` : "—", color: "text-cyan-400", bg: "bg-cyan-600/10" },
                            ].map((stat) => (
                                <div key={stat.label} className={`border rounded-xl p-4 ${card}`}>
                                    <div className={`text-xl font-black mb-0.5 ${stat.color}`}>{stat.value}</div>
                                    <div className={`text-xs ${txtFaint}`}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── AI Productivity Score (only if score exists) ─────────────────── */}
                    {myEmployee?.productivity_score !== undefined && (
                        <div className={`bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border border-violet-500/20 rounded-xl p-5`}>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-700"}`}>AI Productivity</div>
                                    <div className={`text-xs ${txtFaint}`}>Computed from task performance</div>
                                </div>
                                <div className={`text-2xl font-black bg-gradient-to-r ${scoreGrad(score)} bg-clip-text text-transparent`}>
                                    {score}
                                </div>
                            </div>
                            <div className={`h-2.5 rounded-full overflow-hidden mb-2 ${trackBg}`}>
                                <div className={`h-full rounded-full bg-gradient-to-r ${scoreGrad(score)}`} style={{ width: `${score}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className={txtFaint}>0</span>
                                <span className={`font-semibold ${score >= 90 ? "text-green-400" : score >= 80 ? "text-violet-400" : score >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                                    {scoreLabel(score)} Performance
                                </span>
                                <span className={txtFaint}>100</span>
                            </div>
                            <div className="mt-4 space-y-2.5">
                                {[
                                    { label: "Task Completion", val: completionRate, color: "bg-green-500" },
                                    { label: "Productivity Index", val: score, color: "bg-violet-500" },
                                    { label: "Engagement", val: Math.min(100, Math.round(score * 0.95)), color: "bg-cyan-500" },
                                ].map((bar) => (
                                    <div key={bar.label}>
                                        <div className={`flex justify-between text-xs mb-1 ${txtFaint}`}>
                                            <span>{bar.label}</span>
                                            <span className={`font-semibold ${txtMuted}`}>{bar.val}%</span>
                                        </div>
                                        <div className={`h-1.5 rounded-full overflow-hidden ${trackBg}`}>
                                            <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.val}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Contact & Details ────────────────────────────────────────────── */}
                    <div className={`border rounded-xl p-5 ${card}`}>
                        <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${txtMuted}`}>Contact &amp; Details</div>
                        <div className="space-y-3">
                            {[
                                {
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    ),
                                    label: "Email",
                                    value: user.email,
                                    mono: true,
                                    accent: false,
                                },
                                {
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    ),
                                    label: "Organisation",
                                    value: user.org_name,
                                    mono: false,
                                    accent: false,
                                },
                                ...(user.wallet_address ? [{
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    ),
                                    label: "Wallet",
                                    value: `${user.wallet_address.slice(0, 10)}…${user.wallet_address.slice(-6)}`,
                                    mono: true,
                                    accent: true,
                                }] : []),
                            ].map((row, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"} ${iconBg} border`}>
                                        {row.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${txtFaint}`}>{row.label}</div>
                                        <div className={`text-sm truncate ${row.mono ? "font-mono" : "font-medium"} ${row.accent ? "text-blue-400" : txt}`}>
                                            {row.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Skills ──────────────────────────────────────────────────────── */}
                    {skills.length > 0 ? (
                        <div className={`border rounded-xl p-5 ${card}`}>
                            <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${txtMuted}`}>
                                Skills &amp; Proficiency
                            </div>
                            <div className="space-y-3">
                                {skills.map((s) => (
                                    <div key={s.skill_id} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-medium ${txt}`}>{s.skill_name}</span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? "bg-[#1a2035] border-[#2a3550] text-gray-400" : "bg-gray-100 border-gray-200 text-gray-500"
                                                }`}>
                                                {proficiencyLabel[s.proficiency]}
                                            </span>
                                        </div>
                                        <div className={`h-1.5 rounded-full overflow-hidden ${trackBg}`}>
                                            <div
                                                className={`h-full rounded-full ${proficiencyColor[s.proficiency]} transition-all duration-500`}
                                                style={{ width: `${(s.proficiency / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Skill chips */}
                            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-dashed border-[#1e2a45]">
                                {skills.map((s) => (
                                    <span
                                        key={s.skill_id + "_chip"}
                                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-default ${skillChip}`}
                                    >
                                        {s.skill_name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={`border rounded-xl p-5 text-center ${card}`}>
                            <div className={`text-sm ${txtFaint} italic`}>No skills registered yet.</div>
                        </div>
                    )}

                    {/* ── Bottom padding buffer */}
                    <div className="h-4" />
                </div>
            </div>
        </>
    );
}
