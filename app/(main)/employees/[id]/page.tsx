"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchEmployees } from "@/lib/api";
import type { Employee } from "@/lib/types";
import type { Role } from "@/lib/types";

// ─── Role colours ─────────────────────────────────────────────────────────────
const roleStyles: Record<Role, { bg: string; text: string; border: string; label: string }> = {
  admin:      { bg: "bg-violet-600/20",  text: "text-violet-300",  border: "border-violet-500/30",  label: "Admin" },
  hr_manager: { bg: "bg-cyan-600/20",    text: "text-cyan-300",    border: "border-cyan-500/30",    label: "HR Manager" },
  manager:    { bg: "bg-blue-600/20",    text: "text-blue-300",    border: "border-blue-500/30",    label: "Manager" },
  employee:   { bg: "bg-gray-600/20",    text: "text-gray-400",    border: "border-gray-500/30",    label: "Employee" },
};

const scoreGrad = (s: number) =>
  s >= 90 ? "from-green-500 to-emerald-400"
  : s >= 80 ? "from-violet-500 to-cyan-400"
  : s >= 70 ? "from-yellow-500 to-amber-400"
  : "from-red-500 to-rose-400";

const scoreLabel = (s: number) =>
  s >= 90 ? "Exceptional" : s >= 80 ? "High" : s >= 70 ? "Moderate" : "Needs Attention";

