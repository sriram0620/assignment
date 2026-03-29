/**
 * db.ts — Supabase-backed data layer for AI-HRMS
 *
 * All functions are async and interact with Supabase.
 * The InternalUser type is kept compatible with all route handlers.
 */

import { getSupabase } from "./supabase";
import bcrypt from "bcryptjs";
import type {
  AIScore,
  AuthUser,
  DashboardStats,
  Employee,
  EmployeeSkill,
  Organization,
  Role,
  SkillGapReport,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";

// ─── Exported Internal User Type ─────────────────────────────────────────────
export type InternalUser = {
  id: string;
  email: string;
  password: string;
  role: Role;
  org_id: string;
  full_name: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomTxHash() {
  return "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
}

export function generatePassword(): string {
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

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function priorityToNumber(priority: TaskPriority): number {
  const map: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  return map[priority];
}

/** Map a DB row → Employee (parse JSONB skills field) */
function rowToEmployee(row: Record<string, unknown>): Employee {
  return {
    id: row.id as string,
    org_id: row.org_id as string,
    user_id: (row.user_id ?? undefined) as string | undefined,
    department_id: (row.department_id ?? undefined) as string | undefined,
    department_name: (row.department_name ?? undefined) as string | undefined,
    full_name: row.full_name as string,
    email: row.email as string,
    role: row.role as Role,
    job_title: row.job_title as string,
    hire_date: (row.hire_date ?? undefined) as string | undefined,
    is_active: row.is_active as boolean,
    skills: Array.isArray(row.skills) ? (row.skills as EmployeeSkill[]) : [],
    tasks_assigned: (row.tasks_assigned as number) ?? 0,
    tasks_completed: (row.tasks_completed as number) ?? 0,
    created_at: row.created_at as string,
  };
}

/** Map a DB row → Task (parse JSONB required_skills field) */
function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    org_id: row.org_id as string,
    created_by: row.created_by as string,
    created_by_name: (row.created_by_name ?? undefined) as string | undefined,
    assigned_to: (row.assigned_to ?? undefined) as string | undefined,
    assigned_to_name: (row.assigned_to_name ?? undefined) as string | undefined,
    title: row.title as string,
    description: (row.description ?? undefined) as string | undefined,
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    deadline: (row.deadline ?? undefined) as string | undefined,
    completed_at: (row.completed_at ?? undefined) as string | undefined,
    tx_hash: (row.tx_hash ?? undefined) as string | undefined,
    block_number: (row.block_number ?? undefined) as number | undefined,
    ai_assigned: (row.ai_assigned as boolean) ?? false,
    required_skills: Array.isArray(row.required_skills)
      ? (row.required_skills as string[])
      : [],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Register a new organization + admin user. Returns null if email exists. */
export async function registerUser(input: {
  orgName: string;
  fullName: string;
  email: string;
  password: string;
}): Promise<{ user: AuthUser; rawUser: InternalUser } | null> {
  const sb = getSupabase();

  // Check if email already taken
  const { data: existing } = await sb
    .from("hrms_users")
    .select("id")
    .eq("email", input.email.toLowerCase())
    .maybeSingle();

  if (existing) return null;

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 10);

  // Create organization
  const orgId = uid("org");
  const orgSlug = slugify(input.orgName) || orgId;

  const { error: orgError } = await sb.from("organizations").insert({
    id: orgId,
    name: input.orgName,
    slug: orgSlug,
    industry: "Technology",
    plan: "pro",
    created_at: nowIso(),
  });
  if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);

  // Seed default departments for this org
  await sb.from("departments").insert([
    { id: uid("dept"), org_id: orgId, name: "Engineering" },
    { id: uid("dept"), org_id: orgId, name: "Product" },
    { id: uid("dept"), org_id: orgId, name: "Design" },
    { id: uid("dept"), org_id: orgId, name: "Operations" },
  ]);

  // Create admin user
  const userId = uid("usr");
  const { error: userError } = await sb.from("hrms_users").insert({
    id: userId,
    email: input.email.toLowerCase(),
    password: passwordHash,
    role: "admin",
    org_id: orgId,
    full_name: input.fullName,
    created_at: nowIso(),
  });
  if (userError) throw new Error(`Failed to create user: ${userError.message}`);

  const rawUser: InternalUser = {
    id: userId,
    email: input.email.toLowerCase(),
    password: passwordHash,
    role: "admin",
    org_id: orgId,
    full_name: input.fullName,
  };

  const authUser: AuthUser = {
    id: userId,
    email: input.email.toLowerCase(),
    org_id: orgId,
    hrms_role: "admin",
    org_name: input.orgName,
    full_name: input.fullName,
  };

  return { user: authUser, rawUser };
}

/** Validate credentials and return user. Returns null on failure. */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser; rawUser: InternalUser } | null> {
  const sb = getSupabase();

  // ── Step 1: Find user by email (simple query, no embedded join) ────────────
  const { data: row, error: rowError } = await sb
    .from("hrms_users")
    .select("id, email, password, role, org_id, full_name")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (rowError) {
    console.error("[loginUser] DB error fetching user:", rowError.message);
    return null;
  }
  if (!row) {
    console.warn("[loginUser] No user found for email:", email.toLowerCase());
    return null;
  }

  // ── Step 2: Verify password ────────────────────────────────────────────────
  const storedPassword = row.password as string | null;
  if (!storedPassword) {
    console.error("[loginUser] User has no password hash stored:", row.id);
    return null;
  }

  let passwordOk = false;
  if (storedPassword.startsWith("$2")) {
    // bcrypt hash
    passwordOk = await bcrypt.compare(password, storedPassword);
  } else {
    // plain text (legacy / seeded)
    passwordOk = storedPassword === password;
  }

  if (!passwordOk) {
    console.warn("[loginUser] Password mismatch for:", email.toLowerCase());
    return null;
  }

  // ── Step 3: Fetch org name separately (avoid fragile embedded join) ────────
  let orgName = row.org_id as string;
  const { data: orgRow } = await sb
    .from("organizations")
    .select("name")
    .eq("id", row.org_id as string)
    .maybeSingle();
  if (orgRow?.name) orgName = orgRow.name as string;

  const rawUser: InternalUser = {
    id: row.id as string,
    email: row.email as string,
    password: storedPassword,
    role: row.role as Role,
    org_id: row.org_id as string,
    full_name: row.full_name as string,
  };

  const authUser: AuthUser = {
    id: row.id as string,
    email: row.email as string,
    org_id: row.org_id as string,
    hrms_role: row.role as Role,
    org_name: orgName,
    full_name: row.full_name as string,
  };

  return { user: authUser, rawUser };
}

