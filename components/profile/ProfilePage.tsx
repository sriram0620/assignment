"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { fetchMyEmployee } from "@/lib/api";
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

const profLabel = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
const profColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

function scoreGrad(s: number) {
    return s >= 90 ? "from-green-500 to-emerald-400"
        : s >= 80 ? "from-violet-500 to-cyan-400"
            : s >= 70 ? "from-yellow-500 to-amber-400"
                : "from-red-500 to-rose-400";
}
function scoreLabel(s: number) {
    return s >= 90 ? "Exceptional" : s >= 80 ? "High" : s >= 70 ? "Moderate" : "Needs Attention";
}


// ─── ProfilePage ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, theme, setTheme } = useAppStore();
    const isDark = theme !== "light";

    const { data: emp, isLoading } = useQuery<Employee | null>({
        queryKey: ["my-employee"],
        queryFn: () => fetchMyEmployee(),
        retry: false,
    });


    if (!user) return null;

    const role = roleStyleMap[user.hrms_role] ?? roleStyleMap.employee;
    const initials = user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const grad = nameToGrad(user.full_name);
    const score = emp?.productivity_score ?? 0;
    const tasksAssigned = emp?.tasks_assigned ?? 0;
    const tasksCompleted = emp?.tasks_completed ?? 0;
    const completionRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;
    const skills = emp?.skills ?? [];

    /* ── Theme-aware helpers ─────────────────────────────────────────────────── */
    const bg = isDark ? "bg-[#080d1a]" : "bg-[#f0f4f8]";
    const card = isDark ? "bg-[#0d1120] border-[#1e2a45]" : "bg-white border-gray-200";
    const trackBg = isDark ? "bg-[#1e2a45]" : "bg-gray-200";
    const txt = isDark ? "text-white" : "text-gray-900";
    const txtSub = isDark ? "text-gray-400" : "text-gray-500";
    const txtFaint = isDark ? "text-gray-500" : "text-gray-400";
    const iconBox = isDark ? "bg-[#1a2035] border-[#2a3550] text-gray-500" : "bg-gray-100 border-gray-200 text-gray-400";
    const chip = isDark
        ? "bg-[#1a2035] border-[#2a3550] text-gray-300 hover:border-violet-500/40 hover:text-violet-300"
        : "bg-white border-gray-300 text-gray-700 hover:border-violet-400 hover:text-violet-600";
    const divider = isDark ? "border-[#1e2a45]" : "border-gray-200";
    const sectionLabel = isDark ? "text-gray-400" : "text-gray-500";

    return (
        <div className={`min-h-screen ${bg} transition-colors`}>
            {/* ── Page header ──────────────────────────────────────────────────────── */}
            <div className={`sticky top-0 z-30 ${isDark ? "bg-[#080d1a]/90" : "bg-[#f0f4f8]/90"} backdrop-blur-md border-b ${divider} px-8 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isDark ? "text-gray-500 hover:text-white hover:bg-[#1e2a45]" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
                        title="Go back"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className={`text-base font-bold ${txt}`}>My Profile</h1>
                        <p className={`text-xs ${txtSub}`}>View your account details and skills</p>
                    </div>
                </div>

                {/* Theme toggle */}
                <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${isDark
                        ? "bg-[#1a2035] border-[#2a3550] text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-500/30"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDark ? (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                            Light Mode
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            Dark Mode
                        </>
                    )}
                </button>
            </div>

            {/* ── Content ──────────────────────────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="space-y-4">
                        {[200, 120, 160].map((h, i) => (
                            <div key={i} className={`border rounded-2xl animate-pulse ${card}`} style={{ height: h }} />
                        ))}
                    </div>
                )}

                {!isLoading && (
                    <>
                        {/* ── Hero Card ─────────────────────────────────────────────────── */}
                        <div className={`relative border rounded-2xl overflow-hidden shadow-sm ${card}`}>
                            {/* Gradient banner */}
                            <div className={`h-28 bg-gradient-to-r ${grad} ${isDark ? "opacity-20" : "opacity-30"}`} />

                            <div className="px-8 pb-8">
                                <div className="-mt-12 mb-5 flex items-end justify-between">
                                    {/* Large avatar */}
                                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-2xl font-black text-white ring-4 ${isDark ? "ring-[#0d1120]" : "ring-white"} shadow-2xl flex-shrink-0`}>
                                        {initials}
                                    </div>
                                    {/* Active pill */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-600/15 text-green-300 border border-green-500/25">
                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        Active
                                    </div>
                                </div>

                                {/* Name + title */}
                                <h2 className={`text-2xl font-black mb-1 ${txt}`}>{user.full_name}</h2>
                                <p className={`text-sm mb-1 ${txtSub}`}>{emp?.job_title ?? "—"}</p>
                                <p className={`text-xs mb-4 ${txtFaint}`}>{user.org_name}</p>

                                {/* Badges row */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${role.bg} ${role.text} ${role.border}`}>
                                        {role.label}
                                    </span>
                                    {emp?.department_name && (
                                        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${isDark ? "text-gray-400 bg-[#1a2035] border-[#2a3550]" : "text-gray-600 bg-gray-100 border-gray-200"}`}>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {emp.department_name}
                                        </span>
                                    )}
                                    {emp?.hire_date && (
                                        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${isDark ? "text-gray-400 bg-[#1a2035] border-[#2a3550]" : "text-gray-600 bg-gray-100 border-gray-200"}`}>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Joined {new Date(emp.hire_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Stats Grid ────────────────────────────────────────────────── */}
                        {emp && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: "Tasks Assigned", value: tasksAssigned || "—", color: "text-blue-400" },
                                    { label: "Tasks Completed", value: tasksCompleted || "—", color: "text-green-400" },
                                    { label: "Completion Rate", value: tasksAssigned > 0 ? `${completionRate}%` : "—", color: "text-violet-400" },
                                    { label: "AI Score", value: emp.productivity_score !== undefined ? `${emp.productivity_score}/100` : "—", color: "text-cyan-400" },
                                ].map((stat) => (
                                    <div key={stat.label} className={`border rounded-xl p-5 ${card}`}>
                                        <div className={`text-2xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
                                        <div className={`text-xs ${txtFaint}`}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── AI Score Bar ──────────────────────────────────────────────── */}
                        {emp?.productivity_score !== undefined && (
                            <div className={`border rounded-2xl p-6 bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border-violet-500/20`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}>AI Productivity Score</div>
                                        <div className={`text-xs ${txtFaint}`}>Computed from task performance data</div>
                                    </div>
                                    <div className={`text-3xl font-black bg-gradient-to-r ${scoreGrad(score)} bg-clip-text text-transparent`}>
                                        {score}
                                    </div>
                                </div>
                                <div className={`h-3 rounded-full overflow-hidden mb-2 ${trackBg}`}>
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${scoreGrad(score)} transition-all duration-700`}
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs mb-5">
                                    <span className={txtFaint}>0</span>
                                    <span className={`font-semibold ${score >= 90 ? "text-green-400" : score >= 80 ? "text-violet-400" : score >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                                        {scoreLabel(score)} Performance
                                    </span>
                                    <span className={txtFaint}>100</span>
                                </div>
                                {/* Sub-bars */}
                                <div className="space-y-3">
                                    {[
                                        { label: "Task Completion", val: completionRate, color: "bg-green-500" },
                                        { label: "Productivity Index", val: score, color: "bg-violet-500" },
                                        { label: "Engagement", val: Math.min(100, Math.round(score * 0.95)), color: "bg-cyan-500" },
                                    ].map((bar) => (
                                        <div key={bar.label}>
                                            <div className={`flex justify-between text-xs mb-1.5 ${txtFaint}`}>
                                                <span>{bar.label}</span>
                                                <span className={`font-semibold ${txtSub}`}>{bar.val}%</span>
                                            </div>
                                            <div className={`h-1.5 rounded-full overflow-hidden ${trackBg}`}>
                                                <div className={`h-full rounded-full ${bar.color} transition-all duration-500`} style={{ width: `${bar.val}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}




                        {/* ── Two-column: Contact + Details ─────────────────────────────── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Contact */}
                            <div className={`border rounded-2xl p-6 ${card}`}>
                                <div className={`text-xs font-bold uppercase tracking-wider mb-5 ${sectionLabel}`}>Contact Info</div>
                                <div className="space-y-4">
                                    {[
                                        {
                                            label: "Email",
                                            value: user.email,
                                            mono: true,
                                            accent: false,
                                            icon: (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            ),
                                        },
                                        {
                                            label: "Organisation",
                                            value: user.org_name,
                                            mono: false,
                                            accent: false,
                                            icon: (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            ),
                                        },

                                    ].map((row, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${iconBox}`}>
                                                {row.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${txtFaint}`}>{row.label}</div>
                                                <div className={`text-sm truncate ${row.mono ? "font-mono text-xs" : "font-medium"} ${row.accent ? "text-blue-400" : txt}`}>
                                                    {row.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Account Details */}
                            <div className={`border rounded-2xl p-6 ${card}`}>
                                <div className={`text-xs font-bold uppercase tracking-wider mb-5 ${sectionLabel}`}>Account Details</div>
                                <div className="space-y-4">
                                    {[
                                        { label: "Role", value: role.label, icon: "👤" },
                                        { label: "Department", value: emp?.department_name ?? "Not assigned", icon: "🏢" },
                                        { label: "Job Title", value: emp?.job_title ?? "—", icon: "💼" },
                                        ...(emp?.hire_date ? [{ label: "Hire Date", value: new Date(emp.hire_date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }), icon: "📅" }] : []),
                                    ].map((row, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border flex-shrink-0 ${isDark ? "bg-[#1a2035] border-[#2a3550]" : "bg-gray-50 border-gray-200"}`}>
                                                {row.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${txtFaint}`}>{row.label}</div>
                                                <div className={`text-sm font-medium truncate ${txt}`}>{row.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Skills & Proficiency ──────────────────────────────────────── */}
                        <div className={`border rounded-2xl p-6 ${card}`}>
                            <div className={`flex items-center justify-between mb-5`}>
                                <div className={`text-xs font-bold uppercase tracking-wider ${sectionLabel}`}>
                                    Skills &amp; Proficiency
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "bg-[#1a2035] border-[#2a3550] text-gray-500" : "bg-gray-100 border-gray-200 text-gray-500"}`}>
                                    {skills.length} skill{skills.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {skills.length === 0 ? (
                                <div className={`text-center py-8 text-sm italic ${txtFaint}`}>
                                    No skills linked to your profile yet.
                                </div>
                            ) : (
                                <>
                                    {/* Proficiency bars */}
                                    <div className="space-y-4 mb-6">
                                        {skills.map((s) => (
                                            <div key={s.skill_id}>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className={`text-sm font-medium ${txt}`}>{s.skill_name}</span>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isDark ? "bg-[#1a2035] border-[#2a3550] text-gray-300" : "bg-gray-100 border-gray-200 text-gray-600"
                                                        }`}>
                                                        {profLabel[s.proficiency]}
                                                    </span>
                                                </div>
                                                <div className={`h-2 rounded-full overflow-hidden ${trackBg}`}>
                                                    <div
                                                        className={`h-full rounded-full ${profColor[s.proficiency]} transition-all duration-700`}
                                                        style={{ width: `${(s.proficiency / 5) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Skill chips */}
                                    <div className={`border-t pt-5 ${divider}`}>
                                        <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${txtFaint}`}>All Skills</div>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((s) => (
                                                <span
                                                    key={s.skill_id + "_chip"}
                                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-default ${chip}`}
                                                >
                                                    {s.skill_name}
                                                    <span className={`ml-1.5 text-[9px] opacity-60`}>{profLabel[s.proficiency]}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── Footer note ───────────────────────────────────────────────── */}
                        <p className={`text-center text-xs pb-4 ${txtFaint}`}>
                            This profile is view-only. Contact your HR administrator to make changes.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
