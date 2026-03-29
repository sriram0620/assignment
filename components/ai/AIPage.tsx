"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  analyzeEmployeeWithGemini,
  fetchAllAIScores,
  fetchEmployees,
  fetchTasks,
  getSmartTaskAssignment,
} from "@/lib/api";
import type { AIScore, Employee } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color =
    score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2a45" strokeWidth={8} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill={color} fontSize={size * 0.24} fontWeight="bold">
        {score}
      </text>
    </svg>
  );
}

function TrendBadge({ trend }: { trend?: "improving" | "stable" | "declining" }) {
  const map = {
    improving: { icon: "↑", label: "Improving", cls: "text-green-300 bg-green-600/20 border-green-500/30" },
    stable: { icon: "→", label: "Stable", cls: "text-yellow-300 bg-yellow-600/20 border-yellow-500/30" },
    declining: { icon: "↓", label: "Declining", cls: "text-red-300 bg-red-600/20 border-red-500/30" },
  };
  const t = map[trend ?? "stable"];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${t.cls}`}>
      {t.icon} {t.label}
    </span>
  );
}

function HealthBadge({ health }: { health?: "good" | "needs_attention" | "critical" }) {
  const map = {
    good: { label: "Skill Health: Good", cls: "text-green-300 bg-green-600/20 border-green-500/30" },
    needs_attention: { label: "Needs Attention", cls: "text-yellow-300 bg-yellow-600/20 border-yellow-500/30" },
    critical: { label: "Critical Gaps", cls: "text-red-300 bg-red-600/20 border-red-500/30" },
  };
  const h = map[health ?? "good"];
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${h.cls}`}>
      {h.label}
    </span>
  );
}

function ImportancePill({ importance }: { importance: "critical" | "high" | "medium" }) {
  const cls = {
    critical: "bg-red-600/20 text-red-300 border-red-500/30",
    high: "bg-orange-600/20 text-orange-300 border-orange-500/30",
    medium: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
  }[importance];
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${cls}`}>
      {importance}
    </span>
  );
}

function MatchBar({ score }: { score: number }) {
  const color = score >= 75 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#1e2a45] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%`, transition: "width 0.5s ease" }} />
      </div>
      <span className="text-xs font-semibold text-white w-8 text-right">{score}%</span>
    </div>
  );
}

const SKILL_OPTIONS = [
  "React", "TypeScript", "Node.js", "PostgreSQL", "Solidity",
  "Python", "Docker", "AWS", "GraphQL", "REST APIs", "System Design",
];

