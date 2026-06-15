import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllUsers } from "@/lib/auth";
import { getPrediction, getResult, calculatePoints, namesMatch } from "@/lib/scoring";
import { MATCHES } from "@/lib/data/matches";
import { kget } from "@/lib/store";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  const match = MATCHES.find(m => m.id === matchId);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  // Only reveal other users' predictions after the match is completed
  const override = await kget<{ status: string; result?: { team1Score: number; team2Score: number; motm: string; firstScorer: string } }>(`match_status:${matchId}`);
  const isCompleted = (override?.status ?? match.status) === "completed";

  const result = await getResult(matchId);
  const users = (await getAllUsers()).filter(u => u.approved && !u.isAdmin);

  const predictions = await Promise.all(
    users.map(async u => {
      const pred = await getPrediction(u.id, matchId);
      if (!pred) return null;
      let points: number | null = null;
      let breakdown: { result: boolean; exact: boolean; motm: boolean; firstScorer: boolean } | null = null;
      if (result) {
        points = calculatePoints(pred, result);
        const predOut = pred.team1Score > pred.team2Score ? "home" : pred.team1Score < pred.team2Score ? "away" : "draw";
        const actOut = result.team1Score > result.team2Score ? "home" : result.team1Score < result.team2Score ? "away" : "draw";
        breakdown = {
          result: predOut === actOut,
          exact: pred.team1Score === result.team1Score && pred.team2Score === result.team2Score,
          motm: namesMatch(pred.motm, result.motm),
          firstScorer: namesMatch(pred.firstScorer, result.firstScorer),
        };
      }
      return {
        userId: u.id,
        nickname: u.nickname,
        avatar: u.avatar,
        avatarColor: u.avatarColor,
        supportedTeam: u.supportedTeam,
        isMe: u.id === session.userId,
        prediction: isCompleted || u.id === session.userId ? pred : null,
        points,
        breakdown,
      };
    })
  );

  return NextResponse.json({
    predictions: predictions.filter(Boolean),
    result: result ?? null,
    isCompleted,
  });
}
