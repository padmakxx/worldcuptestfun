import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { MATCHES } from "@/lib/data/matches";
import { getPlayersForMatch } from "@/lib/data/players";
import { getPrediction } from "@/lib/scoring";
import { kget } from "@/lib/store";
import PredictForm from "./PredictForm";

export default async function PredictPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isAdmin) redirect("/admin");

  const baseMatch = MATCHES.find(m => m.id === matchId);
  if (!baseMatch) notFound();

  const override = await kget<{ status: string; result?: { team1Score: number; team2Score: number; motm: string; firstScorer: string } }>(`match_status:${matchId}`);
  const match = override ? { ...baseMatch, status: override.status as "upcoming" | "live" | "completed", result: override.result } : baseMatch;

  if (match.status === "completed") {
    redirect(`/dashboard`);
  }

  const players = getPlayersForMatch(match.team1, match.team2);
  const existing = await getPrediction(session.userId, matchId);

  return (
    <PredictForm
      match={match}
      players={players}
      existing={existing ?? undefined}
    />
  );
}
