"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  fetchCatalog,
  fetchEmployees,
  fetchTasks,
  updateTask,
  updateTaskStatus,
} from "@/lib/api";
import type { Employee, Skill, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Sheet from "@/components/ui/slide-panel";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLUMNS: { status: TaskStatus; label: string; accent: string; dot: string }[] = [
  { status: "pending",     label: "Pending",     accent: "border-gray-500/40",   dot: "bg-gray-400" },
  { status: "assigned",    label: "Assigned",    accent: "border-blue-500/40",   dot: "bg-blue-400" },
  { status: "in_progress", label: "In Progress", accent: "border-violet-500/40", dot: "bg-violet-400" },
  { status: "review",      label: "In Review",   accent: "border-yellow-500/40", dot: "bg-yellow-400" },
  { status: "completed",   label: "Completed",   accent: "border-green-500/40",  dot: "bg-green-400" },
];

const PRIORITY_BAR: Record<TaskPriority, string> = {
  low:      "#adadad",
  medium:   "#86c285",
  high:     "#edc578",
  critical: "#ef7d59",
};

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  low:      "bg-gray-600/20 text-gray-400 border-gray-500/30",
  medium:   "bg-blue-600/20 text-blue-400 border-blue-500/30",
  high:     "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
  critical: "bg-red-600/20 text-red-400 border-red-500/30",
};

