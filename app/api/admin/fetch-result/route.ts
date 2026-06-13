import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { MATCHES } from "@/lib/data/matches";
import { fetchESPNScoreboard } from "@/lib/espn";

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

  const match = MATCHES.find(m => m.id === matchId);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  // Get score from scoreboard
  const dateStr = match.date.replace(/-/g, "");
  const scores = await fetchESPNScoreboard(dateStr);
  const score = scores.find(s =>
    (s.team1Name === match.team1 && s.team2Name === match.team2) ||
    (s.team1Name === match.team2 && s.team2Name === match.team1)
  );

  if (!score) {
    return NextResponse.json({ error: "Match not found on ESPN — may not have been played yet" }, { status: 404 });
  }

  if (score.status !== "post") {
    return NextResponse.json({ error: `Match is not finished yet (status: ${score.status})` }, { status: 400 });
  }

  // Determine score order (home/away vs our team1/team2)
  const flipped = score.team1Name === match.team2;
  const team1Score = flipped ? score.team2Score : score.team1Score;
  const team2Score = flipped ? score.team1Score : score.team2Score;

  // Fetch summary for goal scorers and MOTM
  let firstScorer = "";
  let motm = "";

  try {
    const summaryRes = await fetch(`${ESPN_BASE}/summary?event=${score.eventId}`, { cache: "no-store" });
    if (summaryRes.ok) {
      const summary = await summaryRes.json();

      // First scorer: earliest goal play
      const plays: ESPNPlay[] = summary.plays ?? [];
      const goals = plays
        .filter((p: ESPNPlay) => p.scoringPlay)
        .sort((a: ESPNPlay, b: ESPNPlay) => (a.clock?.value ?? 0) - (b.clock?.value ?? 0));
      if (goals.length > 0 && goals[0].participants?.[0]?.athlete?.displayName) {
        firstScorer = goals[0].participants[0].athlete.displayName;
      }

      // MOTM: from leaders array (ESPN sometimes provides "Star of the Game")
      const leaders: ESPNLeader[] = summary.leaders ?? [];
      for (const leader of leaders) {
        if (leader.name?.toLowerCase().includes("star") || leader.name?.toLowerCase().includes("player of")) {
          if (leader.leaders?.[0]?.athlete?.displayName) {
            motm = leader.leaders[0].athlete.displayName;
            break;
          }
        }
      }
    }
  } catch {
    // summary fetch failed — still return the score
  }

  return NextResponse.json({ team1Score, team2Score, firstScorer, motm, eventId: score.eventId });
}

interface ESPNPlay {
  scoringPlay: boolean;
  clock?: { value: number };
  participants?: { athlete?: { displayName?: string } }[];
}
interface ESPNLeader {
  name?: string;
  leaders?: { athlete?: { displayName?: string } }[];
}
