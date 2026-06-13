import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { savePrediction, getPrediction, Prediction } from "@/lib/scoring";
import { MATCHES } from "@/lib/data/matches";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { matchId, team1Score, team2Score, motm, firstScorer } = body;

  const match = MATCHES.find(m => m.id === matchId);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.status === "completed") return NextResponse.json({ error: "Match already completed" }, { status: 400 });

  const pred: Prediction = {
    userId: session.userId,
    matchId,
    team1Score: Number(team1Score),
    team2Score: Number(team2Score),
    motm: motm || "",
    firstScorer: firstScorer || "",
    submittedAt: new Date().toISOString(),
  };

  await savePrediction(pred);
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  const pred = await getPrediction(session.userId, matchId);
  return NextResponse.json({ prediction: pred });
}
