// Vercel cron: runs every 15 minutes to fetch lineups for upcoming matches
// Schedule in vercel.json: { "crons": [{ "path": "/api/cron/lineups", "schedule": "*/15 * * * *" }] }

import { NextRequest, NextResponse } from "next/server";
import { MATCHES } from "@/lib/data/matches";
import { fetchESPNLineup, discoverESPNEventId } from "@/lib/espn";
import { kget, kset } from "@/lib/store";
import type { ESPNLineup } from "@/lib/espn";

export async function GET(req: NextRequest) {
  // Protect cron endpoint
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const fetched: string[] = [];
  const failed: string[] = [];

  // Find matches happening in the next 90 minutes or ongoing
  for (const match of MATCHES) {
    if (match.status === "completed") continue;

    const matchDate = new Date(match.date + "T00:00:00Z");
    const dayDiff = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (dayDiff > 1 || dayDiff < -0.5) continue; // Only today's matches

    // Check if we already have a good lineup
    const cached = await kget<ESPNLineup>(`lineup:${match.id}`);
    if (cached && cached.team1.players.filter(p => p.starter).length >= 10) {
      continue; // Already have full lineup
    }

    // Discover ESPN event ID
    let eventId = match.espnEventId;
    if (!eventId) {
      eventId = await discoverESPNEventId(match.team1, match.team2, match.date) ?? undefined;
    }
    if (!eventId) { failed.push(match.id); continue; }

    const lineup = await fetchESPNLineup(eventId);
    if (lineup && lineup.team1.players.length > 5) {
      await kset(`lineup:${match.id}`, lineup);
      fetched.push(`${match.team1} vs ${match.team2}`);
    } else {
      failed.push(`${match.team1} vs ${match.team2} (not ready)`);
    }
  }

  return NextResponse.json({ fetched, failed, checkedAt: now.toISOString() });
}
