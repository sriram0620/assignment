import { NextResponse } from "next/server";
import { getSkillGap } from "@/app/api/_server/db";
import { requireUser } from "@/app/api/_server/auth";

export async function GET(request: Request, context: { params: Promise<{ employeeId: string }> }) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { employeeId } = await context.params;
  const report = await getSkillGap(actor.org_id, employeeId);
  if (!report) {
    return NextResponse.json({ report: null }, { status: 404 });
  }
  return NextResponse.json({ report });
}
