import { NextResponse } from "next/server";
import { requireUser } from "@/app/api/_server/auth";
import { listEmployees, listTasks } from "@/app/api/_server/db";
import { suggestTaskAssignment } from "@/app/api/_server/gemini";

export async function POST(request: Request) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    description?: string;
    required_skills?: string[];
    priority?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    title = "Untitled Task",
    description = "",
    required_skills = [],
    priority = "medium",
  } = body;

  if (!title.trim()) {
    return NextResponse.json({ error: "Task title is required" }, { status: 400 });
  }

  const [employees, tasks] = await Promise.all([
    listEmployees(actor.org_id),
    listTasks(actor.org_id),
  ]);

  const result = await suggestTaskAssignment(title, description, required_skills, priority, employees, tasks);
  return NextResponse.json({ result });
}
