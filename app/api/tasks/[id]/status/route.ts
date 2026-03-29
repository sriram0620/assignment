import { NextResponse } from "next/server";
import { updateTaskStatus } from "@/app/api/_server/db";
import { updateTaskStatusSchema } from "@/app/api/_schemas/hrms";
import { requireUser } from "@/app/api/_server/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateTaskStatusSchema.parse(body);

    console.info("[PATCH /api/tasks/:id/status] actor.role =", actor.role, "| taskId =", id, "| newStatus =", parsed.status);

    const task = await updateTaskStatus(actor, id, parsed.status);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task });
  } catch (error) {
    const msg = `${error}`;
    console.error("[PATCH /api/tasks/:id/status] Error:", msg);
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json(
        { error: "Forbidden", detail: "You can only update the status of tasks assigned to you." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Invalid task status payload", details: msg }, { status: 400 });
  }
}