/** Fetch a user by ID (used internally). */
export async function getUserById(userId: string): Promise<InternalUser | null> {
  const sb = getSupabase();
  const { data: row } = await sb
    .from("hrms_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!row) return null;
  return {
    id: row.id as string,
    email: row.email as string,
    password: row.password as string,
    role: row.role as Role,
    org_id: row.org_id as string,
    full_name: row.full_name as string,
  };
}

// ─── Catalog ──────────────────────────────────────────────────────────────────
export async function getCatalog(org_id: string) {
  const sb = getSupabase();

  const [orgRes, deptRes, skillsRes] = await Promise.all([
    sb.from("organizations").select("*").eq("id", org_id).maybeSingle(),
    sb.from("departments").select("*").eq("org_id", org_id),
    sb.from("skills").select("*"),
  ]);

  const org: Organization = orgRes.data
    ? {
      id: orgRes.data.id as string,
      name: orgRes.data.name as string,
      slug: orgRes.data.slug as string,
      industry: (orgRes.data.industry ?? "") as string,
      plan: (orgRes.data.plan ?? "free") as "free" | "pro" | "enterprise",
      created_at: orgRes.data.created_at as string,
    }
    : {
      id: org_id,
      name: "Your Organization",
      slug: org_id,
      industry: "",
      plan: "free",
      created_at: nowIso(),
    };

  const departments = (deptRes.data ?? []).map((d) => ({
    id: d.id as string,
    org_id: d.org_id as string,
    name: d.name as string,
    parent_id: (d.parent_id ?? undefined) as string | undefined,
  }));

  const skills = (skillsRes.data ?? []).map((s) => ({
    id: s.id as string,
    name: s.name as string,
    category: (s.category ?? "technical") as "technical" | "soft" | "domain",
  }));

  return { org, departments, skills };
}

// ─── Employees ────────────────────────────────────────────────────────────────
export async function listEmployees(org_id: string): Promise<Employee[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("employees")
    .select("*")
    .eq("org_id", org_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => rowToEmployee(r as Record<string, unknown>));
}

/** Paginated version of listEmployees — used by the GET /api/employee route handler. */
export async function listEmployeesPaged(
  org_id: string,
  opts: { page: number; limit: number }
): Promise<{ employees: Employee[]; total: number; page: number; limit: number; totalPages: number }> {
  const sb = getSupabase();
  const from = (opts.page - 1) * opts.limit;
  const to = from + opts.limit - 1;

  const { data, error, count } = await sb
    .from("employees")
    .select("*", { count: "exact" })
    .eq("org_id", org_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / opts.limit);

  return {
    employees: (data ?? []).map((r) => rowToEmployee(r as Record<string, unknown>)),
    total,
    page: opts.page,
    limit: opts.limit,
    totalPages,
  };
}


export async function createEmployee(
  actor: InternalUser,
  input: {
    full_name: string;
    email: string;
    password?: string;
    role: Employee["role"];
    department_id?: string;
    job_title: string;
    hire_date?: string;
    skill_ids: string[];
    custom_skills?: string[];
  }
): Promise<Employee> {
  if (!["admin", "hr_manager"].includes(actor.role)) throw new Error("FORBIDDEN");
  if (input.role === "admin" && actor.role !== "admin") throw new Error("ONLY_ADMIN_CAN_ASSIGN_ADMIN");

  const sb = getSupabase();

  // Check email uniqueness
  const { data: existingUser } = await sb
    .from("hrms_users")
    .select("id")
    .eq("email", input.email.toLowerCase())
    .maybeSingle();
  if (existingUser) throw new Error("EMAIL_ALREADY_EXISTS");

  // Hash employee password
  const plainPass = input.password || generatePassword();
  const passwordHash = await bcrypt.hash(plainPass, 10);
  console.info("[createEmployee] Creating user account for:", input.email.toLowerCase(), "role:", input.role);

  // Create user account in hrms_users
  const userId = uid("usr");
  const { error: userError } = await sb.from("hrms_users").insert({
    id: userId,
    email: input.email.toLowerCase(),
    password: passwordHash,
    role: input.role,         // e.g. 'employee', 'manager', 'hr_manager', 'admin'
    org_id: actor.org_id,
    full_name: input.full_name,
    created_at: nowIso(),
  });
  if (userError) {
    console.error("[createEmployee] Failed to create hrms_users row:", userError.message);
    throw new Error(`Failed to create user: ${userError.message}`);
  }
  console.info("[createEmployee] hrms_users row created:", userId);

  // Get department name
  let department_name: string | undefined;
  if (input.department_id) {
    const { data: dept } = await sb
      .from("departments")
      .select("name")
      .eq("id", input.department_id)
      .maybeSingle();
    department_name = dept?.name as string | undefined;
  }

  // Build skills array
  const { skills: allSkills } = await getCatalog(actor.org_id);
  const catalogSkills: EmployeeSkill[] = input.skill_ids
    .map((sid) => allSkills.find((s) => s.id === sid))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({ skill_id: s.id, skill_name: s.name, proficiency: 3 as const }));

  const customSkills: EmployeeSkill[] = (input.custom_skills ?? [])
    .filter((n) => n.trim().length > 0)
    .map((n) => ({
      skill_id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      skill_name: n.trim(),
      proficiency: 3 as const,
    }));

  const skills = [...catalogSkills, ...customSkills];

  // Create employee
  const employeeId = uid("emp");
  const empRow = {
    id: employeeId,
    org_id: actor.org_id,
    user_id: userId,
    department_id: input.department_id || null,
    department_name: department_name || null,
    full_name: input.full_name,
    email: input.email.toLowerCase(),
    role: input.role,
    job_title: input.job_title,
    hire_date: input.hire_date || null,
    is_active: true,
    skills,
    tasks_assigned: 0,
    tasks_completed: 0,
    created_at: nowIso(),
  };

  const { error: empError } = await sb.from("employees").insert(empRow);
  if (empError) throw new Error(`Failed to create employee: ${empError.message}`);

  return rowToEmployee(empRow as Record<string, unknown>);
}

