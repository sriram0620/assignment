import { NextResponse } from "next/server";
import { createTask, listTasks, getMyEmployee } from "@/app/api/_server/db";
import { createTaskSchema } from "@/app/api/_schemas/hrms";
import { requireUser } from "@/app/api/_server/auth";

export async function GET(request: Request) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let tasks = await listTasks(actor.org_id);

    if (actor.role === "employee") {
      const myEmployee = await getMyEmployee(actor.id);
      tasks = myEmployee
        ? tasks.filter((t) => t.assigned_to === myEmployee.id)
        : [];
    }

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("[GET /api/tasks] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: `${err}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.info("[POST /api/tasks] actor.role =", actor.role, "| actor.id =", actor.id);

  const canCreate = ["admin", "hr_manager", "manager"].includes(actor.role);
  if (!canCreate) {
    console.warn("[POST /api/tasks] Forbidden — role:", actor.role);
    return NextResponse.json(
      {
        error:  "Forbidden",
        detail: `Role '${actor.role}' cannot create tasks. Required: admin, hr_manager, or manager.`,
      },
      { status: 403 }
    );
  }

  try {
    const body   = await request.json();
    const parsed = createTaskSchema.parse(body);
    const task   = await createTask(actor, parsed);
    console.info("[POST /api/tasks] Task created:", task.id);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    const msg = `${error}`;
    console.error("[POST /api/tasks] Error:", msg);
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Invalid task payload", details: msg },
      { status: 400 }
    );
  }
}
