import { NextResponse } from "next/server";
import { resetEmployeePassword, getCatalog } from "@/app/api/_server/db";
import { requireUser } from "@/app/api/_server/auth";
import { sendPasswordResetEmail } from "@/app/api/_server/email";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const result = await resetEmployeePassword(actor, id);
    if (!result) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // ── Send password-reset email (non-blocking) ──────────────────────────────
    getCatalog(actor.org_id).then(({ org }) => {
      sendPasswordResetEmail({
        to: result.employee.email,
        fullName: result.employee.full_name,
        orgName: org.name,
        newPassword: result.newPassword,
        resetByName: actor.full_name,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      }).then((r) => {
        if (!r.sent) console.warn("[employee/reset-password] Email not sent:", r.error);
      });
    });

    return NextResponse.json({ ok: true, newPassword: result.newPassword });
  } catch (error) {
    const msg = `${error}`;
    if (msg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to reset password", details: msg }, { status: 400 });
  }
}