export async function updateEmployee(
  actor: InternalUser,
  employeeId: string,
  input: {
    full_name?: string;
    email?: string;
    job_title?: string;
    is_active?: boolean;
    role?: Employee["role"];
    department_id?: string;
    hire_date?: string;
    skill_ids?: string[];
    custom_skills?: string[];
  }
): Promise<Employee | null> {
  if (!["admin", "hr_manager"].includes(actor.role)) throw new Error("FORBIDDEN");
  if (input.role === "admin" && actor.role !== "admin") throw new Error("ONLY_ADMIN_CAN_ASSIGN_ADMIN");

  const sb = getSupabase();

  // Fetch existing
  const { data: emp } = await sb
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .eq("org_id", actor.org_id)
    .maybeSingle();
  if (!emp) return null;

  // Build update payload
  const updates: Record<string, unknown> = {};
  if (input.full_name !== undefined) updates.full_name = input.full_name;
  if (input.email !== undefined) updates.email = input.email.toLowerCase();
  if (input.job_title !== undefined) updates.job_title = input.job_title;
  if (input.is_active !== undefined) updates.is_active = input.is_active;
  if (input.role !== undefined) updates.role = input.role;
  if (input.department_id !== undefined) {
    updates.department_id = input.department_id || null;
    if (input.department_id) {
      const { data: dept } = await sb.from("departments").select("name").eq("id", input.department_id).maybeSingle();
      updates.department_name = dept?.name ?? null;
    } else {
      updates.department_name = null;
    }
  }
  if (input.hire_date !== undefined) updates.hire_date = input.hire_date || null;

  // Rebuild skills if provided
  if (input.skill_ids !== undefined || input.custom_skills !== undefined) {
    const { skills: allSkills } = await getCatalog(actor.org_id);
    const catalogSkills: EmployeeSkill[] = (input.skill_ids ?? [])
      .map((sid) => allSkills.find((s) => s.id === sid))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => ({ skill_id: s.id, skill_name: s.name, proficiency: 3 as const }));

    const customSkills: EmployeeSkill[] = (input.custom_skills ?? [])
      .filter((n) => n.trim().length > 0)
      .map((n) => ({
        skill_id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        skill_name: n.trim(),
        proficiency: 3 as const,
      }));

    updates.skills = [...catalogSkills, ...customSkills];
  }

  const { data: updated, error } = await sb
    .from("employees")
    .update(updates)
    .eq("id", employeeId)
    .eq("org_id", actor.org_id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!updated) return null;

  // Sync role & wallet to hrms_users if changed
  const userUpdates: Record<string, unknown> = {};
  if (input.role !== undefined) userUpdates.role = input.role;
  if (Object.keys(userUpdates).length > 0 && emp.user_id) {
    await sb.from("hrms_users").update(userUpdates).eq("id", emp.user_id as string);
  }

  return rowToEmployee(updated as Record<string, unknown>);
}

