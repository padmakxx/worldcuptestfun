"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Match } from "@/lib/data/matches";
import dynamic from "next/dynamic";
const LineupPanel = dynamic(() => import("@/components/LineupPanel"), { ssr: false });
import { Player } from "@/lib/data/players";

interface Props {
  match: Match & { result?: { team1Score: number; team2Score: number; motm?: string; firstScorer?: string } };
  players: Player[];
}

export default function PredictForm({ match, players }: Props) {
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [motm, setMotm] = useState("");
  const [firstScorer, setFirstScorer] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [firstSearch, setFirstSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const team1Players = players.filter(p => p.team === match.team1);
  const team2Players = players.filter(p => p.team === match.team2);
  const allPlayers = [...team1Players, ...team2Players];

  const filteredMotm = allPlayers.filter(p =>
    p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.team.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const filteredFirst = allPlayers.filter(p =>
    p.name.toLowerCase().includes(firstSearch.toLowerCase()) ||
    p.team.toLowerCase().includes(firstSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (score1 === "" || score2 === "") { setError("Please enter score predictions"); return; }
    setLoading(true);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: match.id, team1Score: Number(score1), team2Score: Number(score2), motm, firstScorer }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Failed to save prediction"); return; }
    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  const outcomeLabel = () => {
    const s1 = Number(score1), s2 = Number(score2);
    if (score1 === "" || score2 === "") return null;
    if (s1 > s2) return { text: `${match.team1} Win`, color: "text-emerald-400" };
    if (s2 > s1) return { text: `${match.team2} Win`, color: "text-blue-400" };
    return { text: "Draw", color: "text-yellow-400" };
  };

  const outcome = outcomeLabel();
  const dateStr = new Date(match.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-glow rounded-3xl p-10 text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-black text-white mb-2">Prediction Saved!</h2>
          <p className="text-gray-400">Good luck! Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <Link href="/dashboard" className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">← Back</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Match header */}
        <div className="card-glow rounded-3xl p-8 mb-6 text-center">
          <div className="text-sm text-gray-400 mb-1">{dateStr} · {match.time}</div>
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-6">
            Group {match.group} · Match {match.matchNumber}
          </div>

          <div className="flex items-center justify-center gap-6 mb-4">
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
          <div className="text-sm text-gray-500">📍 {match.venue}, {match.city}</div>
        </div>

        {/* Lineup Section */}
        <LineupPanel
          matchId={match.id}
          team1Flag={match.team1Flag}
          team2Flag={match.team2Flag}
          team1Name={match.team1}
          team2Name={match.team2}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Score prediction */}
          <div className="card-glow rounded-3xl p-6">
            <h3 className="font-black text-lg text-white mb-1">⚽ Score Prediction</h3>
            <p className="text-sm text-gray-400 mb-6">+3 correct result · +5 exact score</p>

            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">{match.team1Flag}</div>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={score1}
                  onChange={e => setScore1(e.target.value)}
                  placeholder="0"
                  className="score-input"
                />
              </div>
              <div className="text-2xl font-black text-gray-400 pb-2">–</div>
              <div className="text-center">
                <div className="text-2xl mb-2">{match.team2Flag}</div>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={score2}
                  onChange={e => setScore2(e.target.value)}
                  placeholder="0"
                  className="score-input"
                />
              </div>
            </div>

            {outcome && (
              <div className={`text-center mt-4 font-black text-xl ${outcome.color}`}>
                {outcome.text}
              </div>
            )}
          </div>

          {/* MOTM */}
          <div className="card-glow rounded-3xl p-6">
            <h3 className="font-black text-lg text-white mb-1">⭐ Man of the Match</h3>
            <p className="text-sm text-gray-400 mb-4">Who will shine? +3 points if correct</p>

            {motm && (
              <div className="mb-3 flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-xl text-sm font-semibold">
                <span>⭐</span>
                <span>{motm}</span>
                <button type="button" onClick={() => setMotm("")} className="ml-auto text-purple-400 hover:text-white">×</button>
              </div>
            )}

            <input
              type="text"
              value={playerSearch}
              onChange={e => setPlayerSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-500 text-sm mb-3"
              style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}
            />

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {(playerSearch ? filteredMotm : allPlayers).map(p => (
                <button
                  key={`motm-${p.team}-${p.name}`}
                  type="button"
                  onClick={() => { setMotm(p.name); setPlayerSearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-all ${
                    motm === p.name
                      ? "bg-purple-500/30 text-purple-200 border border-purple-500/40"
                      : "hover:bg-white/5 text-gray-300"
                  }`}
                >
                  <span className="text-lg">{p.team === match.team1 ? match.team1Flag : match.team2Flag}</span>
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      {p.name}
                      {p.isStar && <span className="text-yellow-400 text-xs">⭐</span>}
                    </div>
                    <div className="text-xs text-gray-500">{p.position} · {p.club}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* First Scorer */}
          <div className="card-glow rounded-3xl p-6">
            <h3 className="font-black text-lg text-white mb-1">🥅 First Goal Scorer</h3>
            <p className="text-sm text-gray-400 mb-4">Who scores first? +5 points if correct</p>

            {firstScorer && (
              <div className="mb-3 flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-xl text-sm font-semibold">
                <span>🥅</span>
                <span>{firstScorer}</span>
                <button type="button" onClick={() => setFirstScorer("")} className="ml-auto text-orange-400 hover:text-white">×</button>
              </div>
            )}

            <input
              type="text"
              value={firstSearch}
              onChange={e => setFirstSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-500 text-sm mb-3"
              style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}
            />

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {(firstSearch ? filteredFirst : allPlayers).map(p => (
                <button
                  key={`first-${p.team}-${p.name}`}
                  type="button"
                  onClick={() => { setFirstScorer(p.name); setFirstSearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-all ${
                    firstScorer === p.name
                      ? "bg-orange-500/30 text-orange-200 border border-orange-500/40"
                      : "hover:bg-white/5 text-gray-300"
                  }`}
                >
                  <span className="text-lg">{p.team === match.team1 ? match.team1Flag : match.team2Flag}</span>
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      {p.name}
                      {p.isStar && <span className="text-yellow-400 text-xs">⭐</span>}
                    </div>
                    <div className="text-xs text-gray-500">{p.position} · {p.club}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scoring summary */}
          <div className="bg-white/3 rounded-2xl p-4 text-sm text-gray-400">
            <div className="font-bold text-white mb-2">📊 Potential Points</div>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Correct result</span><span className="text-emerald-400 font-bold">+3</span></div>
              <div className="flex justify-between"><span>Exact score (bonus)</span><span className="text-emerald-400 font-bold">+5</span></div>
              <div className="flex justify-between"><span>Man of the Match</span><span className="text-purple-400 font-bold">+3</span></div>
              <div className="flex justify-between"><span>First Scorer</span><span className="text-orange-400 font-bold">+5</span></div>
              <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
                <span className="font-bold text-white">Max per match</span>
                <span className="font-black text-yellow-400">+16 pts</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full py-4 rounded-2xl text-lg font-black">
            {loading ? "Locking in..." : "⚡ Lock In Prediction — Final!"}
          </button>
        </form>
      </div>
    </div>
  );
}
