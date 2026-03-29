export type Role = "admin" | "hr_manager" | "manager" | "employee";
export type TaskStatus = "pending" | "assigned" | "in_progress" | "review" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type SkillProficiency = 1 | 2 | 3 | 4 | 5;

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  plan: "free" | "pro" | "enterprise";

  created_at: string;
}

export interface Department {
  id: string;
  org_id: string;
  name: string;
  parent_id?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "technical" | "soft" | "domain";
}

export interface EmployeeSkill {
  skill_id: string;
  skill_name: string;
  proficiency: SkillProficiency;
}

export interface Employee {
  id: string;
  org_id: string;
  user_id?: string;
  department_id?: string;
  department_name?: string;
  manager_id?: string;
  full_name: string;
  email: string;
  role: Role;

  job_title: string;
  hire_date?: string;
  is_active: boolean;
  skills: EmployeeSkill[];
  avatar?: string;
  productivity_score?: number;
  tasks_assigned?: number;
  tasks_completed?: number;
  created_at: string;
}

export interface Task {
  id: string;
  org_id: string;
  created_by: string;
  created_by_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  department_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string;
  completed_at?: string;
  tx_hash?: string;
  block_number?: number;
  ai_assigned: boolean;
  required_skills: string[];
  created_at: string;
  updated_at: string;
}

export interface AIScore {
  id: string;
  employee_id: string;
  score: number;
  tasks_completed: number;
  tasks_overdue: number;
  avg_completion_days: number;
  skill_match_avg: number;
  ai_summary: string;
  trend: "improving" | "stable" | "declining";
  breakdown: {
    completion_rate: number;
    on_time_rate: number;
    skill_alignment: number;
    complexity_handled: number;
    collaboration: number;
  };
  top_strength: string;
  top_concern: string;
  computed_at: string;
}

export interface SkillGapReport {
  id: string;
  employee_id: string;
  critical_gaps: Array<{
    skill: string;
    importance: "critical" | "high" | "medium";
    reason: string;
    estimated_learning_weeks: number;
  }>;
  development_plan_summary: string;
  estimated_full_readiness_weeks: number;
  generated_at: string;
}

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  total_tasks: number;
  assigned_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  avg_productivity_score: number;
  tasks_by_status: Record<TaskStatus, number>;
  tasks_by_priority: Record<TaskPriority, number>;
}

export interface AuthUser {
  id: string;
  email: string;
  org_id: string;
  hrms_role: Role;

  org_name: string;
  full_name: string;
}