// ─── Avatar colour deterministically from name ────────────────────────────────
const avatarGrads = [
  "from-violet-500 to-cyan-500",
  "from-rose-500 to-orange-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-purple-500",
  "from-amber-500 to-yellow-500",
];
function nameToGrad(name: string) {
  const idx = name.charCodeAt(0) % avatarGrads.length;
  return avatarGrads[idx];
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn:  fetchEmployees,
  });

  const emp = employees.find((e) => e.id === id);

  if (isLoading) return <LoadingState />;
  if (!emp)      return <NotFoundState onBack={() => router.back()} />;

  const role    = roleStyles[emp.role];
  const score   = emp.productivity_score ?? 0;
  const initials = emp.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const completionRate = emp.tasks_assigned
    ? Math.round(((emp.tasks_completed ?? 0) / emp.tasks_assigned) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#080d1a] p-6 md:p-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm font-medium mb-8 transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Employees
      </button>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Hero Card ──────────────────────────────────────────────────────── */}
        <div className="relative bg-[#0d1120] border border-[#1e2a45] rounded-3xl overflow-hidden">
          {/* Top gradient band */}
          <div className={`h-28 bg-gradient-to-r ${nameToGrad(emp.full_name)} opacity-20`} />
          <div className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-r ${nameToGrad(emp.full_name)} opacity-10 blur-xl`} />

          <div className="px-8 pb-8">
            {/* Avatar overlapping band */}
            <div className="-mt-12 mb-5 flex items-end justify-between">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${nameToGrad(emp.full_name)} flex items-center justify-center text-2xl font-black text-white ring-4 ring-[#0d1120] shadow-2xl flex-shrink-0`}>
                {initials}
              </div>
              {/* Status badge */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                emp.is_active
                  ? "bg-green-600/15 text-green-300 border border-green-500/25"
                  : "bg-red-600/15 text-red-300 border border-red-500/25"
              }`}>
                <span className={`w-2 h-2 rounded-full ${emp.is_active ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                {emp.is_active ? "Active" : "Inactive"}
              </div>
            </div>

            {/* Name + job */}
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">{emp.full_name}</h1>
            <p className="text-gray-400 text-base mb-4">{emp.job_title}</p>

            {/* Role + dept row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${role.bg} ${role.text} ${role.border}`}>
                {role.label}
              </span>
              {emp.department_name && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1a2035] border border-[#2a3550] px-3 py-1.5 rounded-lg">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {emp.department_name}
                </span>
              )}
              {emp.hire_date && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1a2035] border border-[#2a3550] px-3 py-1.5 rounded-lg">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {new Date(emp.hire_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Tasks Assigned",
              value: emp.tasks_assigned ?? "—",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
              color: "text-blue-400",
              bg: "bg-blue-600/10",
            },
            {
              label: "Tasks Completed",
              value: emp.tasks_completed ?? "—",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              color: "text-green-400",
              bg: "bg-green-600/10",
            },
            {
              label: "Completion Rate",
              value: emp.tasks_assigned ? `${completionRate}%` : "—",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              color: "text-violet-400",
              bg: "bg-violet-600/10",
            },
            {
              label: "AI Score",
              value: emp.productivity_score !== undefined ? `${emp.productivity_score}/100` : "—",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              color: "text-cyan-400",
              bg: "bg-cyan-600/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5 hover:border-violet-500/30 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Bottom Grid: AI Score + Contact + Skills ───────────────────────── */}
        <div className="grid md:grid-cols-5 gap-6">

          {/* AI Productivity Score – wide */}
          {emp.productivity_score !== undefined && (
            <div className="md:col-span-3 bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-0.5">AI Productivity Score</h2>
                  <p className="text-xs text-gray-600">Computed from task performance & engagement</p>
                </div>
                <div className={`text-3xl font-black bg-gradient-to-r ${scoreGrad(score)} bg-clip-text text-transparent`}>
                  {score}
                </div>
              </div>

              {/* Big progress bar */}
              <div className="relative h-4 bg-[#1e2a45] rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${scoreGrad(score)} transition-all duration-700`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>0</span>
                <span className={`font-semibold ${
                  score >= 90 ? "text-green-400"
                  : score >= 80 ? "text-violet-400"
                  : score >= 70 ? "text-yellow-400"
                  : "text-red-400"
                }`}>{scoreLabel(score)} Performance</span>
                <span>100</span>
              </div>

              {/* Breakdown bars */}
              <div className="mt-6 space-y-3">
                {[
                  { label: "Task Completion", val: completionRate, color: "bg-green-500" },
                  { label: "Productivity Index", val: score,        color: "bg-violet-500" },
                  { label: "Engagement",         val: Math.min(100, Math.round(score * 0.95)), color: "bg-cyan-500" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>{bar.label}</span>
                      <span className="font-semibold text-gray-400">{bar.val}%</span>
                    </div>
                    <div className="h-1.5 bg-[#1e2a45] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact + Details – narrow */}
          <div className={`${emp.productivity_score !== undefined ? "md:col-span-2" : "md:col-span-5"} space-y-4`}>

            {/* Contact info */}
            <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Contact & Details</h2>
              <div className="space-y-3.5">
                <InfoRow
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  label="Email"
                  value={emp.email}
                  mono
                />
                {emp.department_name && (
                  <InfoRow
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    }
                    label="Department"
                    value={emp.department_name}
                  />
                )}
                {emp.hire_date && (
                  <InfoRow
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    label="Hire Date"
                    value={new Date(emp.hire_date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  />
                )}
                {emp.wallet_address && (
                  <InfoRow
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    }
                    label="Wallet"
                    value={`${emp.wallet_address.slice(0, 10)}…${emp.wallet_address.slice(-6)}`}
                    mono
                    accent
                  />
                )}
              </div>
            </div>

            {/* Skills */}
            {emp.skills.length > 0 && (
              <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {emp.skills.map((s) => (
                    <span
                      key={s.skill_id}
                      className="text-xs bg-[#1a2035] border border-[#2a3550] text-gray-300 px-3 py-1.5 rounded-lg font-medium hover:border-violet-500/40 hover:text-violet-300 transition-all"
                    >
                      {s.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Employee ID footer ─────────────────────────────────────────────── */}
        <div className="text-center text-gray-700 text-xs pb-4">
          Employee ID: <span className="font-mono">{emp.id}</span>
          {emp.user_id && <> · User ID: <span className="font-mono">{emp.user_id}</span></>}
        </div>
      </div>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({
  icon, label, value, mono = false, accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-[#1a2035] border border-[#2a3550] flex items-center justify-center text-gray-500 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider">{label}</div>
        <div className={`text-sm truncate ${mono ? "font-mono" : "font-medium"} ${accent ? "text-blue-400" : "text-gray-200"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="min-h-screen bg-[#080d1a] p-10">
      <div className="max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-5 w-32 bg-[#1e2a45] rounded-lg" />
        <div className="h-60 bg-[#0d1120] border border-[#1e2a45] rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[#0d1120] border border-[#1e2a45] rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 h-64 bg-[#0d1120] border border-[#1e2a45] rounded-2xl" />
          <div className="md:col-span-2 h-64 bg-[#0d1120] border border-[#1e2a45] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Not Found ────────────────────────────────────────────────────────────────
function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center gap-4 text-gray-500">
      <svg className="w-14 h-14 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p className="text-sm">Employee not found.</p>
      <button onClick={onBack} className="text-violet-400 hover:text-violet-300 text-sm font-medium transition">
        ← Go back
      </button>
    </div>
  );
}
