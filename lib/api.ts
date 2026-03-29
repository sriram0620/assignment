import type { AIScore, AuthUser, DashboardStats, Department, Employee, Organization, Skill, SkillGapReport, Task } from "@/lib/types";

/**
 * All API requests include `credentials: "include"` so the browser sends the
 * httpOnly `hrms_token` cookie automatically.  The server reads the cookie in
 * requireUser() — no token ever touches localStorage.
 *
 * The Authorization header fallback is preserved for environments (Postman,
 * curl) that can't use cookies, but the browser path relies solely on the cookie.
 */
async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include", // sends httpOnly cookie on every request
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error ?? `Request failed (${response.status})`);
  }
  return payload as T;
}

export async function login(input: { email: string; password: string }) {
  return apiRequest<{ user: AuthUser; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function register(input: {
  orgName: string;
  industry: string;
  fullName: string;
  email: string;
  password: string;
}) {
  return apiRequest<{ user: AuthUser; token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Clears the httpOnly session cookie server-side.
 * Always call this on logout so the cookie is invalidated even if the user
 * clears their Zustand state manually.
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiRequest<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
  } catch {
    // Best-effort — local Zustand state is cleared regardless
  }
}

export async function fetchCatalog() {
  return apiRequest<{ org: Organization; departments: Department[]; skills: Skill[] }>("/api/catalog");
}

export async function fetchDashboardStats() {
  const response = await apiRequest<{ stats: DashboardStats }>("/api/dashboard");
  return response.stats;
}

export async function fetchEmployees() {
  const response = await apiRequest<{ employees: Employee[] }>("/api/employee");
  return response.employees;
}

export async function createEmployee(input: {
  full_name: string;
  email: string;
  password?: string;
  role: Employee["role"];
  department_id?: string;
  job_title: string;
  wallet_address?: string;
  hire_date?: string;
  skill_ids: string[];
  custom_skills?: string[];
}) {
  const response = await apiRequest<{ employee: Employee; plainPassword?: string }>("/api/employee", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return { employee: response.employee, plainPassword: response.plainPassword };
}

export async function updateEmployee(employeeId: string, input: {
  job_title?: string;
  wallet_address?: string;
  is_active?: boolean;
  role?: Employee["role"];
  skill_ids?: string[];
  custom_skills?: string[];
}) {
  const response = await apiRequest<{ employee: Employee }>(`/api/employee/${employeeId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.employee;
}

export async function deleteEmployee(employeeId: string) {
  return apiRequest<{ ok: boolean }>(`/api/employee/${employeeId}`, { method: "DELETE" });
}

export async function resetEmployeePassword(employeeId: string) {
  return apiRequest<{ ok: boolean; newPassword: string }>(`/api/employee/${employeeId}/reset-password`, { method: "POST" });
}

export async function fetchMyEmployee() {
  const response = await apiRequest<{ employee: Employee | null }>("/api/employee/me");
  return response.employee;
}

export async function fetchTasks() {
  const response = await apiRequest<{ tasks: Task[] }>("/api/tasks");
  return response.tasks;
}

export async function createTask(input: {
  title: string;
  description?: string;
  priority: Task["priority"];
  deadline?: string;
  assigned_to?: string;
  ai_assigned: boolean;
  required_skills: string[];
  created_by?: string;
  created_by_name?: string;
}) {
  const response = await apiRequest<{ task: Task }>("/api/tasks", { method: "POST", body: JSON.stringify(input) });
  return response.task;
}

export async function updateTaskStatus(taskId: string, status: Task["status"]) {
  const response = await apiRequest<{ task: Task }>(`/api/tasks/${taskId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  return response.task;
}

export async function updateTask(
  taskId: string,
  input: {
    title?: string;
    description?: string;
    priority?: Task["priority"];
    deadline?: string | null;
    assigned_to?: string | null;
    status?: Task["status"];
    required_skills?: string[];
  }
) {
  const response = await apiRequest<{ task: Task }>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.task;
}

export async function deleteTask(taskId: string) {
  return apiRequest<{ ok: boolean }>(`/api/tasks/${taskId}`, { method: "DELETE" });
}


export async function fetchAllAIScores() {
  const response = await apiRequest<{ scores: Record<string, AIScore> }>("/api/ai/scores");
  return response.scores;
}

export async function fetchSkillGaps(employeeId: string) {
  const response = await apiRequest<{ report: SkillGapReport | null }>(`/api/ai/skill-gaps/${employeeId}`);
  return response.report;
}

// ─── Gemini-powered AI Analysis ───────────────────────────────────────────────
export async function analyzeEmployeeWithGemini(employeeId: string) {
  return apiRequest<{
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
  }>(`/api/ai/analyze/${employeeId}`, { method: "POST" });
}

export async function getSmartTaskAssignment(input: {
  title: string;
  description?: string;
  required_skills?: string[];
  priority?: string;
}) {
  return apiRequest<{
    result: {
      recommendations: Array<{
        employee_id: string;
        employee_name: string;
        match_score: number;
        reason: string;
        risk: string;
      }>;
      top_pick_id: string;
      assignment_rationale: string;
    };
  }>("/api/ai/smart-assign", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

