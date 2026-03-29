import { NextResponse } from "next/server";
import { listAIScores } from "@/app/api/_server/db";
import { requireUser } from "@/app/api/_server/auth";

export async function GET(request: Request) {
  const actor = await requireUser(request);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const scores = await listAIScores(actor.org_id);
  return NextResponse.json({ scores });
}
