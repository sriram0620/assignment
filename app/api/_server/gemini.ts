import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Employee, Task } from "@/lib/types";

// ─── Model Configuration ────────────────────────────────────────────────────
const MODEL_ID = "gemini-2.0-flash";

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("[gemini] GEMINI_API_KEY not set — AI features disabled");
    return null;
  }
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: MODEL_ID });
}

async function askGemini(prompt: string): Promise<string> {
  const model = getModel();
  if (!model) throw new Error("GEMINI_API_KEY not configured");
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/** Extract JSON from Gemini's response (handles markdown code fences) */
function parseJSON<T>(text: string, fallback: T): T {
  try {
    // Strip markdown code fences if present
    const stripped = text
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```$/m, "")
      .trim();
    return JSON.parse(stripped) as T;
  } catch {
    // Try extracting raw JSON object/array
    const objectMatch = text.match(/(\{[\s\S]*\})/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[1]) as T;
      } catch {
        /* fall through */
      }
    }
    return fallback;
  }
}

// ─── Types for AI Results ───────────────────────────────────────────────────
export interface ProductivityAnalysis {
  productivity_score: number;
  trend: "improving" | "stable" | "declining";
  ai_summary: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  estimated_next_score: number;
  trend_reasoning: string;
}

export interface SkillGapAnalysis {
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
}

export interface SmartAssignmentResult {
  recommendations: Array<{
    employee_id: string;
    employee_name: string;
    match_score: number;
    reason: string;
    risk: string;
  }>;
  top_pick_id: string;
  assignment_rationale: string;
}

// ─── 1. Productivity Score + Trend Prediction ────────────────────────────────
export async function analyzeProductivity(
  employee: Employee,
  tasks: Task[]
): Promise<ProductivityAnalysis> {
  const assigned = tasks.filter((t) => t.assigned_to === employee.id);
  const completed = assigned.filter((t) => t.status === "completed");
  const inProgress = assigned.filter((t) => t.status === "in_progress");
  const overdue = assigned.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline) < new Date() &&
      t.status !== "completed" &&
      t.status !== "cancelled"
  );
  const baseScore =
    assigned.length === 0
      ? 50
      : Math.max(
          0,
          Math.min(
            100,
            Math.round((completed.length / assigned.length) * 100 - overdue.length * 5)
          )
        );

  const prompt = `You are a senior AI HR analyst for a tech company. Perform a detailed performance analysis for this employee and return structured JSON.

EMPLOYEE PROFILE:
- Name: ${employee.full_name}
- Role: ${employee.job_title} (${employee.role})
- Department: ${employee.department_name ?? "N/A"}
- Skills: ${employee.skills.map((s) => s.skill_name).join(", ") || "None listed"}
- Hire Date: ${employee.hire_date ?? "Unknown"}
- Active: ${employee.is_active ? "Yes" : "No"}

TASK METRICS:
- Total Assigned: ${assigned.length}
- Completed: ${completed.length}
- In Progress: ${inProgress.length}
- Overdue: ${overdue.length}
- Base Completion Rate: ${baseScore}%

RECENT TASK DETAILS (last 8):
${
  assigned.slice(0, 8).map((t) =>
    `- "${t.title}" [${t.status}] Priority: ${t.priority}${
      t.deadline ? `, Due: ${new Date(t.deadline).toLocaleDateString()}` : ""
    }${t.completed_at ? `, Done: ${new Date(t.completed_at).toLocaleDateString()}` : ""}`
  ).join("\n") || "No tasks yet"
}

Return ONLY this exact JSON structure (no markdown, no explanation):
{
  "productivity_score": <integer 0-100, be realistic based on metrics>,
  "trend": <"improving" | "stable" | "declining">,
  "ai_summary": "<2-3 concise sentences describing overall performance>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"],
  "estimated_next_score": <integer 0-100, predicted score in next cycle>,
  "trend_reasoning": "<1-2 sentences explaining the trend prediction>"
}`;

  const fallback: ProductivityAnalysis = {
    productivity_score: baseScore,
    trend: "stable",
    ai_summary:
      assigned.length === 0
        ? `${employee.full_name} has not been assigned any tasks yet. Assign tasks to establish a performance baseline.`
        : `${employee.full_name} has completed ${completed.length} of ${assigned.length} tasks with ${overdue.length} overdue.`,
    strengths: ["Task execution", "Consistency", "Role commitment"],
    concerns:
      overdue.length > 0
        ? ["Missed deadlines", "Time management"]
        : ["Low task volume for reliable scoring"],
    recommendations: [
      "Assign diverse tasks to build a performance profile",
      "Schedule regular check-ins for workload balance",
      "Track skill development progress quarterly",
    ],
    estimated_next_score: Math.min(100, baseScore + 5),
    trend_reasoning: "Insufficient data for reliable trend prediction.",
  };

  try {
    const text = await askGemini(prompt);
    return parseJSON<ProductivityAnalysis>(text, fallback);
  } catch (err) {
    console.error("[gemini] analyzeProductivity failed:", err);
    return fallback;
  }
}

// ─── 2. Skill Gap Detection ──────────────────────────────────────────────────
export async function analyzeSkillGaps(
  employee: Employee,
  tasks: Task[],
  orgSkills: string[]
): Promise<SkillGapAnalysis> {
  const employeeSkills = employee.skills.map((s) => s.skill_name);
  const taskRequiredSkills = [
    ...new Set(
      tasks.filter((t) => t.assigned_to === employee.id).flatMap((t) => t.required_skills)
    ),
  ];

  const fallback: SkillGapAnalysis = {
    critical_gaps: orgSkills
      .filter((s) => !employeeSkills.includes(s))
      .slice(0, 3)
      .map((s) => ({
        skill: s,
        importance: "medium" as const,
        reason: `${s} is commonly required for ${employee.job_title} roles.`,
        learning_weeks: 4,
      })),
    nice_to_have: [],
    development_plan: `Focus on upskilling in areas critical to ${employee.job_title} responsibilities through online courses and hands-on projects.`,
    readiness_weeks: 8,
    overall_skill_health:
      employeeSkills.length >= 3 ? "good" : "needs_attention",
  };

  const prompt = `You are an AI skills analyst specializing in workforce development. Identify skill gaps and create a development plan for this employee.

EMPLOYEE PROFILE:
- Name: ${employee.full_name}
- Role: ${employee.job_title} (${employee.role})
- Department: ${employee.department_name ?? "N/A"}
- Current Skills: ${employeeSkills.join(", ") || "None listed"}
- Skills Required in Their Tasks: ${taskRequiredSkills.join(", ") || "None specified yet"}

ORGANIZATIONAL SKILL LANDSCAPE:
Common skills in the organization: ${orgSkills.join(", ")}

ANALYSIS CONTEXT:
Analyze gaps between current skills and what's needed for optimal performance in their role. Consider both task-required skills and role-appropriate skills.

Return ONLY this exact JSON (no markdown, no explanation):
{
  "critical_gaps": [
    {
      "skill": "<skill name>",
      "importance": <"critical" | "high" | "medium">,
      "reason": "<specific reason why this skill matters for their role>",
      "learning_weeks": <realistic integer estimate>
    }
  ],
  "nice_to_have": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "development_plan": "<3-4 sentence personalized, actionable learning roadmap>",
  "readiness_weeks": <total estimated weeks to close critical gaps>,
  "overall_skill_health": <"good" | "needs_attention" | "critical">
}
Include 2-5 critical gaps. Be specific and relevant to their role.`;

  try {
    const text = await askGemini(prompt);
    return parseJSON<SkillGapAnalysis>(text, fallback);
  } catch (err) {
    console.error("[gemini] analyzeSkillGaps failed:", err);
    return fallback;
  }
}

// ─── 3. Smart Task Assignment ────────────────────────────────────────────────
export async function suggestTaskAssignment(
  taskTitle: string,
  taskDescription: string,
  requiredSkills: string[],
  priority: string,
  candidates: Employee[],
  tasks: Task[]
): Promise<SmartAssignmentResult> {
  const activeCandidates = candidates
    .filter((c) => c.is_active)
    .map((emp) => {
      const empTasks = tasks.filter((t) => t.assigned_to === emp.id);
      const completedCount = empTasks.filter((t) => t.status === "completed").length;
      const activeCount = empTasks.filter(
        (t) => !["completed", "cancelled"].includes(t.status)
      ).length;
      const completionRate =
        empTasks.length > 0
          ? Math.round((completedCount / empTasks.length) * 100)
          : 0;
      return {
        id: emp.id,
        name: emp.full_name,
        role: emp.job_title,
        skills: emp.skills.map((s) => s.skill_name),
        completedTasks: completedCount,
        activeTasks: activeCount,
        completionRate,
      };
    });

  if (activeCandidates.length === 0) {
    return {
      recommendations: [],
      top_pick_id: "",
      assignment_rationale: "No active employees available for assignment.",
    };
  }

  const fallback: SmartAssignmentResult = {
    recommendations: activeCandidates.map((c, i) => ({
      employee_id: c.id,
      employee_name: c.name,
      match_score: Math.max(10, 80 - i * 10),
      reason: `${c.name} has ${c.completionRate}% task completion rate with ${c.activeTasks} active tasks.`,
      risk:
        c.activeTasks > 3
          ? "High current workload may affect delivery timeline."
          : "Manageable workload.",
    })),
    top_pick_id: activeCandidates[0]?.id ?? "",
    assignment_rationale: "Ranked by availability and completion history.",
  };

  const prompt = `You are an AI task assignment optimizer for a tech company. Recommend the best employees for this task.

TASK DETAILS:
- Title: "${taskTitle}"
- Description: ${taskDescription || "No description provided"}
- Required Skills: ${requiredSkills.join(", ") || "None specified"}
- Priority: ${priority.toUpperCase()}

AVAILABLE EMPLOYEES (${activeCandidates.length} active):
${activeCandidates
  .map(
    (c) =>
      `- ID: ${c.id} | ${c.name} (${c.role})
   Skills: [${c.skills.join(", ") || "None"}]
   Active Tasks: ${c.activeTasks} | Completed: ${c.completedTasks} | Completion Rate: ${c.completionRate}%`
  )
  .join("\n")}

Return ONLY this exact JSON (no markdown, no explanation):
{
  "recommendations": [
    {
      "employee_id": "<exact ID from above>",
      "employee_name": "<exact name from above>",
      "match_score": <integer 0-100>,
      "reason": "<specific reason why they are a good fit for THIS task>",
      "risk": "<specific risk or concern about assigning to this person>"
    }
  ],
  "top_pick_id": "<employee_id of the #1 best match>",
  "assignment_rationale": "<2-3 sentences explaining the overall recommendation strategy>"
}
Include ALL ${activeCandidates.length} employees, ordered by match_score descending.`;

  try {
    const text = await askGemini(prompt);
    return parseJSON<SmartAssignmentResult>(text, fallback);
  } catch (err) {
    console.error("[gemini] suggestTaskAssignment failed:", err);
    return fallback;
  }
}
