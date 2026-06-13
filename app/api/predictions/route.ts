import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { savePrediction, getPrediction, Prediction } from "@/lib/scoring";
import { MATCHES } from "@/lib/data/matches";
import { isMatchInPredictionWindow } from "@/lib/prediction-window";
import { kget } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { matchId, team1Score, team2Score, motm, firstScorer } = body;

  const match = MATCHES.find(m => m.id === matchId);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  // Check if completed (including overrides)
  const override = await kget<{ status: string }>(`match_status:${matchId}`);
  const status = override?.status ?? match.status;
  if (status === "completed") {
    return NextResponse.json({ error: "Match already completed — predictions closed" }, { status: 400 });
  }

  // Enforce 2-day prediction window
  if (!isMatchInPredictionWindow(match.date)) {
    return NextResponse.json({ error: "This match is not yet open for predictions. Check back closer to the date!" }, { status: 400 });
  }

  // HARD LOCK: no editing once submitted
  const existing = await getPrediction(session.userId, matchId);
  if (existing) {
    return NextResponse.json({ error: "Prediction already locked! No edits allowed once submitted." }, { status: 409 });
  }

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
