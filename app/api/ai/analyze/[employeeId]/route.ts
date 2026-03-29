import { NextResponse } from "next/server";
import { requireUser } from "@/app/api/_server/auth";
import { listEmployees, listTasks } from "@/app/api/_server/db";
import { analyzeProductivity, analyzeSkillGaps } from "@/app/api/_server/gemini";

const ORG_SKILLS = [
  "React", "TypeScript", "Node.js", "PostgreSQL", "Solidity",
  "Python", "Docker", "AWS", "GraphQL", "REST APIs",
  "System Design", "Communication", "Leadership", "Agile",
];

export async function POST(
  request: Request,
  context: { params: Promise<{ employeeId: string }> }
) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employeeId } = await context.params;
  const [employees, tasks] = await Promise.all([
    listEmployees(actor.org_id),
    listTasks(actor.org_id),
  ]);

  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const [productivity, skillGaps] = await Promise.all([
    analyzeProductivity(employee, tasks),
    analyzeSkillGaps(employee, tasks, ORG_SKILLS),
  ]);

  return NextResponse.json({
    employee_id: employeeId,
    employee_name: employee.full_name,
    productivity,
    skillGaps,
    analyzed_at: new Date().toISOString(),
  });
}
