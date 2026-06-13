import { getSession, getUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { MATCHES } from "@/lib/data/matches";
import { getPlayersForMatch } from "@/lib/data/players";
import { getPrediction } from "@/lib/scoring";
import { kget } from "@/lib/store";
import { isMatchInPredictionWindow } from "@/lib/prediction-window";
import PredictForm from "./PredictForm";
import LockedPrediction from "./LockedPrediction";
import Link from "next/link";

export default async function PredictPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isAdmin) redirect("/admin");

  const user = await getUser(session.userId);
  if (!user?.approved) redirect("/dashboard");

  const baseMatch = MATCHES.find(m => m.id === matchId);
  if (!baseMatch) notFound();

  const override = await kget<{ status: string; result?: { team1Score: number; team2Score: number; motm: string; firstScorer: string } }>(`match_status:${matchId}`);
  const match = override ? { ...baseMatch, status: override.status as "upcoming" | "live" | "completed", result: override.result } : baseMatch;

  if (match.status === "completed") redirect("/dashboard");

  const existing = await getPrediction(session.userId, matchId);

  // If already predicted → show locked view, no editing
  if (existing) {
    const players = getPlayersForMatch(match.team1, match.team2);
    return <LockedPrediction match={match} prediction={existing} players={players} />;
  }

  // Enforce 2-day window
  if (!isMatchInPredictionWindow(match.date)) {
    const { getPredictionWindow } = await import("@/lib/prediction-window");
    const { today, tomorrow } = getPredictionWindow();
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-glow rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-3">Not Open Yet</h2>
          <p className="text-gray-400 mb-2">
            Predictions for this match open closer to kickoff.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You can predict matches on <span className="text-yellow-400 font-bold">{today}</span> and <span className="text-yellow-400 font-bold">{tomorrow}</span> only.
          </p>
          <Link href="/dashboard" className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const players = getPlayersForMatch(match.team1, match.team2);
  return <PredictForm match={match} players={players} />;
}
