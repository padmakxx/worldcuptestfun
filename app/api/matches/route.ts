import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { MATCHES } from "@/lib/data/matches";
import { kget } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enriched = await Promise.all(
    MATCHES.map(async m => {
      const override = await kget<{ status: string; result?: { team1Score: number; team2Score: number; motm: string; firstScorer: string } }>(`match_status:${m.id}`);
      if (override) return { ...m, status: override.status, result: override.result };
      return m;
    })
  );

  return NextResponse.json({ matches: enriched });
}
