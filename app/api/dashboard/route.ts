import { NextResponse } from "next/server";
import { getDashboardStats, getCatalog } from "@/app/api/_server/db";
import { requireUser } from "@/app/api/_server/auth";

export async function GET(request: Request) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [stats, { org }] = await Promise.all([
    getDashboardStats(actor.org_id),
    getCatalog(actor.org_id),
  ]);
  return NextResponse.json({ stats, org });
}
