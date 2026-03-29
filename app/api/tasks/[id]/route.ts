import { NextResponse } from "next/server";
import { deleteTask, updateTask } from "@/app/api/_server/db";
import { updateTaskSchema } from "@/app/api/_schemas/hrms";
import { requireUser } from "@/app/api/_server/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canEdit = ["admin", "hr_manager", "manager"].includes(actor.role);
  if (!canEdit) {
    return NextResponse.json(
      { error: "Forbidden", detail: `Role '${actor.role}' cannot edit tasks.` },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateTaskSchema.parse(body);
    const task = await updateTask(actor, id, parsed);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task });
  } catch (error) {
    const msg = `${error}`;
    console.error("[PATCH /api/tasks/:id] Error:", msg);
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Invalid task update", details: msg }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canDelete = ["admin", "hr_manager", "manager"].includes(actor.role);
  if (!canDelete) {
    return NextResponse.json(
      { error: "Forbidden", detail: `Role '${actor.role}' cannot delete tasks.` },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const deleted = await deleteTask(actor, id);
    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = `${error}`;
    console.error("[DELETE /api/tasks/:id] Error:", msg);
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unable to delete task", details: msg }, { status: 400 });
  }
}
