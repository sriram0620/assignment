import { NextResponse } from "next/server";
import { getMyEmployee } from "@/app/api/_server/db";
import { requireUser } from "@/app/api/_server/auth";

export async function GET(request: Request) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const employee = await getMyEmployee(actor.id);
  return NextResponse.json({ employee });
}