export async function resetEmployeePassword(
  actor: InternalUser,
  employeeId: string
): Promise<{ employee: Employee; newPassword: string } | null> {
  if (!["admin", "hr_manager"].includes(actor.role)) throw new Error("FORBIDDEN");

  const sb = getSupabase();
  const { data: emp, error: empError } = await sb
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .eq("org_id", actor.org_id)
    .maybeSingle();
  if (empError) { console.error("[resetEmployeePassword] DB error:", empError.message); return null; }
  if (!emp) return null;

  if (!emp.user_id) {
    console.error("[resetEmployeePassword] Employee has no user_id:", employeeId);
    return null;
  }

  const newPassword = generatePassword();
  const hash = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await sb
    .from("hrms_users")
    .update({ password: hash })
    .eq("id", emp.user_id as string);

  if (updateError) {
    console.error("[resetEmployeePassword] Failed to update password:", updateError.message);
    throw new Error(`Failed to update password: ${updateError.message}`);
  }

  console.info("[resetEmployeePassword] Password reset for employee:", employeeId);
  return { employee: rowToEmployee(emp as Record<string, unknown>), newPassword };
}

export async function deleteEmployee(
  actor: InternalUser,
  employeeId: string
): Promise<boolean> {
  if (!["admin", "hr_manager"].includes(actor.role)) throw new Error("FORBIDDEN");

  const sb = getSupabase();
  const { data: emp } = await sb
    .from("employees")
    .select("id, user_id")
    .eq("id", employeeId)
    .eq("org_id", actor.org_id)
    .maybeSingle();
  if (!emp) return false;

  // Unassign tasks
  await sb
    .from("tasks")
    .update({ assigned_to: null, assigned_to_name: null, status: "pending" })
    .eq("assigned_to", employeeId);

  // Delete employee (cascades user via ON DELETE SET NULL)
  await sb.from("employees").delete().eq("id", employeeId);

  // Delete user account
  if (emp.user_id) {
    await sb.from("hrms_users").delete().eq("id", emp.user_id as string);
  }

  return true;
}