type ViewMode = "kanban" | "list";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const { user, logout } = useAppStore();
  const router = useRouter();
  const [view, setView]                   = useState<ViewMode>("kanban");
  const [showCreate, setShowCreate]       = useState(false);
  const [selectedTask, setSelectedTask]   = useState<Task | null>(null);
  const [editTask, setEditTask]           = useState<Task | null>(null);
  const [filterStatus, setFilterStatus]   = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [search, setSearch]               = useState("");
  const queryClient = useQueryClient();

  const { data: tasks     = [], isLoading: loadingTasks }     = useQuery<Task[]>({ queryKey: ["tasks"],     queryFn: fetchTasks });
  const { data: employees = [], isLoading: loadingEmployees } = useQuery<Employee[]>({ queryKey: ["employees"], queryFn: fetchEmployees });
  const { data: catalog,        isLoading: loadingCatalog }   = useQuery({ queryKey: ["catalog"], queryFn: fetchCatalog });
  const skills: Skill[] = catalog?.skills ?? [];

  const [taskError, setTaskError] = useState<string | null>(null);

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess:  () => {
      setTaskError(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err: Error) => {
      const msg = err.message ?? "";
      if (msg.includes("403") || msg.toLowerCase().includes("forbidden")) {
        // Stale / invalid token — force re-login
        setTaskError(
          "Your session may have expired. Please sign out and sign back in, then try again."
        );
      } else {
        setTaskError(msg || "Failed to create task. Please try again.");
      }
    },
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),

    // ── Optimistic update: move the card instantly, no waiting for the server ──
    onMutate: async ({ taskId, status }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the current tasks so we can rollback on error
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      // Immediately update the cache — the card moves right away
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map(t => t.id === taskId ? { ...t, status } : t)
      );

      return { previousTasks };
    },

    // ── On error: rollback to the previous state ──
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },

    // ── On settle: sync with the server in the background ──
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const editTaskMutation = useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: Parameters<typeof updateTask>[1] }) =>
      updateTask(taskId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const filtered = tasks.filter(t => {
    if (filterStatus !== "all"   && t.status   !== filterStatus)   return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !(t.description ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    // Optimistically update the detail panel immediately (no await needed)
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, status: newStatus } : prev);
    // Fire the mutation in the background — optimistic update handles the UI instantly
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  if (loadingTasks || loadingEmployees || loadingCatalog) return <PageLoader />;

  const isEmployee = user?.hrms_role === "employee";
  const isAdmin    = user?.hrms_role === "admin";
  const completedCount  = tasks.filter(t => t.status === "completed").length;
  const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
  const progressPct     = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">

      {/* ── Session / Permission Error Banner ── */}
      {taskError && (
        <div className="mb-5 flex items-start gap-3 bg-red-600/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-red-400">{taskError}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="text-xs text-red-300 hover:text-white font-semibold underline transition"
            >
              Sign out & re-login
            </button>
            <button onClick={() => setTaskError(null)} className="text-red-500 hover:text-red-300 transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{isEmployee ? "My Tasks" : "Tasks"}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {inProgressCount} in progress · {completedCount} completed · {tasks.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-xl bg-[#0d1120] border border-[#1e2a45] p-1">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${view === "kanban" ? "bg-violet-600 text-white shadow" : "text-gray-400 hover:text-gray-200"}`}
            >
              <IconKanban /> Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${view === "list" ? "bg-violet-600 text-white shadow" : "text-gray-400 hover:text-gray-200"}`}
            >
              <IconList /> List
            </button>
          </div>
          {!isEmployee && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-900/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          )}
        </div>
      </div>

      {/* ── Employee progress banner ── */}
      {isEmployee && tasks.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-violet-600/10 to-cyan-600/10 border border-violet-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-white">Your Progress</div>
              <div className="text-xs text-gray-400 mt-0.5">{completedCount} of {tasks.length} tasks completed</div>
            </div>
            <div className="text-3xl font-bold text-violet-400">{progressPct}%</div>
          </div>
          <div className="h-2.5 bg-[#1e2a45] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex gap-6 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />{inProgressCount} in progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />{completedCount} completed</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />{tasks.filter(t => t.status === "assigned").length} assigned</span>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full pl-10 pr-4 py-2.5 bg-[#0d1120] border border-[#1e2a45] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | "all")} className={selectCls}>
          <option value="all">All Statuses</option>
          {STATUS_COLUMNS.map(c => <option key={c.status} value={c.status}>{c.label}</option>)}
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as TaskPriority | "all")} className={selectCls}>
          <option value="all">All Priorities</option>
          {(["low", "medium", "high", "critical"] as TaskPriority[]).map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* ── Views ── */}
      {view === "kanban" ? (
        <KanbanBoard
          tasks={filtered}
          isAdmin={isAdmin}
          onStatusChange={handleStatusChange}
          onTaskClick={setSelectedTask}
          onEditTask={setEditTask}
        />
      ) : (
        <ListView
          tasks={filtered}
          isAdmin={isAdmin}
          onStatusChange={handleStatusChange}
          onTaskClick={setSelectedTask}
          onEditTask={setEditTask}
        />
      )}

      {/* ── Create Sheet ── */}
      <CreateTaskSheet
        open={showCreate}
        employees={employees}
        skills={skills}
        onClose={() => setShowCreate(false)}
        onCreate={async inputs => {
          setTaskError(null);
          for (const input of inputs) {
            await createTaskMutation.mutateAsync(input);
          }
          setShowCreate(false);
        }}
      />

      {/* ── Detail Sheet ── */}
      <TaskDetailSheet
        task={selectedTask}
        employees={employees}
        isAdmin={isAdmin}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
        onEdit={task => { setSelectedTask(null); setEditTask(task); }}
      />

      {/* ── Edit Sheet (admin only) ── */}
      {isAdmin && (
        <EditTaskSheet
          task={editTask}
          employees={employees}
          skills={skills}
          onClose={() => setEditTask(null)}
          onSave={async (taskId, input) => {
            await editTaskMutation.mutateAsync({ taskId, input });
            setEditTask(null);
          }}
          onCreateExtras={async extraInputs => {
            for (const input of extraInputs) {
              await createTaskMutation.mutateAsync(input);
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Kanban Board ──────────────────────────────────────────────────────────────

function KanbanBoard({
  tasks, isAdmin, onStatusChange, onTaskClick, onEditTask,
}: {
  tasks: Task[];
  isAdmin: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
}) {
  const draggedId     = useRef<string | null>(null);
  const draggedStatus = useRef<TaskStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);

  const handleDragStart = (task: Task) => {
    draggedId.current     = task.id;
    draggedStatus.current = task.status;
    setDraggingId(task.id);
  };
  const handleDragEnd = () => {
    draggedId.current     = null;
    draggedStatus.current = null;
    setDraggingId(null);
    setDropTarget(null);
  };
  const handleDrop = (toStatus: TaskStatus) => {
    if (draggedId.current && draggedStatus.current !== toStatus) {
      onStatusChange(draggedId.current, toStatus);
    }
    handleDragEnd();
  };

  return (
    <div className="overflow-x-auto pb-6 -mx-2 px-2" id="kanban-board">
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-400">Priority:</span>
        {(Object.entries(PRIORITY_BAR) as [TaskPriority, string][]).map(([p, color]) => (
          <span key={p} className="flex items-center gap-1.5 capitalize">
            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: color }} />{p}
          </span>
        ))}
        <span className="ml-auto text-[11px] text-gray-600 italic">Drag cards between columns to update status</span>
      </div>
      <div className="flex gap-4 min-w-max">
        {STATUS_COLUMNS.map(col => {
          const colTasks   = tasks.filter(t => t.status === col.status);
          const isDropZone = dropTarget === col.status;
          return (
            <div
              key={col.status}
              className={`flex flex-col w-[275px] rounded-2xl border transition-all duration-150 ${
                isDropZone ? "border-violet-500/70 bg-violet-600/5 shadow-[0_0_0_2px_rgba(124,58,237,0.15)]" : `bg-[#0b0f1f] ${col.accent}`
              }`}
              onDragOver={e => { e.preventDefault(); setDropTarget(col.status); }}
              onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null); }}
              onDrop={() => handleDrop(col.status)}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a45]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-sm font-bold text-white">{col.label}</span>
                </div>
                <span className="text-[11px] font-bold bg-[#141929] border border-[#2a3550] text-gray-400 px-2 py-0.5 rounded-full min-w-[22px] text-center">
                  {colTasks.length}
                </span>
              </div>
              <div className="overflow-y-auto p-3 flex flex-col gap-2.5 flex-1" style={{ height: 500, scrollbarWidth: "thin", scrollbarColor: "#1e2a45 transparent" }}>
                {colTasks.length === 0 ? (
                  <div className={`flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl min-h-[120px] transition-all ${isDropZone ? "border-violet-500/60 bg-violet-600/8" : "border-[#1e2a45]"}`}>
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    <span className="text-xs text-gray-700">{isDropZone ? "Release to move here" : "Drop a card here"}</span>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      isAdmin={isAdmin}
                      isDragging={draggingId === task.id}
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      onStatusChange={onStatusChange}
                      onClick={() => onTaskClick(task)}
                      onEdit={() => onEditTask(task)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Kanban Card ───────────────────────────────────────────────────────────────

function KanbanCard({
  task, isAdmin, isDragging, onDragStart, onDragEnd, onStatusChange, onClick, onEdit,
}: {
  task: Task;
  isAdmin: boolean;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onClick: () => void;
  onEdit: () => void;
}) {
  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "completed" &&
    task.status !== "cancelled";

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`relative group bg-[#080d1a] border rounded-xl p-3 pl-[18px] cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isDragging
          ? "opacity-40 scale-95 border-violet-500/40 shadow-none"
          : "border-[#1e2a45] hover:border-violet-500/50 hover:bg-[#0a0e1f] shadow-sm hover:shadow-violet-900/20"
      }`}
    >
      {/* Priority bar */}
      <div className="absolute left-0 top-2 bottom-2 w-[5px] rounded-full" style={{ backgroundColor: PRIORITY_BAR[task.priority] }} />

      {/* Drag handle */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-40 transition-opacity text-gray-500">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm7 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm7 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-7 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm7 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2 pr-4 mb-1.5">
        {task.title}
      </p>

      {/* Assignee */}
      {task.assigned_to_name ? (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
            {task.assigned_to_name.charAt(0)}
          </div>
          <span className="text-[11px] text-gray-500 truncate">{task.assigned_to_name}</span>
        </div>
      ) : (
        <p className="text-[11px] text-gray-700 italic mb-2">Unassigned</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_BADGE[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
        <div className="flex items-center gap-1">
          {task.ai_assigned && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-600/15 text-orange-300 border border-orange-500/30">AI</span>}
          {task.tx_hash && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600/15 text-blue-300 border border-blue-500/30">ETH</span>}
          {isOverdue && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600/15 text-red-300 border border-red-500/30">OVERDUE</span>}
          {task.deadline && (
            <span className={`text-[10px] ${isOverdue ? "text-red-400" : "text-gray-600"}`}>
              {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-2.5 pt-2.5 border-t border-[#1e2a45] flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        {isAdmin && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-amber-400 hover:bg-amber-600/10 border border-amber-500/30 rounded-lg transition font-semibold"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        )}
        {task.status !== "completed" && task.status !== "cancelled" && (
          <button
            onClick={() => onStatusChange(task.id, "completed")}
            className="flex-1 text-[10px] text-green-400 hover:bg-green-600/10 border border-green-500/30 py-1 rounded-lg transition font-semibold"
          >
            ✓ Complete
          </button>
        )}
        {task.status === "assigned" && (
          <button
            onClick={() => onStatusChange(task.id, "in_progress")}
            className="flex-1 text-[10px] text-violet-400 hover:bg-violet-600/10 border border-violet-500/30 py-1 rounded-lg transition font-semibold"
          >
            → Start
          </button>
        )}
        {task.status === "in_progress" && (
          <button
            onClick={() => onStatusChange(task.id, "review")}
            className="flex-1 text-[10px] text-yellow-400 hover:bg-yellow-600/10 border border-yellow-500/30 py-1 rounded-lg transition font-semibold"
          >
            ↑ Review
          </button>
        )}
      </div>
    </div>
  );
}

// ─── List View ─────────────────────────────────────────────────────────────────

function ListView({
  tasks, isAdmin, onStatusChange, onTaskClick, onEditTask,
}: {
  tasks: Task[];
  isAdmin: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        No tasks found.
      </div>
    );
  }

  return (
    <div className="bg-[#0d1120] border border-[#1e2a45] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1e2a45] bg-[#080d1a]">
            {["", "Task", "Priority", "Status", "Assignee", "Deadline", "Flags", "Actions"].map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => {
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "completed";
            return (
              <tr
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={`border-b border-[#1e2a45]/60 cursor-pointer hover:bg-[#0f1428] transition-all ${i % 2 === 0 ? "bg-[#080d1a]" : "bg-[#0a0e1a]"}`}
              >
                <td className="pl-4 pr-1 py-3.5 w-1">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: PRIORITY_BAR[task.priority] }} />
                </td>
                <td className="px-4 py-3.5 max-w-xs">
                  <div className="text-sm font-semibold text-white truncate">{task.title}</div>
                  {task.description && <div className="text-xs text-gray-500 truncate mt-0.5">{task.description}</div>}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${PRIORITY_BADGE[task.priority]}`}>{task.priority.toUpperCase()}</span>
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={task.status} /></td>
                <td className="px-4 py-3.5">
                  {task.assigned_to_name ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                        {task.assigned_to_name.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-300">{task.assigned_to_name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-600 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {task.deadline ? (
                    <span className={`text-xs ${isOverdue ? "text-red-400 font-semibold" : "text-gray-400"}`}>
                      {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {isOverdue && " ⚠"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    {task.ai_assigned && <span className="text-[10px] bg-orange-600/15 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded font-bold">AI</span>}
                    {task.tx_hash && <span className="text-[10px] bg-blue-600/15 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold">ETH</span>}
                  </div>
                </td>
                <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTaskClick(task)}
                      className="text-xs text-violet-400 hover:bg-violet-600/10 border border-violet-500/30 px-2.5 py-1 rounded-lg transition font-semibold"
                    >
                      View
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onEditTask(task)}
                        className="text-xs text-amber-400 hover:bg-amber-600/10 border border-amber-500/30 px-2.5 py-1 rounded-lg transition font-semibold flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    {task.status !== "completed" && (
                      <button
                        onClick={() => onStatusChange(task.id, "completed")}
                        className="text-xs text-green-400 hover:bg-green-600/10 border border-green-500/30 px-2.5 py-1 rounded-lg transition font-semibold"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    pending:     "bg-gray-600/20 text-gray-400 border-gray-500/30",
    assigned:    "bg-blue-600/20 text-blue-400 border-blue-500/30",
    in_progress: "bg-violet-600/20 text-violet-400 border-violet-500/30",
    review:      "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
    completed:   "bg-green-600/20 text-green-400 border-green-500/30",
    cancelled:   "bg-red-600/20 text-red-400 border-red-500/30",
  };
  const labels: Record<TaskStatus, string> = {
    pending: "Pending", assigned: "Assigned", in_progress: "In Progress",
    review: "In Review", completed: "Completed", cancelled: "Cancelled",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ─── Multi-Select Employees ────────────────────────────────────────────────────

function MultiSelectEmployees({
  employees,
  selected,
  onChange,
}: {
  employees: Employee[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const containerRef          = useRef<HTMLDivElement>(null);

  const filtered = employees
    .filter(e => e.is_active)
    .filter(e =>
      search.trim() === "" ||
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.job_title.toLowerCase().includes(search.toLowerCase())
    );

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const selectedEmployees = employees.filter(e => selected.includes(e.id));

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger box */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full min-h-[42px] bg-[#080d1a] border border-[#1e2a45] rounded-xl px-3 py-2 text-left flex items-start gap-2 flex-wrap focus:outline-none focus:border-violet-500 transition hover:border-[#2a3550]"
      >
        {selectedEmployees.length === 0 ? (
          <span className="text-sm text-gray-600 my-0.5">Select employees…</span>
        ) : (
          selectedEmployees.map(e => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1 text-xs bg-violet-600/20 text-violet-300 border border-violet-500/40 rounded-lg px-2 py-0.5 font-medium"
            >
              {e.full_name.split(" ")[0]}
              <span
                role="button"
                onClick={ev => { ev.stopPropagation(); toggle(e.id); }}
                className="ml-0.5 hover:text-white cursor-pointer leading-none"
              >
                ×
              </span>
            </span>
          ))
        )}
        <svg className={`w-4 h-4 text-gray-500 ml-auto flex-shrink-0 my-0.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#0d1120] border border-[#1e2a45] rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#1e2a45]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search employees…"
                className="w-full bg-[#080d1a] border border-[#1e2a45] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Header controls */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2a45]">
            <span className="text-[11px] text-gray-500">{selected.length} selected</span>
            {selected.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="text-[11px] text-red-400 hover:text-red-300 font-semibold transition">
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e2a45 transparent" }}>
            {filtered.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-600">No employees found</div>
            ) : (
              filtered.map(e => {
                const isSelected = selected.includes(e.id);
                return (
                  <button
                    type="button"
                    key={e.id}
                    onClick={() => toggle(e.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover:bg-[#1a2035] ${isSelected ? "bg-violet-600/8" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                      {e.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate">{e.full_name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{e.job_title}</div>
                    </div>
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-violet-600 border-violet-600" : "border-[#2a3550]"}`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-[#1e2a45]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Done ({selected.length} selected)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Task Sheet ─────────────────────────────────────────────────────────

type CreateTaskInput = {
    title: string;
    description?: string;
    priority: TaskPriority;
    deadline?: string;
    assigned_to?: string;
    ai_assigned: boolean;
    required_skills: string[];
    created_by?: string;
    created_by_name?: string;
};

function CreateTaskSheet({
  open, employees, skills, onClose, onCreate,
}: {
  open: boolean;
  employees: Employee[];
  skills: Skill[];
  onClose: () => void;
  onCreate: (inputs: CreateTaskInput[]) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title:       "",
    description: "",
    priority:    "medium" as TaskPriority,
    deadline:    "",
    ai_assign:   false,
  });
  const [assignedTo,      setAssignedTo]      = useState<string[]>([]);
  const [selectedSkills,  setSelectedSkills]  = useState<string[]>([]);
  const [saving,          setSaving]          = useState(false);

  // Reset when opened
  const prevOpen = useRef(false);
  if (open && !prevOpen.current) {
    prevOpen.current = true;
  }
  if (!open && prevOpen.current) {
    prevOpen.current = false;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const skillNames = selectedSkills.map(id => skills.find(s => s.id === id)?.name ?? "").filter(Boolean);
      if (form.ai_assign || assignedTo.length === 0) {
        // Single task unassigned / AI
        await onCreate([{
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      ai_assigned: form.ai_assign,
          required_skills: skillNames,
        }]);
      } else {
        // One task per selected employee
        await onCreate(
          assignedTo.map(empId => ({
            title: form.title,
            description: form.description || undefined,
            priority: form.priority,
            deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
            assigned_to: empId,
            ai_assigned: false,
            required_skills: skillNames,
          }))
        );
      }
      // Reset form
      setForm({ title: "", description: "", priority: "medium", deadline: "", ai_assign: false });
      setAssignedTo([]);
      setSelectedSkills([]);
    } finally {
    setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Create New Task" description="Fill in the details to create and assign a task.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Task Title" required>
          <input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className={inputCls}
            placeholder="Implement OAuth2 flow…"
            required
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className={inputCls + " resize-none h-20"}
            placeholder="Detailed description…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Priority" required>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))} className={inputCls}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Deadline">
            <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className={inputCls} />
          </Field>
        </div>

        {/* ── Assign To (multi-select) ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-400">
              Assign To
              {!form.ai_assign && assignedTo.length > 1 && (
                <span className="ml-2 text-violet-400 font-normal">→ creates {assignedTo.length} tasks</span>
              )}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ai_assign}
                onChange={e => {
                  setForm(p => ({ ...p, ai_assign: e.target.checked }));
                  if (e.target.checked) setAssignedTo([]);
                }}
                className="sr-only"
              />
              <div className={`w-8 h-4 rounded-full transition-all ${form.ai_assign ? "bg-orange-500" : "bg-[#1e2a45]"} relative`}>
                <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${form.ai_assign ? "left-4" : "left-0.5"}`} />
              </div>
              <span className="text-xs text-orange-400 font-semibold">AI Assign</span>
            </label>
          </div>

          {form.ai_assign ? (
            <div className="bg-orange-600/10 border border-orange-500/30 rounded-xl px-4 py-3 text-xs text-orange-300">
              ✨ AI will automatically select the best employee based on skills, workload, and productivity score
            </div>
          ) : (
            <>
              <MultiSelectEmployees
                employees={employees}
                selected={assignedTo}
                onChange={setAssignedTo}
              />
              {assignedTo.length > 1 && (
                <p className="mt-2 text-[11px] text-violet-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {assignedTo.length} employees selected — a separate task will be created for each
                </p>
              )}
            </>
          )}
        </div>

        {/* ── Required Skills ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">Required Skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSkills(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  selectedSkills.includes(s.id)
                    ? "bg-violet-600/20 text-violet-300 border-violet-500/50"
                    : "bg-[#1a2035] text-gray-400 border-[#2a3550] hover:border-gray-500"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#1a2035] hover:bg-[#1e2540] text-gray-300 text-sm font-semibold rounded-xl border border-[#2a3550] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !form.title.trim()}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Spinner /> Creating…</>
            ) : assignedTo.length > 1 ? (
              `Create ${assignedTo.length} Tasks`
            ) : (
              "Create Task"
            )}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

// ─── Edit Task Sheet (admin only) ──────────────────────────────────────────────

function EditTaskSheet({
  task,
  employees,
  skills,
  onClose,
  onSave,
  onCreateExtras,
}: {
  task: Task | null;
  employees: Employee[];
  skills: Skill[];
  onClose: () => void;
  onSave: (taskId: string, input: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    deadline?: string | null;
    assigned_to?: string | null;
    status?: TaskStatus;
    required_skills?: string[];
  }) => Promise<void>;
  onCreateExtras: (inputs: CreateTaskInput[]) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title:       "",
    description: "",
    priority:    "medium" as TaskPriority,
    deadline:    "",
    status:      "pending" as TaskStatus,
  });
  const [assignedTo,     setAssignedTo]     = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving,         setSaving]         = useState(false);
  const [taskId,         setTaskId]         = useState<string | null>(null);

  // Sync form when task changes
  if (task && task.id !== taskId) {
    setTaskId(task.id);
    setForm({
      title:       task.title,
      description: task.description ?? "",
      priority:    task.priority,
      deadline:    task.deadline ? task.deadline.slice(0, 10) : "",
      status:      task.status,
    });
    setAssignedTo(task.assigned_to ? [task.assigned_to] : []);
    // Pre-select skills by name matching
    setSelectedSkills(
      skills.filter(s => task.required_skills.includes(s.name)).map(s => s.id)
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setSaving(true);
    try {
      const skillNames   = selectedSkills.map(id => skills.find(s => s.id === id)?.name ?? "").filter(Boolean);
      const customSkills = task.required_skills.filter(name => !skills.some(s => s.name === name));
      const allSkills    = [...skillNames, ...customSkills];

      // Primary: update the existing task (use first selected assignee, or null)
      const primaryAssignee = assignedTo[0] ?? null;
      await onSave(task.id, {
        title:           form.title.trim()       || undefined,
        description:     form.description.trim() || undefined,
        priority:        form.priority,
        deadline:        form.deadline ? new Date(form.deadline).toISOString() : null,
        assigned_to:     primaryAssignee,
        status:          form.status,
        required_skills: allSkills,
      });

      // Extras: create a copy of the task for each additional assignee
      if (assignedTo.length > 1) {
        await onCreateExtras(
          assignedTo.slice(1).map(empId => ({
            title:           form.title.trim() || task.title,
            description:     form.description.trim() || undefined,
            priority:        form.priority,
            deadline:        form.deadline ? new Date(form.deadline).toISOString() : undefined,
            assigned_to:     empId,
            ai_assigned:     false,
            required_skills: allSkills,
          }))
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const extraCount = assignedTo.length > 1 ? assignedTo.length - 1 : 0;

  return (
    <Sheet
      open={!!task}
      onClose={onClose}
      title="Edit Task"
      description={task?.title ?? "Update task details"}
    >
      {task && (
        <form onSubmit={handleSave} className="space-y-5">
          {/* Admin badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-600/10 border border-amber-500/25 rounded-xl">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs text-amber-400 font-semibold">Admin — Full Edit Access</span>
          </div>

          <Field label="Task Title" required>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className={inputCls}
              required
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className={inputCls + " resize-none h-20"}
              placeholder="Task description…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority" required>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))} className={inputCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </Field>
            <Field label="Status" required>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as TaskStatus }))} className={inputCls}>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>
          </div>

          <Field label="Deadline">
            <input
              type="date"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
              className={inputCls}
            />
          </Field>

          {/* ── Assign To (multi-select) ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-400">
                Assign To
                {assignedTo.length > 1 && (
                  <span className="ml-2 text-amber-400 font-normal">
                    → updates this task + creates {extraCount} new {extraCount === 1 ? "task" : "tasks"}
                  </span>
                )}
              </label>
            </div>
            <MultiSelectEmployees
              employees={employees}
              selected={assignedTo}
              onChange={setAssignedTo}
            />
            {assignedTo.length > 1 && (
              <p className="mt-2 text-[11px] text-amber-400/80 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>{assignedTo[0] ? employees.find(e => e.id === assignedTo[0])?.full_name?.split(" ")[0] : "First"}</strong> will be reassigned to this task.{" "}
                  {extraCount} new {extraCount === 1 ? "task copy" : "task copies"} will be created for the remaining {extraCount === 1 ? "employee" : "employees"}.
                </span>
              </p>
            )}
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSkills(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedSkills.includes(s.id)
                      ? "bg-violet-600/20 text-violet-300 border-violet-500/50"
                      : "bg-[#1a2035] text-gray-400 border-[#2a3550] hover:border-gray-500"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-[#1a2035] hover:bg-[#1e2540] text-gray-300 text-sm font-semibold rounded-xl border border-[#2a3550] transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Spinner /> Saving…</>
              ) : extraCount > 0 ? (
                `Save + Create ${extraCount} More`
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      )}
    </Sheet>
  );
}

// ─── Task Detail Sheet ─────────────────────────────────────────────────────────

function TaskDetailSheet({
  task, employees, isAdmin, onClose, onStatusChange, onEdit,
}: {
  task: Task | null;
  employees: Employee[];
  isAdmin: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}) {
  const NEXT: Partial<Record<TaskStatus, TaskStatus>> = {
    pending:     "assigned",
    assigned:    "in_progress",
    in_progress: "review",
    review:      "completed",
  };

  return (
    <Sheet open={!!task} onClose={onClose} title="Task Details" description={task?.title}>
      {task && (
        <div className="space-y-5">
          {/* Badges + admin edit button */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${PRIORITY_BADGE[task.priority]}`}>
              {task.priority.toUpperCase()}
            </span>
            <StatusBadge status={task.status} />
            {task.ai_assigned && (
              <span className="text-xs bg-orange-600/15 text-orange-300 border border-orange-500/30 px-2 py-1 rounded-lg font-semibold">
                ✨ AI Assigned
              </span>
              )}
            </div>
            {isAdmin && (
              <button
                onClick={() => onEdit(task)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Task
              </button>
            )}
          </div>

          {/* Title + description */}
          <div>
            <h3 className="text-base font-bold text-white leading-snug">{task.title}</h3>
            {task.description && <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{task.description}</p>}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Created by" value={task.created_by_name ?? "—"} />
            <InfoItem label="Assignee"   value={task.assigned_to_name ?? "Unassigned"} />
            <InfoItem label="Created"    value={new Date(task.created_at).toLocaleDateString()} />
            <InfoItem label="Deadline"   value={task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"} />
            {task.completed_at && (
              <InfoItem label="Completed" value={new Date(task.completed_at).toLocaleDateString()} />
            )}
          </div>

          {/* Required skills */}
          {task.required_skills.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Required Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {task.required_skills.map(s => (
                  <span key={s} className="text-xs bg-[#1a2035] border border-[#2a3550] text-gray-300 px-2.5 py-1 rounded-lg">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* On-chain record */}
          {task.tx_hash && (
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">On-Chain Record</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Transaction Hash</span>
                  <span className="text-xs font-mono text-blue-300">{task.tx_hash.slice(0, 16)}…{task.tx_hash.slice(-8)}</span>
                </div>
                {task.block_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Block Number</span>
                    <span className="text-xs font-mono text-blue-300">#{task.block_number.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-[#1e2a45]">
            {NEXT[task.status] && (
              <button
                onClick={() => { onStatusChange(task.id, NEXT[task.status]!); onClose(); }}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition"
              >
                Move to {NEXT[task.status]!.replace("_", " ")}
              </button>
            )}
            {task.status !== "completed" && task.status !== "cancelled" && (
              <button
                onClick={() => { onStatusChange(task.id, "completed"); onClose(); }}
                className="flex-1 py-2.5 bg-green-600/20 hover:bg-green-600/30 text-green-300 text-sm font-semibold rounded-xl border border-green-500/30 transition"
              >
                ✓ Mark Complete
              </button>
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ─── Shared Primitives ─────────────────────────────────────────────────────────

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#080d1a] border border-[#1e2a45] rounded-xl px-4 py-3">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}

function IconKanban() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  );
}

function IconList() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function PageLoader() {
  return (
    <div className="p-8">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-[#1e2a45] rounded-xl w-64" />
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-[275px] flex-shrink-0 space-y-3">
              <div className="h-10 bg-[#0d1120] border border-[#1e2a45] rounded-2xl" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-28 bg-[#0d1120] border border-[#1e2a45] rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared CSS ────────────────────────────────────────────────────────────────

const inputCls  = "w-full bg-[#080d1a] border border-[#1e2a45] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition";
const selectCls = "bg-[#0d1120] border border-[#1e2a45] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition";
