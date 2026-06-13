import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchESPNScoreboard } from "@/lib/espn";
import { MATCHES } from "@/lib/data/matches";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const dateStr = date.replace(/-/g, "");

  const scores = await fetchESPNScoreboard(dateStr);

  // Map ESPN scores to our match IDs
  const mapped = scores.map(score => {
    const match = MATCHES.find(m =>
      m.espnEventId === score.eventId ||
      (m.team1 === score.team1Name && m.team2 === score.team2Name) ||
      (m.team1 === score.team2Name && m.team2 === score.team1Name)
    );
    return { ...score, matchId: match?.id ?? null };
  });

  return NextResponse.json({ scores: mapped }, {
    headers: { "Cache-Control": "no-store" },
  });
}