export async function getMyEmployee(userId: string): Promise<Employee | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("employees")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return data ? rowToEmployee(data as Record<string, unknown>) : null;
}


// ─── Tasks ────────────────────────────────────────────────────────────────────
export async function listTasks(org_id: string): Promise<Task[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("tasks")
    .select("*")
    .eq("org_id", org_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => rowToTask(r as Record<string, unknown>));
}

export async function getTask(org_id: string, taskId: string): Promise<Task | null> {
  const sb = getSupabase();
  const { data } = await sb
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("org_id", org_id)
    .maybeSingle();

  return data ? rowToTask(data as Record<string, unknown>) : null;
}

/** Paginated version of listTasks — used by the GET /api/tasks route handler. */
export async function listTasksPaged(
  org_id: string,
  opts: {
    page: number;
    limit: number;
    assignedTo?: string; // filter to one employee
  }
): Promise<{ tasks: Task[]; total: number; page: number; limit: number; totalPages: number }> {
  const sb = getSupabase();
  const from = (opts.page - 1) * opts.limit;
  const to = from + opts.limit - 1;

  let query = sb
    .from("tasks")
    .select("*", { count: "exact" })
    .eq("org_id", org_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (opts.assignedTo) {
    query = query.eq("assigned_to", opts.assignedTo);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / opts.limit);

  return {
    tasks: (data ?? []).map((r) => rowToTask(r as Record<string, unknown>)),
    total,
    page: opts.page,
    limit: opts.limit,
    totalPages,
  };
}


export async function createTask(
  actor: InternalUser,
  input: {
    title: string;
    description?: string;
    priority: TaskPriority;
    deadline?: string;
    assigned_to?: string;
    ai_assigned: boolean;
    required_skills: string[];
    created_by?: string;
    created_by_name?: string;
  }
): Promise<Task> {
  console.info("[createTask] actor.role =", actor.role, "| actor.id =", actor.id);
  if (!["admin", "hr_manager", "manager"].includes(actor.role)) {
    console.warn("[createTask] FORBIDDEN — role not allowed:", actor.role);
    throw new Error("FORBIDDEN");
  }

  const sb = getSupabase();

  let assignedToName: string | null = null;
  let status: TaskStatus = "pending";

  if (input.assigned_to) {
    const { data: emp } = await sb
      .from("employees")
      .select("full_name")
      .eq("id", input.assigned_to)
      .eq("org_id", actor.org_id)
      .maybeSingle();
    if (emp) {
      assignedToName = emp.full_name as string;
      status = "assigned";
    }
  }

  const taskId = uid("task");
  const taskRow = {
    id: taskId,
    org_id: actor.org_id,
    created_by: input.created_by ?? actor.id,
    created_by_name: input.created_by_name ?? actor.full_name,
    assigned_to: input.assigned_to || null,
    assigned_to_name: assignedToName,
    title: input.title,
    description: input.description || null,
    priority: input.priority,
    status,
    deadline: input.deadline || null,
    ai_assigned: input.ai_assigned,
    required_skills: input.required_skills,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  const { error } = await sb.from("tasks").insert(taskRow);
  if (error) throw new Error(error.message);

  // Increment tasks_assigned counter (best-effort)
  if (input.assigned_to) {
    const { data: empRow } = await sb
      .from("employees")
      .select("tasks_assigned")
      .eq("id", input.assigned_to)
      .maybeSingle();

    if (empRow) {
      await sb
        .from("employees")
        .update({ tasks_assigned: ((empRow.tasks_assigned as number) ?? 0) + 1 })
        .eq("id", input.assigned_to);
    }
  }

  return rowToTask(taskRow as Record<string, unknown>);
}



export async function updateTaskStatus(
  actor: InternalUser,
  taskId: string,
  nextStatus: TaskStatus
): Promise<Task | null> {
  const sb = getSupabase();

  // If employee, verify they own the task
  if (actor.role === "employee") {
    const myEmp = await getMyEmployee(actor.id);
    if (!myEmp) throw new Error("FORBIDDEN");

    const { data: t } = await sb
      .from("tasks")
      .select("assigned_to")
      .eq("id", taskId)
      .maybeSingle();

    if (!t || (t.assigned_to as string) !== myEmp.id) throw new Error("FORBIDDEN");
  }

  const completedAt = nextStatus === "completed" ? nowIso() : null;
  const updates: Record<string, unknown> = {
    status: nextStatus,
    updated_at: nowIso(),
    ...(completedAt ? { completed_at: completedAt } : {}),
  };

  const { data, error } = await sb
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("org_id", actor.org_id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToTask(data as Record<string, unknown>) : null;
}

export async function updateTask(
  actor: InternalUser,
  taskId: string,
  input: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    deadline?: string | null;
    assigned_to?: string | null;
    status?: TaskStatus;
    required_skills?: string[];
  }
): Promise<Task | null> {
  console.info("[updateTask] actor.role =", actor.role, "| taskId =", taskId);
  if (!["admin", "hr_manager", "manager"].includes(actor.role)) {
    console.warn("[updateTask] FORBIDDEN — role not allowed:", actor.role);
    throw new Error("FORBIDDEN");
  }

  const sb = getSupabase();
  const updates: Record<string, unknown> = { updated_at: nowIso() };

  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description || null;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.deadline !== undefined) updates.deadline = input.deadline || null;
  if (input.required_skills !== undefined) updates.required_skills = input.required_skills;
  if (input.status !== undefined) {
    updates.status = input.status;
    if (input.status === "completed") updates.completed_at = nowIso();
  }

  if (input.assigned_to !== undefined) {
    if (input.assigned_to === null) {
      updates.assigned_to = null;
      updates.assigned_to_name = null;
    } else {
      const { data: emp } = await sb
        .from("employees")
        .select("full_name")
        .eq("id", input.assigned_to)
        .eq("org_id", actor.org_id)
        .maybeSingle();
      updates.assigned_to = input.assigned_to;
      updates.assigned_to_name = emp ? (emp.full_name as string) : null;
      // Auto-set status to assigned if it was pending
      if (!input.status) {
        const { data: existing } = await sb.from("tasks").select("status").eq("id", taskId).maybeSingle();
        if (existing && existing.status === "pending") updates.status = "assigned";
      }
    }
  }

  const { data, error } = await sb
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("org_id", actor.org_id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToTask(data as Record<string, unknown>) : null;
}

export async function deleteTask(
  actor: InternalUser,
  taskId: string
): Promise<boolean> {
  console.info("[deleteTask] actor.role =", actor.role, "| taskId =", taskId);
  if (!["admin", "hr_manager", "manager"].includes(actor.role)) {
    console.warn("[deleteTask] FORBIDDEN — role not allowed:", actor.role);
    throw new Error("FORBIDDEN");
  }

  const sb = getSupabase();
  const { data } = await sb
    .from("tasks")
    .select("id")
    .eq("id", taskId)
    .eq("org_id", actor.org_id)
    .maybeSingle();
  if (!data) return false;

  await sb.from("tasks").delete().eq("id", taskId);
  return true;
}


// ─── AI Intelligence ──────────────────────────────────────────────────────────
export async function listAIScores(org_id: string): Promise<Record<string, AIScore>> {
  const [employees, tasks] = await Promise.all([
    listEmployees(org_id),
    listTasks(org_id),
  ]);

  const result: Record<string, AIScore> = {};
  for (const emp of employees) {
    const assigned = tasks.filter((t) => t.assigned_to === emp.id);
    const completed = assigned.filter((t) => t.status === "completed");
    const overdue = assigned.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline) < new Date() &&
        t.status !== "completed" &&
        t.status !== "cancelled"
    ).length;
    const score =
      assigned.length === 0
        ? 0
        : Math.max(
          0,
          Math.min(
            100,
            Math.round((completed.length / assigned.length) * 100 - overdue * 5)
          )
        );

    result[emp.id] = {
      id: `score-${emp.id}`,
      employee_id: emp.id,
      score,
      tasks_completed: completed.length,
      tasks_overdue: overdue,
      avg_completion_days: 3,
      skill_match_avg: 4,
      ai_summary:
        completed.length > 0
          ? `${emp.full_name} has completed ${completed.length}/${assigned.length} tasks.`
          : "No tasks completed yet.",
      trend: overdue > 1 ? "declining" : completed.length > 2 ? "improving" : "stable",
      breakdown: {
        completion_rate: score,
        on_time_rate: Math.max(0, score - 5),
        skill_alignment: 80,
        complexity_handled: 70,
        collaboration: 65,
      },
      top_strength: "Task execution",
      top_concern: overdue > 0 ? "Missed deadlines" : "Need more task volume",
      computed_at: nowIso(),
    };
  }
  return result;
}

