"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCatalog, fetchDashboardStats, fetchEmployees, fetchMyEmployee, fetchTasks } from "@/lib/api";
import type { DashboardStats, Employee, Task } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PRIORITY_COLORS: Record<string, string> = {
  low: "#6b7280",
  medium: "#3b82f6",
  high: "#f59e0b",
  critical: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#6b7280",
  assigned: "#3b82f6",
  in_progress: "#8b5cf6",
  review: "#f59e0b",
  completed: "#10b981",
  cancelled: "#ef4444",
};

export default function DashboardPage() {
  const { user } = useAppStore();
  const isEmployee = user?.hrms_role === "employee";

  // Shared queries
  const { data: stats,     isLoading: loadingStats }     = useQuery<DashboardStats>({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats });
  const { data: employees = [], isLoading: loadingEmployees } = useQuery<Employee[]>({ queryKey: ["employees"],      queryFn: fetchEmployees, enabled: !isEmployee });
  const { data: tasks    = [], isLoading: loadingTasks }  = useQuery<Task[]>({         queryKey: ["tasks"],          queryFn: fetchTasks });
  const { data: catalog,   isLoading: loadingCatalog }    = useQuery({                 queryKey: ["catalog"],        queryFn: fetchCatalog });
  const { data: myEmployee, isLoading: loadingMe }        = useQuery({                 queryKey: ["my-employee"],    queryFn: fetchMyEmployee, enabled: isEmployee });
  const org = catalog?.org;

  // ── ALL HOOKS BEFORE ANY EARLY RETURN ────────────────────────────────────────
  const priorityChartData = useMemo(
    () => stats ? Object.entries(stats.tasks_by_priority as Record<string, number>)
      .map(([k, v]) => ({ name: k, value: v, color: PRIORITY_COLORS[k] })) : [],
    [stats]
  );
  const statusChartData = useMemo(
    () => stats ? Object.entries(stats.tasks_by_status as Record<string, number>)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: k.replace("_", " "), value: v, color: STATUS_COLORS[k] })) : [],
    [stats]
  );
  const topPerformers = useMemo(
    () => [...employees].filter(e => e.is_active && e.productivity_score)
      .sort((a, b) => (b.productivity_score ?? 0) - (a.productivity_score ?? 0)).slice(0, 5),
    [employees]
  );
  const recentTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5),
    [tasks]
  );
  const productivityData = useMemo(() => {
    const byMonth = new Map<string, { total: number; completed: number }>();
    for (const task of tasks) {
      const month = new Date(task.updated_at).toLocaleDateString("en-US", { month: "short" });
      const curr  = byMonth.get(month) ?? { total: 0, completed: 0 };
      curr.total  += 1;
      if (task.status === "completed") curr.completed += 1;
      byMonth.set(month, curr);
    }
    return [...byMonth.entries()].map(([month, v]) => ({ month, score: v.total ? Math.round((v.completed / v.total) * 100) : 0 }));
  }, [tasks]);

  const taskVelocityData = useMemo(() => {
    const byWeek = new Map<string, { created: number; completed: number }>();
    for (const task of tasks) {
      const d   = new Date(task.created_at);
      const lbl = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString("en-US", { month: "short" })}`;
      const curr = byWeek.get(lbl) ?? { created: 0, completed: 0 };
      curr.created += 1;
      if (task.status === "completed") curr.completed += 1;
      byWeek.set(lbl, curr);
    }
    return [...byWeek.entries()].map(([week, data]) => ({ week, ...data }));
  }, [tasks]);

  // Employee-specific computed values
  const myTasksTotal     = tasks.length;
  const myCompleted      = tasks.filter(t => t.status === "completed").length;
  const myInProgress     = tasks.filter(t => t.status === "in_progress").length;
  const myAssigned       = tasks.filter(t => t.status === "assigned").length;
  const myCompletionPct  = myTasksTotal > 0 ? Math.round((myCompleted / myTasksTotal) * 100) : 0;

  const loading = loadingStats || loadingTasks || loadingCatalog || (isEmployee ? loadingMe : loadingEmployees);
  if (loading || !org) return <LoadingState />;

  // ── EMPLOYEE VIEW ─────────────────────────────────────────────────────────────
  if (isEmployee) {
    const score = myEmployee?.productivity_score;
    const scoreColor = score !== undefined
      ? score >= 90 ? "text-green-400" : score >= 80 ? "text-violet-400" : score >= 70 ? "text-yellow-400" : "text-red-400"
      : "text-gray-400";

    return (
      <div className="p-8 max-w-4xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Good {getTimeOfDay()}, {user?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {org.name} · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* ── Progress Overview ── */}
        <div className="bg-gradient-to-br from-violet-600/15 to-cyan-600/10 border border-violet-500/25 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-white">My Task Completion</div>
              <div className="text-xs text-gray-500 mt-0.5">{myTasksTotal} tasks total</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-violet-400">{myCompletionPct}%</div>
              <div className="text-xs text-gray-500">completed</div>
            </div>
          </div>
          <div className="h-3 bg-[#1e2a45] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-700"
              style={{ width: `${myCompletionPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Assigned",    value: myAssigned,   color: "text-blue-400",   bg: "bg-blue-600/10",   border: "border-blue-500/25" },
              { label: "In Progress", value: myInProgress, color: "text-violet-400", bg: "bg-violet-600/10", border: "border-violet-500/25" },
              { label: "Completed",   value: myCompleted,  color: "text-green-400",  bg: "bg-green-600/10",  border: "border-green-500/25" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 text-center`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Score + Skills row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* AI Productivity Score */}
          <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <SparkleIcon />
              <div className="text-sm font-bold text-white">AI Productivity Score</div>
            </div>
            {score !== undefined ? (
              <>
                <div className={`text-5xl font-black ${scoreColor} mb-2`}>
                  {score}
                  <span className="text-lg text-gray-500 font-normal">/100</span>
                </div>
                <div className="h-2 bg-[#1e2a45] rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: `${score}%` }} />
                </div>
                <div className="text-xs text-gray-500">
                  {score >= 90 ? "🏆 Exceptional performance" : score >= 80 ? "✅ Above average" : score >= 70 ? "📈 On track" : "⚠️ Needs improvement"}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600 italic">Score not yet calculated</div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
            <div className="text-sm font-bold text-white mb-4">My Skills</div>
            {myEmployee?.skills && myEmployee.skills.length > 0 ? (
              <div className="space-y-3">
                {myEmployee.skills.slice(0, 6).map(s => (
                  <div key={s.skill_id} className="flex items-center gap-3">
                    <div className="text-xs text-gray-300 w-24 flex-shrink-0 truncate">{s.skill_name}</div>
                    <div className="flex-1 h-1.5 bg-[#1e2a45] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: `${(s.proficiency / 5) * 100}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-500 w-16 text-right">
                      {["","Beginner","Elementary","Intermediate","Advanced","Expert"][s.proficiency]}
                    </div>
                  </div>
                ))}
                {myEmployee.skills.length > 6 && (
                  <div className="text-xs text-gray-600 text-center">+{myEmployee.skills.length - 6} more</div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-gray-600 italic">No skills recorded yet</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Task Velocity (mine) ── */}
        <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-bold text-white">My Task Velocity</div>
              <div className="text-xs text-gray-500 mt-0.5">Tasks created vs completed per week</div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded bg-violet-500" /><span className="text-gray-400">Created</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded bg-cyan-500" /><span className="text-gray-400">Completed</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={taskVelocityData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" />
              <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e2a45", borderRadius: "10px", color: "#fff", fontSize: "12px" }} cursor={{ fill: "rgba(124,58,237,0.06)" }} />
              <Bar dataKey="created" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── My Recent Tasks ── */}
        <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm font-bold text-white">My Recent Tasks</div>
            <a href="/tasks" className="text-xs text-violet-400 hover:text-violet-300 transition">View all →</a>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">No tasks assigned yet</div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-[#080d1a] border border-[#1e2a45] rounded-xl">
                  <StatusDot status={task.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{task.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 capitalize">{task.status.replace("_", " ")}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ADMIN / MANAGER VIEW ──────────────────────────────────────────────────────
  if (!stats) return <LoadingState />;
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good {getTimeOfDay()}, {user?.full_name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {org.name} · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 bg-[#0d1120] border border-[#1e2a45] rounded-lg px-3 py-2">
              <span className="text-violet-400 font-semibold">{org.plan.toUpperCase()}</span> Plan
            </div>
            <div className="text-xs text-gray-500 bg-[#0d1120] border border-[#1e2a45] rounded-lg px-3 py-2">
              AI-HRMS <span className="text-cyan-400 font-semibold">v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Employees" value={stats.total_employees} sub={`${stats.active_employees} active`} icon={<UserGroupIcon />} color="violet" />
        <StatCard label="Active Tasks" value={stats.assigned_tasks + stats.in_progress_tasks} sub={`${stats.completed_tasks} completed`} icon={<TaskIcon />} color="cyan" />
        <StatCard label="Completed Tasks" value={stats.completed_tasks} sub={`${stats.overdue_tasks} overdue`} icon={<CheckIcon />} color="green" />
        <StatCard label="Avg AI Score" value={`${stats.avg_productivity_score.toFixed(1)}`} sub="productivity index" icon={<SparkleIcon />} color="orange" />
        </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-bold text-white">Avg Productivity Score</div>
              <div className="text-xs text-gray-500 mt-0.5">Trend across all employees</div>
            </div>
            <div className="text-2xl font-bold text-violet-400">
              {stats.avg_productivity_score.toFixed(1)}
              <span className="text-sm text-green-400 ml-2">↑ +2.1</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e2a45", borderRadius: "12px", color: "#fff", fontSize: "12px" }} cursor={{ stroke: "#1e2a45", strokeWidth: 1, fill: "rgba(124,58,237,0.04)" }} />
              <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: "#7c3aed", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
          <div className="text-sm font-bold text-white mb-1">Task Status</div>
          <div className="text-xs text-gray-500 mb-5">Current distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e2a45", borderRadius: "8px", color: "#fff", fontSize: "12px" }} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {statusChartData.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-gray-400 capitalize">{s.name}</span>
                </div>
                <span className="text-white font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Velocity */}
      <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-sm font-bold text-white">Task Velocity</div>
            <div className="text-xs text-gray-500 mt-0.5">Tasks created vs completed per week</div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded bg-violet-500" /><span className="text-gray-400">Created</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded bg-cyan-500" /><span className="text-gray-400">Completed</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={taskVelocityData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" />
            <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0d1120", border: "1px solid #1e2a45", borderRadius: "10px", color: "#fff", fontSize: "12px" }} cursor={{ fill: "rgba(124,58,237,0.06)" }} />
            <Bar dataKey="created" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm font-bold text-white">Top Performers</div>
            <span className="text-xs text-violet-400 bg-violet-600/10 border border-violet-500/30 px-2.5 py-1 rounded-lg">AI Ranked</span>
          </div>
          <div className="space-y-3">
            {topPerformers.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-amber-700 text-white" : "bg-[#1e2a45] text-gray-400"}`}>{i + 1}</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{emp.full_name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{emp.full_name}</div>
                  <div className="text-xs text-gray-500 truncate">{emp.job_title}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-1.5 bg-[#1e2a45] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${(emp.productivity_score ?? 0) >= 90 ? "bg-green-500" : (emp.productivity_score ?? 0) >= 80 ? "bg-violet-500" : "bg-yellow-500"}`} style={{ width: `${emp.productivity_score ?? 0}%` }} />
                  </div>
                  <span className="text-xs font-bold text-white w-8 text-right">{emp.productivity_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm font-bold text-white">Recent Tasks</div>
            <span className="text-xs text-gray-500">Last updated</span>
          </div>
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3">
                <StatusDot status={task.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{task.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.assigned_to_name && <span className="text-xs text-gray-500">{task.assigned_to_name}</span>}
                    {task.ai_assigned && <span className="text-[10px] bg-orange-600/15 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded-md font-semibold">AI</span>}
                    {task.tx_hash && <span className="text-[10px] bg-blue-600/15 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-md font-semibold">On-Chain</span>}
                  </div>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    violet: "from-violet-600/20 to-violet-600/5 border-violet-500/20",
    cyan: "from-cyan-600/20 to-cyan-600/5 border-cyan-500/20",
    green: "from-green-600/20 to-green-600/5 border-green-500/20",
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

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-gray-500",
    assigned: "bg-blue-500",
    in_progress: "bg-violet-500",
    review: "bg-yellow-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };
  return <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors[status] ?? "bg-gray-500"}`} />;
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: "bg-gray-600/20 text-gray-400 border-gray-500/30",
    medium: "bg-blue-600/20 text-blue-400 border-blue-500/30",
    high: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
    critical: "bg-red-600/20 text-red-400 border-red-500/30",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border flex-shrink-0 ${styles[priority] ?? styles.medium}`}>
      {priority.toUpperCase()}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="p-8">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-[#1e2a45] rounded-xl w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[#0d1120] border border-[#1e2a45] rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-64 bg-[#0d1120] border border-[#1e2a45] rounded-2xl" />
          <div className="h-64 bg-[#0d1120] border border-[#1e2a45] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function UserGroupIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