// ─── Tab Definitions ─────────────────────────────────────────────────────────
type Tab = "overview" | "analyze" | "assign";

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AIPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  // ── Data fetches ────────────────────────────────────────────────────────────
  const { data: employees = [], isLoading: loadingEmployees } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });
  const { data: scores = {}, isLoading: loadingScores } = useQuery<Record<string, AIScore>>({
    queryKey: ["ai-scores"],
    queryFn: fetchAllAIScores,
  });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  // ── Sorted leaderboard ──────────────────────────────────────────────────────
  const scoredEmployees = useMemo(
    () =>
      [...employees].sort(
        (a, b) => (scores[b.id]?.score ?? 0) - (scores[a.id]?.score ?? 0)
      ),
    [employees, scores]
  );

  // Auto-select first employee
  useEffect(() => {
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) ?? null;

  if (loadingEmployees || loadingScores) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-[#080d1a] flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
          </div>
          <span className="text-gray-400 text-sm">Loading AI Intelligence…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d1a] p-6 md:p-8">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg shadow-lg shadow-violet-500/20">
                🤖
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  AI Workforce Intelligence
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Powered by{" "}
                  <span className="text-violet-400 font-semibold">Gemini 2.0 Flash</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 ml-13">
              Productivity scoring · Skill gap detection · Smart task assignment · Trend prediction
            </p>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-4">
            {[
              { label: "Employees Tracked", value: employees.length },
              { label: "Avg Score", value: employees.length ? Math.round(Object.values(scores).reduce((s, v) => s + v.score, 0) / (Object.values(scores).length || 1)) : 0 },
              { label: "Tasks Analyzed", value: tasks.length },
            ].map((s) => (
              <div key={s.label} className="text-center bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-2.5">
                <div className="text-lg font-bold text-white">{s.value}</div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mt-6 bg-[#0d1120] border border-[#1e2a45] rounded-xl p-1 w-fit">
          {([
            { id: "overview", label: "📊 Overview & Leaderboard" },
            { id: "analyze", label: "✨ Employee Analysis" },
            { id: "assign", label: "🎯 Smart Task Assignment" },
          ] as { id: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <OverviewTab
          employees={scoredEmployees}
          scores={scores}
          tasks={tasks}
          selectedId={selectedEmployeeId}
          onSelect={(id) => { setSelectedEmployeeId(id); setActiveTab("analyze"); }}
        />
      )}

      {/* ── Analyze Tab ── */}
      {activeTab === "analyze" && (
        <AnalyzeTab
          employees={employees}
          scores={scores}
          selectedEmployee={selectedEmployee}
          onSelectEmployee={setSelectedEmployeeId}
        />
      )}

      {/* ── Smart Assign Tab ── */}
      {activeTab === "assign" && (
        <SmartAssignTab employees={employees} />
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  employees,
  scores,
  tasks,
  selectedId,
  onSelect,
}: {
  employees: Employee[];
  scores: Record<string, AIScore>;
  tasks: { status: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const avgScore =
    employees.length > 0
      ? Math.round(
        Object.values(scores).reduce((s, v) => s + v.score, 0) /
        (Object.values(scores).length || 1)
      )
      : 0;

  const topPerformer = employees[0] ?? null;
  const needsAttention = [...employees].reverse().find((e) => (scores[e.id]?.score ?? 0) < 50);

  const avgScoreSub = avgScore >= 70 ? "Above benchmark" : avgScore >= 40 ? "Near benchmark" : "Below benchmark";
  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Summary cards — same visual style as Dashboard StatCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AIStatCard label="Team Avg Score" value={avgScore} sub={avgScoreSub} icon={<TrophyIcon />} color="violet" />
        <AIStatCard label="Top Performer" value={topPerformer?.full_name.split(" ")[0] ?? "—"} sub={topPerformer ? `${scores[topPerformer.id]?.score ?? 0} pts` : "No data yet"} icon={<StarIcon />} color="cyan" />
        <AIStatCard label="Tasks Completed" value={completedTasks} sub={`/ ${tasks.length} total`} icon={<CheckCircleIcon />} color="green" />
        <AIStatCard label="Needs Attention" value={needsAttention?.full_name.split(" ")[0] ?? "None"} sub={needsAttention ? `${scores[needsAttention.id]?.score ?? 0} pts` : "All on track"} icon={<AlertIcon />} color="orange" />
      </div>

      {/* Leaderboard */}
      <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e2a45] flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">AI Productivity Leaderboard</div>
            <div className="text-xs text-gray-500 mt-0.5">Ranked by completion rate & task history</div>
          </div>
          <div className="text-xs text-violet-400 font-medium">Click to deep-analyze →</div>
        </div>

        {employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No employees yet. Add employees to see the leaderboard.
          </div>
        ) : (
          <div className="divide-y divide-[#1e2a45]">
            {employees.map((emp, idx) => {
              const score = scores[emp.id]?.score ?? 0;
              const isTop = idx === 0;
              return (
                <button
                  key={emp.id}
                  onClick={() => onSelect(emp.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition text-left group"
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${idx === 0
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : idx === 1
                        ? "bg-gray-400/20 text-gray-300 border border-gray-500/30"
                        : idx === 2
                          ? "bg-orange-600/20 text-orange-300 border border-orange-500/30"
                          : "bg-[#1e2a45] text-gray-500"
                      }`}
                  >
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300 flex-shrink-0">
                    {emp.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{emp.full_name}</span>
                      {isTop && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-bold">
                          TOP
                        </span>
                      )}
                      {!emp.is_active && (
                        <span className="text-[10px] bg-gray-600/20 text-gray-400 border border-gray-500/30 px-1.5 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{emp.job_title} · {emp.department_name ?? "No dept"}</div>
                    <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                      {emp.skills.slice(0, 3).map((s) => (
                        <span key={s.skill_id} className="text-[10px] bg-violet-600/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full">
                          {s.skill_name}
                        </span>
                      ))}
                      {emp.skills.length > 3 && (
                        <span className="text-[10px] text-gray-600">+{emp.skills.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <ScoreRing score={score} size={56} />
                  </div>

                  {/* Analyze arrow */}
                  <div className="text-gray-600 group-hover:text-violet-400 transition ml-2 flex-shrink-0">
                    →
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analyze Tab ──────────────────────────────────────────────────────────────
type GeminiAnalysis = {
  employee_id: string;
  employee_name: string;
  productivity: {
    productivity_score: number;
    trend: "improving" | "stable" | "declining";
    ai_summary: string;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
    estimated_next_score: number;
    trend_reasoning: string;
  };
  skillGaps: {
    critical_gaps: Array<{
      skill: string;
      importance: "critical" | "high" | "medium";
      reason: string;
      learning_weeks: number;
    }>;
    nice_to_have: string[];
    development_plan: string;
    readiness_weeks: number;
    overall_skill_health: "good" | "needs_attention" | "critical";
  };
  analyzed_at: string;
};

function AnalyzeTab({
  employees,
  scores,
  selectedEmployee,
  onSelectEmployee,
}: {
  employees: Employee[];
  scores: Record<string, AIScore>;
  selectedEmployee: Employee | null;
  onSelectEmployee: (id: string) => void;
}) {
  const [analysisCache, setAnalysisCache] = useState<Record<string, GeminiAnalysis>>({});

  const analyzeMutation = useMutation({
    mutationFn: (employeeId: string) => analyzeEmployeeWithGemini(employeeId),
    onSuccess: (data: GeminiAnalysis) => {
      setAnalysisCache((prev) => ({ ...prev, [data.employee_id]: data }));
    },
  });

  const currentAnalysis = selectedEmployee ? analysisCache[selectedEmployee.id] ?? null : null;
  const baseScore = selectedEmployee ? (scores[selectedEmployee.id]?.score ?? 0) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Employee selector */}
      <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-4 h-fit">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Select Employee
        </div>
        {employees.length === 0 ? (
          <p className="text-sm text-gray-500">No employees found.</p>
        ) : (
          <div className="space-y-1.5">
            {employees.map((emp) => {
              const s = scores[emp.id]?.score ?? 0;
              const hasAnalysis = Boolean(analysisCache[emp.id]);
              return (
                <button
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition ${selectedEmployee?.id === emp.id
                    ? "border-violet-500 bg-violet-600/10"
                    : "border-[#1e2a45] bg-[#080d1a] hover:border-violet-500/40"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                        {emp.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{emp.full_name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{emp.job_title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {hasAnalysis && <span className="text-[10px] text-violet-400">✨</span>}
                      <span className={`text-xs font-bold ${s >= 70 ? "text-green-400" : s >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                        {s}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Analysis panel */}
      <div className="lg:col-span-3 space-y-5">
        {!selectedEmployee ? (
          <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-gray-400">Select an employee to analyze</p>
          </div>
        ) : (
          <>
            {/* Employee header + Analyze button */}
            <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/40 to-cyan-500/40 border border-violet-500/30 flex items-center justify-center text-xl font-bold text-violet-300">
                    {selectedEmployee.full_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedEmployee.full_name}</h2>
                    <p className="text-sm text-gray-400">{selectedEmployee.job_title} · {selectedEmployee.department_name ?? "No dept"}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {selectedEmployee.skills.slice(0, 4).map((s) => (
                        <span key={s.skill_id} className="text-[10px] bg-violet-600/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full">
                          {s.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {currentAnalysis && (
                    <div className="text-right">
                      <div className="text-[10px] text-gray-500">Last analyzed</div>
                      <div className="text-xs text-gray-400">
                        {new Date(currentAnalysis.analyzed_at).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => analyzeMutation.mutate(selectedEmployee.id)}
                    disabled={analyzeMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 shadow-lg shadow-violet-500/20"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analyzing…
                      </>
                    ) : (
                      <>✨ {currentAnalysis ? "Re-Analyze" : "Analyze with Gemini AI"}</>
                    )}
                  </button>
                </div>
              </div>

              {analyzeMutation.isError && (
                <div className="mt-4 bg-red-600/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400">
                  Analysis failed: {(analyzeMutation.error as Error)?.message ?? "Unknown error"}. Check GEMINI_API_KEY in .env.local.
                </div>
              )}
            </div>

            {/* Base Score (always shown) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Productivity Score
                </div>
                <div className="flex items-center gap-5">
                  <ScoreRing score={currentAnalysis?.productivity.productivity_score ?? baseScore} size={88} />
                  <div>
                    <TrendBadge trend={currentAnalysis?.productivity.trend} />
                    <div className="text-xs text-gray-400 mt-2 leading-relaxed">
                      {currentAnalysis?.productivity.ai_summary ?? "Run Gemini AI analysis to get an AI-powered summary."}
                    </div>
                    {currentAnalysis && (
                      <div className="mt-3 text-xs text-gray-500">
                        Predicted next score:{" "}
                        <span className="text-cyan-400 font-semibold">
                          {currentAnalysis.productivity.estimated_next_score}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {currentAnalysis && (
                  <div className="mt-4 p-3 bg-[#080d1a] rounded-xl border border-[#1e2a45] text-xs text-gray-400 italic">
                    📈 {currentAnalysis.productivity.trend_reasoning}
                  </div>
                )}
              </div>

              {/* Skill Health */}
              <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Skill Health
                  </div>
                  {currentAnalysis && (
                    <HealthBadge health={currentAnalysis.skillGaps.overall_skill_health} />
                  )}
                </div>
                {currentAnalysis ? (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400 mb-3 leading-relaxed">
                      {currentAnalysis.skillGaps.development_plan}
                    </div>
                    {currentAnalysis.skillGaps.nice_to_have.length > 0 && (
                      <div>
                        <div className="text-[10px] text-gray-600 uppercase tracking-wide mb-1">Nice to have</div>
                        <div className="flex flex-wrap gap-1">
                          {currentAnalysis.skillGaps.nice_to_have.map((s) => (
                            <span key={s} className="text-[10px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentAnalysis.skillGaps.readiness_weeks > 0 && (
                      <div className="mt-3 text-xs text-gray-500">
                        Estimated full readiness:{" "}
                        <span className="text-violet-400 font-semibold">
                          {currentAnalysis.skillGaps.readiness_weeks} weeks
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {selectedEmployee.skills.length > 0
                      ? `${selectedEmployee.skills.length} skills registered. Run AI analysis to check gaps.`
                      : "No skills registered. Run AI analysis for recommendations."}
                  </div>
                )}
              </div>
            </div>

            {/* Strengths & Concerns */}
            {currentAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5">
                  <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">
                    ✅ Strengths
                  </div>
                  <div className="space-y-2">
                    {currentAnalysis.productivity.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5">
                  <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">
                    ⚠️ Concerns
                  </div>
                  <div className="space-y-2">
                    {currentAnalysis.productivity.concerns.map((c, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{c}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {currentAnalysis && currentAnalysis.productivity.recommendations.length > 0 && (
              <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5">
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                  💡 AI Recommendations
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentAnalysis.productivity.recommendations.map((r, i) => (
                    <div key={i} className="bg-[#080d1a] border border-[#1e2a45] rounded-xl p-3">
                      <div className="text-xs text-cyan-400 font-bold mb-1">Step {i + 1}</div>
                      <p className="text-xs text-gray-300 leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Gap Details */}
            {currentAnalysis && currentAnalysis.skillGaps.critical_gaps.length > 0 && (
              <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5">
                <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-4">
                  🔍 Critical Skill Gaps
                </div>
                <div className="space-y-3">
                  {currentAnalysis.skillGaps.critical_gaps.map((gap, i) => (
                    <div key={i} className="bg-[#080d1a] border border-[#1e2a45] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">{gap.skill}</span>
                            <ImportancePill importance={gap.importance} />
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">{gap.reason}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-gray-500">Est. time</div>
                          <div className="text-sm font-bold text-violet-300">{gap.learning_weeks}w</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt to analyze if not yet done */}
            {!currentAnalysis && !analyzeMutation.isPending && (
              <div className="bg-[#0d1120] border border-dashed border-violet-500/30 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-gray-300 font-medium mb-1">Ready for Gemini AI Analysis</p>
                <p className="text-sm text-gray-500 mb-4">
                  Click &ldquo;Analyze with Gemini AI&rdquo; to get an AI-powered productivity score,
                  skill gap report, performance trend, and personalized recommendations.
                </p>
              </div>
            )}

            {analyzeMutation.isPending && (
              <div className="bg-[#0d1120] border border-violet-500/30 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 animate-pulse mx-auto mb-4 flex items-center justify-center text-2xl">
                  🤖
                </div>
                <p className="text-violet-300 font-semibold">Gemini is analyzing…</p>
                <p className="text-sm text-gray-500 mt-1">Processing task history, skills, and performance patterns</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Smart Task Assignment Tab ────────────────────────────────────────────────
function SmartAssignTab({ employees }: { employees: Employee[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const skillInputRef = useRef<HTMLInputElement>(null);

  const assignMutation = useMutation({
    mutationFn: () =>
      getSmartTaskAssignment({ title, description, required_skills: requiredSkills, priority }),
  });

  const addSkill = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills((p) => [...p, trimmed]);
    }
    setSkillInput("");
  };

  const result = assignMutation.data?.result ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            🎯 Describe the Task
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Task Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build REST API for auth module"
                className="w-full bg-[#080d1a] border border-[#1e2a45] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/60 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the task requirements, context, and expected deliverables…"
                className="w-full bg-[#080d1a] border border-[#1e2a45] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/60 transition resize-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Priority</label>
              <div className="grid grid-cols-4 gap-1.5">
                {["low", "medium", "high", "critical"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-lg text-xs font-semibold capitalize transition ${priority === p
                      ? p === "critical"
                        ? "bg-red-600 text-white"
                        : p === "high"
                          ? "bg-orange-600 text-white"
                          : p === "medium"
                            ? "bg-yellow-600 text-white"
                            : "bg-blue-600 text-white"
                      : "bg-[#1e2a45] text-gray-400 hover:text-gray-200"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Required Skills</label>
              {/* Quick picks */}
              <div className="flex flex-wrap gap-1 mb-2">
                {SKILL_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (requiredSkills.includes(s)) {
                        setRequiredSkills((p) => p.filter((x) => x !== s));
                      } else {
                        setRequiredSkills((p) => [...p, s]);
                      }
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition font-medium ${requiredSkills.includes(s)
                      ? "bg-violet-600 text-white border-violet-500"
                      : "bg-[#1e2a45] text-gray-400 border-[#2a3a55] hover:border-violet-500/40"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {/* Custom input */}
              <div className="flex gap-2">
                <input
                  ref={skillInputRef}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  placeholder="Custom skill + Enter"
                  className="flex-1 bg-[#080d1a] border border-[#1e2a45] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/60 transition"
                />
                <button
                  onClick={() => addSkill(skillInput)}
                  className="px-3 py-2 bg-violet-600/20 text-violet-400 border border-violet-500/30 rounded-xl text-xs hover:bg-violet-600/30 transition"
                >
                  Add
                </button>
              </div>
              {requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {requiredSkills.map((s) => (
                    <span key={s} className="flex items-center gap-1 text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                      {s}
                      <button onClick={() => setRequiredSkills((p) => p.filter((x) => x !== s))} className="text-violet-400 hover:text-red-400 transition">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={() => assignMutation.mutate()}
              disabled={!title.trim() || assignMutation.isPending || employees.length === 0}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
            >
              {assignMutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Getting AI Recommendations…
                </>
              ) : (
                <>🎯 Get Smart Assignment Recommendations</>
              )}
            </button>

            {employees.length === 0 && (
              <p className="text-xs text-gray-500 text-center">Add employees first to get assignment recommendations.</p>
            )}

            {assignMutation.isError && (
              <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400">
                {(assignMutation.error as Error)?.message ?? "Failed to get recommendations. Check GEMINI_API_KEY."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-5">
        {!result && !assignMutation.isPending && (
          <div className="bg-[#0d1120] border border-dashed border-[#1e2a45] rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-gray-300 font-medium mb-2">Smart Task Assignment</p>
            <p className="text-sm text-gray-500 max-w-sm">
              Describe your task on the left and Gemini AI will analyze all{" "}
              <strong className="text-gray-400">{employees.length} employees</strong> to recommend
              the best fit based on skills, workload, and performance history.
            </p>
          </div>
        )}

        {assignMutation.isPending && (
          <div className="bg-[#0d1120] border border-violet-500/30 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 animate-pulse flex items-center justify-center text-3xl mb-4">
              🤖
            </div>
            <p className="text-violet-300 font-semibold">Gemini is evaluating candidates…</p>
            <p className="text-sm text-gray-500 mt-2">
              Analyzing skills, workload, completion rates, and task history
            </p>
          </div>
        )}

        {result && (
          <>
            {/* Rationale */}
            <div className="bg-[#0d1120] border border-violet-500/30 rounded-2xl p-5">
              <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
                🤖 AI Rationale
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{result.assignment_rationale}</p>
            </div>

            {/* Recommendations */}
            <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1e2a45]">
                <div className="text-sm font-semibold text-white">Employee Rankings</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {result.recommendations.length} candidates evaluated
                </div>
              </div>
              <div className="divide-y divide-[#1e2a45]">
                {result.recommendations.map((rec, i) => {
                  const emp = employees.find((e) => e.id === rec.employee_id);
                  const isTop = rec.employee_id === result.top_pick_id;
                  return (
                    <div key={rec.employee_id} className={`p-5 ${isTop ? "bg-violet-600/5" : ""}`}>
                      <div className="flex items-start gap-4">
                        {/* Rank badge */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isTop
                            ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                            : "bg-[#1e2a45] text-gray-500"
                            }`}
                        >
                          {isTop ? "★" : i + 1}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300 flex-shrink-0">
                          {rec.employee_name.charAt(0)}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-white">{rec.employee_name}</span>
                            {isTop && (
                              <span className="text-[10px] bg-violet-600/30 text-violet-300 border border-violet-500/40 px-1.5 py-0.5 rounded-full font-bold">
                                TOP PICK
                              </span>
                            )}
                            {emp && (
                              <span className="text-[10px] text-gray-500">{emp.job_title}</span>
                            )}
                          </div>
                          <MatchBar score={rec.match_score} />
                          <p className="text-xs text-gray-400 mt-2 leading-relaxed">{rec.reason}</p>
                          {rec.risk && rec.risk !== "—" && (
                            <div className="mt-2 flex items-start gap-1.5">
                              <span className="text-orange-400 text-xs">⚠</span>
                              <p className="text-xs text-gray-500 italic">{rec.risk}</p>
                            </div>
                          )}
                          {emp && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {emp.skills.slice(0, 3).map((s) => (
                                <span key={s.skill_id} className="text-[10px] bg-[#1e2a45] text-gray-400 px-1.5 py-0.5 rounded-full">
                                  {s.skill_name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── AI Stat Card (same visual design as Dashboard StatCard) ──────────────────
function AIStatCard({
  label, value, sub, icon, color,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colors: Record<string, string> = {
    violet: "from-violet-600/20 to-violet-600/5 border-violet-500/20",
    cyan: "from-cyan-600/20   to-cyan-600/5   border-cyan-500/20",
    green: "from-green-600/20  to-green-600/5  border-green-500/20",
    orange: "from-orange-600/20 to-orange-600/5 border-orange-500/20",
  };
  const iconColors: Record<string, string> = {
    violet: "text-violet-400",
    cyan: "text-cyan-400",
    green: "text-green-400",
    orange: "text-orange-400",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className={`mb-3 ${iconColors[color]}`}>{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs font-semibold text-white/70 mb-0.5">{label}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
