import { NextResponse } from "next/server";
import {
  createEmployee,
  listEmployees,
  getCatalog,
} from "@/app/api/_server/db";
import { createEmployeeSchema } from "@/app/api/_schemas/hrms";
import { requireUser } from "@/app/api/_server/auth";
import { sendWelcomeEmail } from "@/app/api/_server/email";

export async function GET(request: Request) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employees = await listEmployees(actor.org_id);
  return NextResponse.json({ employees });
}

export async function POST(request: Request) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body         = await request.json();
    const parsed       = createEmployeeSchema.parse(body);
    const plainPassword: string = parsed.password ?? "Employee@123";
    const employee     = await createEmployee(actor, parsed);

    // ── Send welcome email (non-blocking) ─────────────────────────────────────
    getCatalog(actor.org_id).then(({ org }) => {
      sendWelcomeEmail({
        to:            employee.email,
        fullName:      employee.full_name,
        orgName:       org.name,
        password:      plainPassword,
        role:          employee.role,
        createdByName: actor.full_name,
        appUrl:        process.env.NEXT_PUBLIC_APP_URL,
      }).then((r) => {
        if (!r.sent) console.warn("[employee/create] Email not sent:", r.error);
        else console.info("[employee/create] Welcome email sent to:", employee.email);
      });
    });

    return NextResponse.json({ employee, plainPassword }, { status: 201 });
  } catch (error) {
    const msg = `${error}`;
    console.error("[employee/create] Error:", msg);
    if (msg.includes("FORBIDDEN") || msg.includes("ONLY_ADMIN_CAN_ASSIGN_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (msg.includes("EMAIL_ALREADY_EXISTS")) {
      return NextResponse.json(
        { error: "An employee with this email already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Invalid employee payload", details: msg },
      { status: 400 }
    );
  }
}
