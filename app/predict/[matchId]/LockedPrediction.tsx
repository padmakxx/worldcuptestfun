import Link from "next/link";
import { Match } from "@/lib/data/matches";
import { Prediction } from "@/lib/scoring";
import { Player } from "@/lib/data/players";
import LineupPanel from "@/components/LineupPanel";

interface Props {
  match: Match & { result?: { team1Score: number; team2Score: number; motm?: string; firstScorer?: string } };
  prediction: Prediction;
  players: Player[];
}

export default function LockedPrediction({ match, prediction, players }: Props) {
  const dateStr = new Date(match.date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const s1 = prediction.team1Score;
  const s2 = prediction.team2Score;
  const outcome = s1 > s2 ? `${match.team1} Win` : s2 > s1 ? `${match.team2} Win` : "Draw";
  const outcomeColor = s1 > s2 ? "text-blue-400" : s2 > s1 ? "text-red-400" : "text-yellow-400";

  const submittedAt = new Date(prediction.submittedAt).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen pb-10">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(10,14,26,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
        <Link href="/dashboard" className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">← Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Match header */}
        <div className="card-glow rounded-3xl p-8 text-center">
          <div className="text-sm text-gray-400 mb-1">{dateStr} · {match.time}</div>
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-6">
            Group {match.group} · Match {match.matchNumber}
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center flex-1">
              <div className="text-6xl mb-2">{match.team1Flag}</div>
              <div className="font-black text-white text-lg">{match.team1}</div>
            </div>
            <div className="text-3xl font-black text-gray-500">VS</div>
            <div className="text-center flex-1">
              <div className="text-6xl mb-2">{match.team2Flag}</div>
              <div className="font-black text-white text-lg">{match.team2}</div>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-4">📍 {match.venue}, {match.city}</div>
        </div>

        {/* LOCKED banner */}
        <div className="rounded-2xl p-4 flex items-center gap-4 border border-emerald-500/30"
          style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.03))" }}>
          <div className="text-3xl">🔐</div>
          <div className="flex-1">
            <div className="font-black text-emerald-400">Prediction Locked!</div>
            <div className="text-sm text-gray-400">Submitted {submittedAt} · Cannot be changed</div>
          </div>
          <div className="text-2xl">✅</div>
        </div>

        {/* Their prediction summary */}
        <div className="card-glow rounded-3xl p-6 space-y-5">
          <h3 className="font-black text-lg text-white">📊 Your Prediction</h3>

          {/* Score */}
          <div className="rounded-2xl p-5 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-xs text-gray-500 mb-3 uppercase tracking-widest">Predicted Score</div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-3xl mb-1">{match.team1Flag}</div>
                <div className="text-5xl font-black text-white">{s1}</div>
                <div className="text-xs text-gray-500 mt-1">{match.team1}</div>
              </div>
              <div className="text-2xl font-black text-gray-600">–</div>
              <div className="text-center">
                <div className="text-3xl mb-1">{match.team2Flag}</div>
                <div className="text-5xl font-black text-white">{s2}</div>
                <div className="text-xs text-gray-500 mt-1">{match.team2}</div>
              </div>
            </div>
            <div className={`font-black text-xl mt-4 ${outcomeColor}`}>{outcome}</div>
          </div>

          {/* MOTM */}
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <span className="text-2xl">⭐</span>
            <div>
              <div className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-0.5">Man of the Match</div>
              <div className="font-bold text-white text-lg">
                {prediction.motm || <span className="text-gray-500 text-base font-normal">Not predicted</span>}
              </div>
            </div>
            <div className="ml-auto text-purple-400 font-black text-sm">if correct +3</div>
          </div>

          {/* First scorer */}
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
            <span className="text-2xl">🥅</span>
            <div>
              <div className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-0.5">First Goal Scorer</div>
              <div className="font-bold text-white text-lg">
                {prediction.firstScorer || <span className="text-gray-500 text-base font-normal">Not predicted</span>}
              </div>
            </div>
            <div className="ml-auto text-orange-400 font-black text-sm">if correct +5</div>
          </div>
        </div>

        {/* Points at stake */}
        <div className="rounded-2xl p-4 text-sm text-center"
          style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.1)" }}>
          <span className="text-gray-400">Up to </span>
          <span className="font-black text-yellow-400 text-xl">
            {1 + 4 + (prediction.motm ? 3 : 0) + (prediction.firstScorer ? 5 : 0)}
          </span>
          <span className="text-gray-400"> points available for you in this match</span>
        </div>

        {/* Lineup */}
        <LineupPanel
          matchId={match.id}
          team1Flag={match.team1Flag}
          team2Flag={match.team2Flag}
          team1Name={match.team1}
          team2Name={match.team2}
        />

        <Link href="/dashboard"
          className="w-full block text-center btn-gold py-4 rounded-2xl font-black text-lg">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
