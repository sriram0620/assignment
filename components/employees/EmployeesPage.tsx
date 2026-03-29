"use client";

import { useRef, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEmployee, fetchCatalog, fetchEmployees, updateEmployee, resetEmployeePassword } from "@/lib/api";
import type { Department, Employee, Role, Skill } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import Sheet from "@/components/ui/slide-panel";

// ─── Client-side password generator (mirrors server logic) ────────────────────
function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const syms = "@#$%!";
  const pool = upper + lower + digits + syms;
  const pick = (cs: string) => cs[Math.floor(Math.random() * cs.length)];
  const chars = [
    pick(upper), pick(lower), pick(digits), pick(syms),
    ...Array.from({ length: 8 }, () => pick(pool)),
  ];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

type FilterDept = "all" | string;
type FilterStatus = "all" | "active" | "inactive";

// ─── Shared input / field styles ─────────────────────────────────────────────
const inputCls =
  "w-full bg-[#080d1a] border border-[#1e2a45] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const { user } = useAppStore();
  const [filterDept, setFilterDept] = useState<FilterDept>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  // Sheet state
  const [addOpen, setAddOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  // Success dialog after employee creation
  const [createdInfo, setCreatedInfo] = useState<{ employee: Employee; plainPassword: string } | null>(null);

  const qc = useQueryClient();

  const { data: employees = [], isLoading: loadingEmployees } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });
  const { data: catalog, isLoading: loadingCatalog } = useQuery({
    queryKey: ["catalog"],
    queryFn: fetchCatalog,
  });
  const departments: Department[] = catalog?.departments ?? [];
  const skills: Skill[] = catalog?.skills ?? [];

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateEmployee>[1] }) =>
      updateEmployee(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });

  const filtered = employees.filter(e => {
    if (filterDept !== "all" && e.department_id !== filterDept) return false;
    if (filterStatus === "active" && !e.is_active) return false;
    if (filterStatus === "inactive" && e.is_active) return false;
    if (
      search &&
      !e.full_name.toLowerCase().includes(search.toLowerCase()) &&
        !e.email.toLowerCase().includes(search.toLowerCase()) &&
      !e.job_title.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  if (loadingEmployees || loadingCatalog) return <PageLoader />;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-gray-400 text-sm mt-1">
            {employees.filter(e => e.is_active).length} active · {employees.length} total
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-900/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, title…"
            className="w-full pl-10 pr-4 py-2.5 bg-[#0d1120] border border-[#1e2a45] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition"
          />
        </div>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition"
        >
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <div className="flex rounded-xl bg-[#0d1120] border border-[#1e2a45] p-1">
          {(["all", "active", "inactive"] as FilterStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filterStatus === s
                ? "bg-violet-600 text-white"
                : "text-gray-400 hover:text-gray-200"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <svg className="w-12 h-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">No employees match your filters.</p>
          <button
            onClick={() => setAddOpen(true)}
            className="mt-4 text-violet-400 hover:text-violet-300 text-sm font-medium transition"
          >
            + Add your first employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(emp => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onEdit={() => setEditEmployee(emp)}
              onView={() => setViewEmployee(emp)}
            />
          ))}
        </div>
      )}

      {/* ── Add Employee Sheet ─────────────────────────────────────────────── */}
      <AddEmployeeSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        departments={departments}
        skills={skills}
        canAssignAdmin={user?.hrms_role === "admin"}
        onAdd={async input => {
          const result = await createMutation.mutateAsync(input);
          setAddOpen(false);
          // Show success dialog with the generated password
          if (result.employee) {
            setCreatedInfo({
              employee: result.employee,
              plainPassword: result.plainPassword ?? input.password ?? "",
            });
          }
        }}
      />

      {/* ── Created Employee Success Dialog ────────────────────────────── */}
      {createdInfo && (
        <CreatedEmployeeDialog
          employee={createdInfo.employee}
          plainPassword={createdInfo.plainPassword}
          onClose={() => setCreatedInfo(null)}
        />
      )}


      {/* ── Edit Employee Sheet ────────────────────────────────────────────── */}
      <EditEmployeeSheet
        employee={editEmployee}
        onClose={() => setEditEmployee(null)}
        canAssignAdmin={user?.hrms_role === "admin"}
        catalogSkills={skills}
        onSave={async (id, updates) => {
          await updateMutation.mutateAsync({ id, updates });
          setEditEmployee(null);
        }}
      />

      {/* ── View Employee Detail Panel ──────────────────────────────────────── */}
      <EmployeeDetailPanel
        employee={viewEmployee}
        onClose={() => setViewEmployee(null)}
        onEdit={(emp) => { setViewEmployee(null); setEditEmployee(emp); }}
      />
    </div>
  );
}

