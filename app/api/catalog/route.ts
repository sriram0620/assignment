import { NextResponse } from "next/server";
import { getCatalog } from "@/app/api/_server/db";
import { requireUser } from "@/app/api/_server/auth";

export async function GET(request: Request) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const catalog = await getCatalog(actor.org_id);
  return NextResponse.json(catalog);
}
