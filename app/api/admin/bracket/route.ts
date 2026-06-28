import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { kset } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId, team1, team1Flag, team2, team2Flag } = await req.json();
  if (!matchId || !team1 || !team2) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await kset(`ko_teams:${matchId}`, { team1, team1Flag: team1Flag || "🏆", team2, team2Flag: team2Flag || "🏆" });
  return NextResponse.json({ ok: true });
}
