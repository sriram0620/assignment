import { z } from "zod";

export const roleSchema = z.enum(["admin", "hr_manager", "manager", "employee"]);
export const taskStatusSchema = z.enum(["pending", "assigned", "in_progress", "review", "completed", "cancelled"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const createEmployeeSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).default("Employee@123"),
  role: roleSchema,
  department_id: z.string().optional(),
  job_title: z.string().min(2),
  wallet_address: z.string().optional(),
  hire_date: z.string().optional(),
  skill_ids: z.array(z.string()).default([]),
  custom_skills: z.array(z.string()).default([]),
});

export const updateEmployeeSchema = z.object({
  job_title: z.string().min(2).optional(),
  wallet_address: z.string().optional(),
  is_active: z.boolean().optional(),
  role: roleSchema.optional(),
  skill_ids: z.array(z.string()).optional(),
  custom_skills: z.array(z.string()).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: taskPrioritySchema.default("medium"),
  deadline: z.string().optional(),
  assigned_to: z.string().optional(),
  ai_assigned: z.boolean().default(false),
  required_skills: z.array(z.string()).default([]),
  created_by: z.string().optional(),
  created_by_name: z.string().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  deadline: z.string().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  status: taskStatusSchema.optional(),
  required_skills: z.array(z.string()).optional(),
});

export const logTaskSchema = z.object({
  taskId: z.string().min(1),
});