export async function getAIScore(
  org_id: string,
  employeeId: string
): Promise<AIScore | null> {
  const scores = await listAIScores(org_id);
  return scores[employeeId] ?? null;
}

export async function getSkillGap(
  org_id: string,
  employeeId: string
): Promise<SkillGapReport | null> {
  const sb = getSupabase();
  const { data: emp } = await sb
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .eq("org_id", org_id)
    .maybeSingle();
  if (!emp) return null;

  const { skills: allSkills } = await getCatalog(org_id);
  const empSkills = new Set(
    ((emp.skills as EmployeeSkill[]) ?? []).map((s) => s.skill_name)
  );
  const missing = allSkills.filter((s) => !empSkills.has(s.name)).slice(0, 3);

  return {
    id: `gap-${employeeId}`,
    employee_id: employeeId,
    critical_gaps: missing.map((s) => ({
      skill: s.name,
      importance: "medium" as const,
      reason: `${s.name} is a common requirement for ${(emp.job_title as string) ?? "this role"}.`,
      estimated_learning_weeks: 4,
    })),
    development_plan_summary: "Upskill on missing skills with practical assignments.",
    estimated_full_readiness_weeks: missing.length * 4,
    generated_at: nowIso(),
  };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboardStats(org_id: string): Promise<DashboardStats> {
  const [employees, tasks] = await Promise.all([
    listEmployees(org_id),
    listTasks(org_id),
  ]);

  const statusSeed: TaskStatus[] = ["pending", "assigned", "in_progress", "review", "completed", "cancelled"];
  const prioritySeed: TaskPriority[] = ["low", "medium", "high", "critical"];

  const tasksByStatus = Object.fromEntries(statusSeed.map((s) => [s, 0])) as Record<TaskStatus, number>;
  for (const t of tasks) tasksByStatus[t.status] = (tasksByStatus[t.status] ?? 0) + 1;

  const tasksByPriority = Object.fromEntries(prioritySeed.map((p) => [p, 0])) as Record<TaskPriority, number>;
  for (const t of tasks) tasksByPriority[t.priority] = (tasksByPriority[t.priority] ?? 0) + 1;

  const scores = await listAIScores(org_id);
  const allScores = Object.values(scores).map((s) => s.score);
  const avg = allScores.length
    ? Number((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1))
    : 0;

  return {
    total_employees: employees.length,
    active_employees: employees.filter((e) => e.is_active).length,
    total_tasks: tasks.length,
    assigned_tasks: tasks.filter((t) => t.status === "assigned").length,
    in_progress_tasks: tasks.filter((t) => t.status === "in_progress").length,
    completed_tasks: tasks.filter((t) => t.status === "completed").length,
    overdue_tasks: tasks.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline).getTime() < Date.now() &&
        t.status !== "completed" &&
        t.status !== "cancelled"
    ).length,
    avg_productivity_score: avg,
    tasks_by_status: tasksByStatus,
    tasks_by_priority: tasksByPriority,
  };
}