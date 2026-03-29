import { NextResponse } from "next/server";
import { deleteEmployee, updateEmployee } from "@/app/api/_server/db";
import { updateEmployeeSchema } from "@/app/api/_schemas/hrms";
import { requireUser } from "@/app/api/_server/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateEmployeeSchema.parse(body);
    const employee = await updateEmployee(actor, id, parsed);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ employee });
  } catch (error) {
    if (`${error}`.includes("FORBIDDEN") || `${error}`.includes("ONLY_ADMIN_CAN_ASSIGN_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Invalid employee update", details: `${error}` }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const deleted = await deleteEmployee(actor, id);
    if (!deleted) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (`${error}`.includes("FORBIDDEN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unable to delete employee", details: `${error}` }, { status: 400 });
  }
}
