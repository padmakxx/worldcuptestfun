import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fetchESPNLineup, discoverESPNEventId } from "@/lib/espn";
import { kget, kset } from "@/lib/store";
import { MATCHES } from "@/lib/data/matches";
import type { ESPNLineup } from "@/lib/espn";

export async function GET(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId } = await params;
  const match = MATCHES.find(m => m.id === matchId);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check cache first (lineups don't change after kickoff)
  const cached = await kget<ESPNLineup>(`lineup:${matchId}`);
  const forceRefresh = req.nextUrl.searchParams.get("refresh") === "1";

  if (cached && !forceRefresh) {
    // Use cache if it has players, or if it's older than 5 min and pre-match
    const age = Date.now() - new Date(cached.fetchedAt).getTime();
    const hasPlayers = cached.team1.players.length > 5;
    if (hasPlayers || age < 5 * 60 * 1000) {
      return NextResponse.json({ lineup: cached, source: "cache" });
    }
  }

  // Discover ESPN event ID if not pre-set
  let eventId = match.espnEventId;
  if (!eventId) {
    eventId = await discoverESPNEventId(match.team1, match.team2, match.date) ?? undefined;
  }
  if (!eventId) {
    return NextResponse.json({ lineup: null, error: "No ESPN event ID found" });
  }

  const lineup = await fetchESPNLineup(eventId);
  if (lineup && lineup.team1.players.length > 0) {
    await kset(`lineup:${matchId}`, lineup);
    return NextResponse.json({ lineup, source: "espn" });
  }

  return NextResponse.json({ lineup: null, error: "Lineup not yet available" });
}