// ─── Employee Card ────────────────────────────────────────────────────────────
function EmployeeCard({ employee: emp, onEdit, onView }: { employee: Employee; onEdit: () => void; onView: () => void }) {
  const scoreColor = (s: number) =>
    s >= 90 ? "text-green-400" : s >= 80 ? "text-violet-400" : s >= 70 ? "text-yellow-400" : "text-red-400";
  const scoreBg = (s: number) =>
    s >= 90 ? "bg-green-500" : s >= 80 ? "bg-violet-500" : s >= 70 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl p-5 hover:border-violet-500/50 hover:bg-[#0f1428] transition-all group relative">

      {/* ── Top row: avatar + name + status dot ─────────────────────────── */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
            {emp.full_name.charAt(0)}
          </div>

        {/* Name + title — grows to fill space */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">
            {emp.full_name}
          </div>
          <div className="text-xs text-gray-500 truncate">{emp.job_title}</div>
          {/* Status badge — clearly separate from action icons */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${emp.is_active ? "bg-green-400" : "bg-gray-600"}`}
            />
            <span className={`text-[10px] font-semibold ${emp.is_active ? "text-green-400" : "text-gray-500"}`}>
              {emp.is_active ? "Active" : "Inactive"}
            </span>
        </div>
        </div>

        {/* Action buttons — right side, always visible (subtle), brighter on hover */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* View Profile button */}
          <button
            onClick={e => { e.stopPropagation(); onView(); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-cyan-400 hover:bg-cyan-600/10 transition-all"
            title="View employee details"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {/* Edit button */}
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-violet-400 hover:bg-violet-600/10 transition-all"
            title="Edit employee"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {emp.department_name ?? "No Department"}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{emp.email}</span>
        </div>
        {emp.wallet_address && (
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {emp.wallet_address.slice(0, 8)}…{emp.wallet_address.slice(-6)}
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {emp.skills.slice(0, 3).map(s => (
          <span key={s.skill_id} className="text-[10px] bg-[#1a2035] border border-[#2a3550] text-gray-300 px-2 py-0.5 rounded-md">
            {s.skill_name}
          </span>
        ))}
        {emp.skills.length > 3 && (
          <span className="text-[10px] bg-[#1a2035] border border-[#2a3550] text-gray-500 px-2 py-0.5 rounded-md">
            +{emp.skills.length - 3}
          </span>
        )}
      </div>

      {/* Score + Role */}
      {emp.productivity_score !== undefined && (
        <div className="border-t border-[#1e2a45] pt-3 mt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">AI Productivity</span>
            <span className={`text-sm font-bold ${scoreColor(emp.productivity_score)}`}>
              {emp.productivity_score}
            </span>
          </div>
          <div className="h-1.5 bg-[#1e2a45] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${scoreBg(emp.productivity_score)}`}
              style={{ width: `${emp.productivity_score}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{emp.tasks_completed}/{emp.tasks_assigned} tasks</span>
            <RoleBadge role={emp.role} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Employee Detail Panel ───────────────────────────────────────────────────
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

const roleStyles: Record<Role, { bg: string; text: string; border: string; label: string }> = {
  admin: { bg: "bg-violet-600/20", text: "text-violet-300", border: "border-violet-500/30", label: "Admin" },
  hr_manager: { bg: "bg-cyan-600/20", text: "text-cyan-300", border: "border-cyan-500/30", label: "HR Manager" },
  manager: { bg: "bg-blue-600/20", text: "text-blue-300", border: "border-blue-500/30", label: "Manager" },
  employee: { bg: "bg-gray-600/20", text: "text-gray-400", border: "border-gray-500/30", label: "Employee" },
};

function EmployeeDetailPanel({
  employee: emp,
  onClose,
  onEdit,
}: {
  employee: Employee | null;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
}) {
  if (!emp) return null;

  const role = roleStyles[emp.role];
  const score = emp.productivity_score ?? 0;
  const initials = emp.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const completionRate = emp.tasks_assigned
    ? Math.round(((emp.tasks_completed ?? 0) / emp.tasks_assigned) * 100)
    : 0;
  const scoreGrad = (s: number) =>
    s >= 90 ? "from-green-500 to-emerald-400"
      : s >= 80 ? "from-violet-500 to-cyan-400"
        : s >= 70 ? "from-yellow-500 to-amber-400"
          : "from-red-500 to-rose-400";
  const scoreLabel = (s: number) =>
    s >= 90 ? "Exceptional" : s >= 80 ? "High" : s >= 70 ? "Moderate" : "Needs Attention";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0a0f1e] border-l border-[#1e2a45] shadow-2xl z-50 overflow-y-auto flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-[#0a0f1e]/95 backdrop-blur-sm border-b border-[#1e2a45] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-sm font-bold text-white">Employee Profile</div>
            <div className="text-xs text-gray-500 mt-0.5">{emp.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(emp)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 hover:text-violet-300 border border-violet-500/30 rounded-lg text-xs font-semibold transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-[#1e2a45] transition-all"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-5">

          {/* ── Hero ───────────────────────────────────────────────────────── */}
          <div className="relative bg-[#0d1120] border border-[#1e2a45] rounded-2xl overflow-hidden">
            <div className={`h-20 bg-gradient-to-r ${nameToGrad(emp.full_name)} opacity-20`} />
            <div className="px-6 pb-6">
              <div className="-mt-10 mb-4 flex items-end justify-between">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${nameToGrad(emp.full_name)} flex items-center justify-center text-xl font-black text-white ring-4 ring-[#0d1120] shadow-xl flex-shrink-0`}>
                  {initials}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${emp.is_active
                  ? "bg-green-600/15 text-green-300 border border-green-500/25"
                  : "bg-red-600/15 text-red-300 border border-red-500/25"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${emp.is_active ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  {emp.is_active ? "Active" : "Inactive"}
                </div>
              </div>
              <h2 className="text-xl font-black text-white mb-0.5">{emp.full_name}</h2>
              <p className="text-gray-400 text-sm mb-3">{emp.job_title}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${role.bg} ${role.text} ${role.border}`}>
                  {role.label}
                </span>
                {emp.department_name && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 bg-[#1a2035] border border-[#2a3550] px-2.5 py-1 rounded-lg">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {emp.department_name}
                  </span>
                )}
                {emp.hire_date && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 bg-[#1a2035] border border-[#2a3550] px-2.5 py-1 rounded-lg">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {new Date(emp.hire_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Stats Grid ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Tasks Assigned", value: emp.tasks_assigned ?? "—", color: "text-blue-400", bg: "bg-blue-600/10" },
              { label: "Tasks Completed", value: emp.tasks_completed ?? "—", color: "text-green-400", bg: "bg-green-600/10" },
              { label: "Completion Rate", value: emp.tasks_assigned ? `${completionRate}%` : "—", color: "text-violet-400", bg: "bg-violet-600/10" },
              { label: "AI Score", value: emp.productivity_score !== undefined ? `${emp.productivity_score}/100` : "—", color: "text-cyan-400", bg: "bg-cyan-600/10" },
            ].map(stat => (
              <div key={stat.label} className="bg-[#0d1120] border border-[#1e2a45] rounded-xl p-4">
                <div className={`text-xl font-black ${stat.color} mb-0.5`}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── AI Productivity Score ───────────────────────────────────────── */}
          {emp.productivity_score !== undefined && (
            <div className="bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border border-violet-500/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">AI Productivity</div>
                  <div className="text-xs text-gray-600">Computed from task performance</div>
                </div>
                <div className={`text-2xl font-black bg-gradient-to-r ${scoreGrad(score)} bg-clip-text text-transparent`}>
                  {score}
                </div>
              </div>
              <div className="h-2.5 bg-[#1e2a45] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${scoreGrad(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">0</span>
                <span className={`font-semibold ${score >= 90 ? "text-green-400" : score >= 80 ? "text-violet-400" : score >= 70 ? "text-yellow-400" : "text-red-400"
                  }`}>{scoreLabel(score)} Performance</span>
                <span className="text-gray-600">100</span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { label: "Task Completion", val: completionRate, color: "bg-green-500" },
                  { label: "Productivity Index", val: score, color: "bg-violet-500" },
                  { label: "Engagement", val: Math.min(100, Math.round(score * 0.95)), color: "bg-cyan-500" },
                ].map(bar => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
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

          {/* ── Contact & Details ───────────────────────────────────────────── */}
          <div className="bg-[#0d1120] border border-[#1e2a45] rounded-xl p-5">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Contact & Details</div>
            <div className="space-y-3">
              {[[
                <svg key="em" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
                "Email", emp.email, true, false,
              ] as const,
              ...(emp.department_name ? [[
                <svg key="dep" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
                "Department", emp.department_name, false, false,
              ] as const] : []),
              ...(emp.hire_date ? [[
                <svg key="hd" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                "Hire Date", new Date(emp.hire_date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }), false, false,
              ] as const] : []),
              ...(emp.wallet_address ? [[
                <svg key="wa" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
                "Wallet", `${emp.wallet_address.slice(0, 10)}…${emp.wallet_address.slice(-6)}`, true, true,
              ] as const] : []),
              ].map(([icon, label, value, mono, accent], i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1a2035] border border-[#2a3550] flex items-center justify-center text-gray-500 flex-shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider">{label as string}</div>
                    <div className={`text-sm truncate ${mono ? "font-mono" : "font-medium"} ${accent ? "text-blue-400" : "text-gray-200"}`}>
                      {value as string}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Skills ─────────────────────────────────────────────────────── */}
          {emp.skills.length > 0 && (
            <div className="bg-[#0d1120] border border-[#1e2a45] rounded-xl p-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Skills</div>
              <div className="flex flex-wrap gap-2">
                {emp.skills.map(s => (
                  <span
                    key={s.skill_id}
                    className="text-xs bg-[#1a2035] border border-[#2a3550] text-gray-300 px-2.5 py-1 rounded-lg font-medium hover:border-violet-500/40 hover:text-violet-300 transition-all"
                  >
                    {s.skill_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Employee ID ─────────────────────────────────────────────────── */}
          <div className="text-center text-gray-700 text-xs pb-2">
            Employee ID: <span className="font-mono">{emp.id}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    admin: "bg-violet-600/20 text-violet-300 border-violet-500/30",
    hr_manager: "bg-cyan-600/20 text-cyan-300 border-cyan-500/30",
    manager: "bg-blue-600/20 text-blue-300 border-blue-500/30",
    employee: "bg-gray-600/20 text-gray-400 border-gray-500/30",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${styles[role]}`}>
      {role.replace("_", " ").toUpperCase()}
    </span>
  );
}

// ─── Created Employee Success Dialog ─────────────────────────────────────────
function CreatedEmployeeDialog({
  employee,
  plainPassword,
  onClose,
}: {
  employee: Employee;
  plainPassword: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(plainPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1120] border border-green-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-green-900/20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Employee Created!</div>
            <div className="text-xs text-gray-500">{employee.full_name} · {employee.email}</div>
          </div>
        </div>

        {/* Password box */}
        <div className="bg-[#080d1a] border border-[#1e2a45] rounded-xl p-4 mb-4 space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Login Credentials</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 w-16 flex-shrink-0">Email</span>
              <code className="flex-1 text-xs font-mono text-violet-300 truncate">{employee.email}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 w-16 flex-shrink-0">Password</span>
              <code className="flex-1 text-sm font-mono text-green-300 tracking-wider">{plainPassword}</code>
              <button
                onClick={copy}
                className="flex-shrink-0 px-2.5 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-xs font-semibold transition border border-green-500/30"
              >
                {copied ? "✓" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Email note */}
        <div className="bg-violet-600/8 border border-violet-500/20 rounded-xl px-3 py-2.5 mb-5 flex items-start gap-2">
          <svg className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            A welcome email with these credentials has been sent to{" "}
            <span className="text-violet-300 font-mono">{employee.email}</span>.
            Make sure to share the password securely with the employee.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ─── Add Employee Sheet ───────────────────────────────────────────────────────
function AddEmployeeSheet({
  open,
  onClose,
  departments,
  skills,
  canAssignAdmin,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  departments: Department[];
  skills: Skill[];
  canAssignAdmin: boolean;
  onAdd: (input: {
    full_name: string;
    email: string;
    password: string;
    role: Role;
    department_id?: string;
    job_title: string;
    wallet_address?: string;
    hire_date?: string;
    skill_ids: string[];
    custom_skills: string[];
  }) => Promise<void>;
}) {
  const freshPassword = useCallback(() => generatePassword(), []);

  const [form, setForm] = useState(() => ({
    full_name: "",
    email: "",
    password: generatePassword(),   // auto-generate on first render
    job_title: "",
    department_id: "",
    role: "employee" as Role,
    wallet_address: "",
    hire_date: "",
  }));
  const [showPassword, setShowPassword] = useState(false);
  // Predefined skill toggles
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  // Custom skill chip input
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [chipInput, setChipInput] = useState("");
  const chipRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSaving(true);
    try {
      await onAdd({
      full_name: form.full_name,
      email: form.email,
        password: form.password,
      role: form.role,
        department_id: form.department_id || undefined,
      job_title: form.job_title,
      wallet_address: form.wallet_address || undefined,
        hire_date: form.hire_date || undefined,
        skill_ids: selectedSkills,
        custom_skills: customSkills,
      });
      // Reset form with a fresh generated password for next use
      setForm({ full_name: "", email: "", password: generatePassword(), job_title: "", department_id: "", role: "employee", wallet_address: "", hire_date: "" });
      setSelectedSkills([]);
      setCustomSkills([]);
      setChipInput("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create employee.");
    } finally {
    setSaving(false);
    }
  };

  const toggleSkill = (id: string) =>
    setSelectedSkills(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  // Add chip on Enter or comma
  const handleChipKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip();
    } else if (e.key === "Backspace" && chipInput === "" && customSkills.length > 0) {
      setCustomSkills(prev => prev.slice(0, -1));
    }
  };

  const addChip = () => {
    const val = chipInput.trim().replace(/,$/, "");
    if (val && !customSkills.includes(val)) {
      setCustomSkills(prev => [...prev, val]);
    }
    setChipInput("");
  };

  const removeChip = (chip: string) =>
    setCustomSkills(prev => prev.filter(c => c !== chip));

  return (
    <Sheet open={open} onClose={onClose} title="Add New Employee" description="Fill in the details to onboard a new team member." width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="bg-red-600/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* ── Personal Info ── */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className={inputCls} placeholder="Jane Doe" required />
          </Field>
          <Field label="Email" required>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="jane@acme.com" required />
          </Field>
          <Field label="Job Title" required>
            <input value={form.job_title} onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))} className={inputCls} placeholder="Senior Engineer" required />
          </Field>
          <Field label="Department">
            <select value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))} className={inputCls}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Role" required>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))} className={inputCls}>
              <option value="employee">Employee</option>

              {canAssignAdmin && <option value="admin">Admin</option>}
            </select>
          </Field>
          <Field label="Hire Date">
            <input type="date" value={form.hire_date} onChange={e => setForm(p => ({ ...p, hire_date: e.target.value }))} className={inputCls} />
          </Field>
        </div>

        {/* ── Login Password ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">
            Login Password <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="flex gap-2">
            {/* Input + eye toggle */}
            <div className="relative flex-1">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className={inputCls + " pr-10"}
                placeholder="Min. 6 characters"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Regenerate button */}
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, password: freshPassword() }))}
              title="Generate a new random password"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-[#1a2035] hover:bg-violet-600/20 text-gray-400 hover:text-violet-300 border border-[#2a3550] hover:border-violet-500/40 rounded-xl text-xs font-semibold transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New
            </button>
          </div>
          {/* Email note */}
          <div className="mt-2 bg-violet-600/8 border border-violet-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
            <svg className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              A welcome email with these credentials will be sent to{" "}
              <span className="text-violet-400 font-mono">{form.email || "the employee's email"}</span>.
              They can use it to log in immediately.
            </p>
          </div>
        </div>

        {/* ── Wallet Address with MetaMask Connect ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">
            Wallet Address <span className="font-normal text-gray-600">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              value={form.wallet_address}
              onChange={e => setForm(p => ({ ...p, wallet_address: e.target.value }))}
              className={`${inputCls} flex-1`}
              placeholder="0x…"
            />
            <button
              type="button"
              onClick={async () => {
                const eth = typeof window !== "undefined" ? window.ethereum : null;
                if (!eth) {
                  alert("MetaMask is not installed. Please install MetaMask to connect a wallet.");
                  return;
                }
                try {
                  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
                  if (accounts.length > 0) {
                    setForm(p => ({ ...p, wallet_address: accounts[0] }));
                  }
                } catch (err: unknown) {
                  const error = err as { code?: number; message?: string };
                  if (error.code === 4001) {
                    // user rejected
                  } else {
                    alert(error.message ?? "Failed to connect MetaMask");
                  }
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
            >
              🦊 Connect
            </button>
          </div>
          {form.wallet_address && /^0x[0-9a-fA-F]{40}$/.test(form.wallet_address) && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] text-green-400">Valid Ethereum address detected</span>
            </div>
          )}
        </div>

        {/* ── Predefined Skills ── */}
        {skills.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Predefined Skills <span className="font-normal text-gray-600">(click to select)</span></label>
          <div className="flex flex-wrap gap-2">
              {skills.map(s => (
              <button
                key={s.id}
                type="button"
                  onClick={() => toggleSkill(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${selectedSkills.includes(s.id)
                    ? "bg-violet-600/20 text-violet-300 border-violet-500/50"
                    : "bg-[#1a2035] text-gray-400 border-[#2a3550] hover:border-violet-500/30"
                    }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* ── Custom Skill Chips ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">
            Custom Skills <span className="font-normal text-gray-600">(type and press Enter or comma)</span>
          </label>
          {/* Chip container */}
          <div
            className="min-h-[44px] flex flex-wrap gap-1.5 p-2 bg-[#080d1a] border border-[#1e2a45] rounded-xl cursor-text focus-within:border-violet-500 transition"
            onClick={() => chipRef.current?.focus()}
          >
            {customSkills.map(chip => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 text-xs bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md"
              >
                {chip}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeChip(chip); }}
                  className="text-cyan-400 hover:text-white transition ml-0.5"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <input
              ref={chipRef}
              value={chipInput}
              onChange={e => setChipInput(e.target.value)}
              onKeyDown={handleChipKeyDown}
              onBlur={addChip}
              placeholder={customSkills.length === 0 ? "e.g. Python, Go, Docker…" : ""}
              className="flex-1 min-w-24 bg-transparent text-sm text-white placeholder-gray-600 outline-none px-1"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-[#1a2035] hover:bg-[#1e2540] text-gray-300 text-sm font-semibold rounded-xl border border-[#2a3550] transition">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Spinner />Creating…</> : "Create Employee"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

// ─── Edit Employee Sheet ──────────────────────────────────────────────────────
function EditEmployeeSheet({
  employee: emp,
  onClose,
  canAssignAdmin,
  catalogSkills,
  onSave,
}: {
  employee: Employee | null;
  onClose: () => void;
  canAssignAdmin: boolean;
  catalogSkills: Skill[];
  onSave: (id: string, updates: Parameters<typeof updateEmployee>[1]) => Promise<void>;
}) {
  // Track which employee is being edited so we can reset on change
  const [empId, setEmpId] = useState(emp?.id);
  const [form, setForm] = useState({
    job_title: emp?.job_title ?? "",
    wallet_address: emp?.wallet_address ?? "",
    role: (emp?.role ?? "employee") as Role,
    is_active: emp?.is_active ?? true,
  });

  // Skills editing
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    emp?.skills.filter(s => !s.skill_id.startsWith("custom-")).map(s => s.skill_id) ?? []
  );
  const [customChips, setCustomChips] = useState<string[]>(
    emp?.skills.filter(s => s.skill_id.startsWith("custom-")).map(s => s.skill_name) ?? []
  );
  const [chipInput, setChipInput] = useState("");
  const chipRef = useRef<HTMLInputElement>(null);

  // Reset password state
  const [resetResult, setResetResult] = useState<{ newPassword: string } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetCopied, setResetCopied] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync form when employee changes
  if (emp?.id !== empId) {
    setEmpId(emp?.id);
    setForm({
      job_title: emp?.job_title ?? "",
      wallet_address: emp?.wallet_address ?? "",
      role: (emp?.role ?? "employee") as Role,
      is_active: emp?.is_active ?? true,
    });
    setSelectedSkillIds(emp?.skills.filter(s => !s.skill_id.startsWith("custom-")).map(s => s.skill_id) ?? []);
    setCustomChips(emp?.skills.filter(s => s.skill_id.startsWith("custom-")).map(s => s.skill_name) ?? []);
    setChipInput("");
    setResetResult(null);
    setErrorMsg("");
  }

  // Skill chip helpers
  const toggleCatalogSkill = (id: string) =>
    setSelectedSkillIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const addChip = () => {
    const val = chipInput.trim().replace(/,$/, "");
    if (val && !customChips.includes(val)) setCustomChips(p => [...p, val]);
    setChipInput("");
  };

  const handleChipKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addChip(); }
    else if (e.key === "Backspace" && chipInput === "" && customChips.length > 0)
      setCustomChips(p => p.slice(0, -1));
  };

  // Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emp) return;
    setErrorMsg("");
    setSaving(true);
    try {
      await onSave(emp.id, {
        job_title: form.job_title || undefined,
        wallet_address: form.wallet_address || undefined,
        role: form.role,
        is_active: form.is_active,
        skill_ids: selectedSkillIds,
        custom_skills: customChips,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
    setSaving(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!emp) return;
    setResetting(true);
    setResetResult(null);
    try {
      const res = await resetEmployeePassword(emp.id);
      setResetResult({ newPassword: res.newPassword });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setResetting(false);
    }
  };

  const copyPassword = () => {
    if (!resetResult) return;
    navigator.clipboard.writeText(resetResult.newPassword);
    setResetCopied(true);
    setTimeout(() => setResetCopied(false), 2000);
  };

  const scoreColor = (s: number) =>
    s >= 90 ? "text-green-400" : s >= 80 ? "text-violet-400" : s >= 70 ? "text-yellow-400" : "text-red-400";

  return (
    <Sheet
      open={!!emp}
      onClose={onClose}
      title="Edit Employee"
      description={emp ? `Managing profile for ${emp.full_name}` : ""}
      width="max-w-xl"
    >
      {emp && (
        <div className="space-y-6">
          {errorMsg && (
            <div className="bg-red-600/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl">
              {errorMsg}
          </div>
          )}

          {/* Avatar + Identity */}
          <div className="flex items-center gap-4 pb-5 border-b border-[#1e2a45]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {emp.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-white truncate">{emp.full_name}</div>
              <div className="text-xs text-gray-500 truncate font-mono">{emp.email}</div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <RoleBadge role={emp.role} />
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${emp.is_active
                  ? "bg-green-600/20 text-green-300 border-green-500/30"
                  : "bg-gray-600/20 text-gray-400 border-gray-500/30"
                  }`}>
                {emp.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </div>
        </div>

          {/* Editable Fields */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Job Title">
                <input
                  value={form.job_title}
                  onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))}
                  className={inputCls}
                  placeholder={emp.job_title}
                />
              </Field>
              <Field label="Role">
                <select
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))}
                  className={inputCls}
                >
                  <option value="employee">Employee</option>
                  {canAssignAdmin && <option value="admin">Admin</option>}
                </select>
              </Field>
        </div>

            {/* ── Account Status ─────────────────────────────────── */}
            <div className="rounded-xl border border-[#1e2a45] bg-[#080d1a] p-4">
              <div className="flex items-center justify-between">
        <div>
                  <div className="text-xs font-semibold text-gray-300 mb-0.5">Account Status</div>
                  <div className="text-[10px] text-gray-600">
                    {form.is_active
                      ? "Employee can log in and access the system."
                      : "Employee is blocked from accessing the system."}
            </div>
        </div>
                <div className="flex rounded-lg overflow-hidden border border-[#2a3550] flex-shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, is_active: true }))}
                    className={`px-3 py-1.5 text-xs font-semibold transition-all ${form.is_active
                      ? "bg-green-600 text-white"
                      : "bg-transparent text-gray-500 hover:text-gray-300"
                      }`}
                  >
                    ● Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, is_active: false }))}
                    className={`px-3 py-1.5 text-xs font-semibold transition-all ${!form.is_active
                      ? "bg-red-600/80 text-white"
                      : "bg-transparent text-gray-500 hover:text-gray-300"
                      }`}
                  >
                    ○ Inactive
                  </button>
            </div>
            </div>
              {!form.is_active && (
                <div className="mt-3 flex items-start gap-2 bg-red-600/8 border border-red-500/20 rounded-lg px-3 py-2">
                  <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-[10px] text-red-400 leading-relaxed">
                    This employee will be unable to log in and will see an &quot;Account Deactivated&quot; screen upon their next access attempt.
                  </p>
          </div>
        )}
            </div>

            <Field label="Wallet Address">
              <input
                value={form.wallet_address}
                onChange={e => setForm(p => ({ ...p, wallet_address: e.target.value }))}
                className={inputCls}
                placeholder="0x…"
              />
            </Field>

            {/* ── Skill Editing ─────────────────────────────────── */}
            <div className="border-t border-[#1e2a45] pt-4 space-y-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills</div>

              {/* Predefined catalog toggles */}
              {catalogSkills.length > 0 && (
        <div>
                  <div className="text-[10px] text-gray-600 mb-1.5">Predefined (click to toggle)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {catalogSkills.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleCatalogSkill(s.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${selectedSkillIds.includes(s.id)
                          ? "bg-violet-600/20 text-violet-300 border-violet-500/50"
                          : "bg-[#1a2035] text-gray-400 border-[#2a3550] hover:border-violet-500/30"
                          }`}
                      >
                        {s.name}
                      </button>
                    ))}
                </div>
              </div>
              )}

              {/* Custom chip input */}
              <div>
                <div className="text-[10px] text-gray-600 mb-1.5">Custom (type + Enter)</div>
                <div
                  className="min-h-[40px] flex flex-wrap gap-1.5 p-2 bg-[#080d1a] border border-[#1e2a45] rounded-xl cursor-text focus-within:border-violet-500 transition"
                  onClick={() => chipRef.current?.focus()}
                >
                  {customChips.map(chip => (
                    <span key={chip} className="inline-flex items-center gap-1 text-xs bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                      {chip}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setCustomChips(p => p.filter(c => c !== chip)); }}
                        className="text-cyan-400 hover:text-white transition"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <input
                    ref={chipRef}
                    value={chipInput}
                    onChange={e => setChipInput(e.target.value)}
                    onKeyDown={handleChipKeyDown}
                    onBlur={addChip}
                    placeholder={customChips.length === 0 ? "e.g. Go, Docker…" : ""}
                    className="flex-1 min-w-20 bg-transparent text-sm text-white placeholder-gray-600 outline-none px-1"
                  />
                </div>
          </div>
        </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <><Spinner />Saving…</> : "Save Changes"}
          </button>
          </form>

          {/* ── Reset Password ────────────────────────────────────── */}
          <div className="border-t border-[#1e2a45] pt-5 space-y-3">
            <div className="flex items-center justify-between">
    <div>
                <div className="text-xs font-semibold text-gray-300">Reset Login Password</div>
                <div className="text-[10px] text-gray-600 mt-0.5">
                  Generates a new password and emails it to {emp.email}
    </div>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={resetting}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                {resetting ? (
                  <><Spinner />Resetting…</>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Password
                  </>
                )}
              </button>
            </div>

            {/* New password reveal */}
            {resetResult && (
              <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
                  <span className="text-xs font-semibold text-green-400">Password reset! Email sent to {emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-green-300 bg-[#080d1a] border border-green-500/20 rounded-lg px-3 py-2 tracking-wider">
                    {resetResult.newPassword}
                  </code>
                  <button
                    onClick={copyPassword}
                    className="flex-shrink-0 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-xs font-semibold transition border border-green-500/30"
                  >
                    {resetCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
            )}
    </div>

          {/* Read-only stats */}
          <div className="grid grid-cols-2 gap-3 border-t border-[#1e2a45] pt-4">
            {[
              { label: "Department", value: emp.department_name ?? "—" },
              { label: "Hire Date", value: emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : "—" },
              { label: "Tasks Assigned", value: emp.tasks_assigned ?? 0 },
              { label: "Tasks Completed", value: emp.tasks_completed ?? 0 },
            ].map(item => (
              <div key={item.label} className="bg-[#080d1a] border border-[#1e2a45] rounded-xl px-4 py-3">
                <div className="text-[10px] text-gray-500 mb-0.5">{item.label}</div>
                <div className="text-sm font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>

          {/* AI Score */}
          {emp.productivity_score !== undefined && (
            <div className="bg-gradient-to-br from-violet-600/10 to-cyan-600/10 border border-violet-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Productivity</div>
                <div className={`text-2xl font-bold ${scoreColor(emp.productivity_score)}`}>
                  {emp.productivity_score}<span className="text-sm text-gray-500">/100</span>
                </div>
              </div>
              <div className="h-2 bg-[#1e2a45] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: `${emp.productivity_score}%` }} />
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}

// ─── Micro UI ─────────────────────────────────────────────────────────────────
function Spinner() {
  return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}

function PageLoader() {
  return (
    <div className="p-8">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-[#1e2a45] rounded-xl w-64" />
        <div className="grid grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-[#0d1120] border border-[#1e2a45] rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}
