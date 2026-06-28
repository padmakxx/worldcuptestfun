import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveResult, MatchResult } from "@/lib/scoring";
import { MATCHES } from "@/lib/data/matches";
import { kset } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { matchId, team1Score, team2Score, motm, firstScorer, wentToPenalties, penaltyTeam1, penaltyTeam2 } = await req.json();

  const match = MATCHES.find(m => m.id === matchId);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const result: MatchResult = {
    matchId,
    team1Score: Number(team1Score),
    team2Score: Number(team2Score),
    motm: motm || "",
    firstScorer: firstScorer || "",
    settledAt: new Date().toISOString(),
    ...(wentToPenalties !== undefined ? { wentToPenalties: Boolean(wentToPenalties) } : {}),
    ...(penaltyTeam1 !== undefined ? { penaltyTeam1: Number(penaltyTeam1) } : {}),
    ...(penaltyTeam2 !== undefined ? { penaltyTeam2: Number(penaltyTeam2) } : {}),
  };

  await saveResult(result);

  // Mark match as completed in override store
  await kset(`match_status:${matchId}`, {
    status: "completed",
    result: { team1Score: result.team1Score, team2Score: result.team2Score, motm: result.motm, firstScorer: result.firstScorer },
  });

  return NextResponse.json({ success: true });
}
