"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Match, getStageLabel, isKnockout } from "@/lib/data/matches";
import dynamic from "next/dynamic";
const LineupPanel = dynamic(() => import("@/components/LineupPanel"), { ssr: false });
import { Player } from "@/lib/data/players";
import type { ESPNLineup, ESPNPlayer } from "@/lib/espn";

interface Props {
  match: Match & { result?: { team1Score: number; team2Score: number; motm?: string; firstScorer?: string } };
  players: Player[];
}

function espnToPlayer(p: ESPNPlayer, flag: string): Player & { flag: string } {
  return { name: p.name, team: p.team, position: p.position, club: "", isStar: false, flag };
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
  const [lineup, setLineup] = useState<ESPNLineup | null>(null);
  // Knockout tiebreaker state
  const [predictedPenalties, setPredictedPenalties] = useState<boolean | undefined>(undefined);
  const [penaltyScore1, setPenaltyScore1] = useState("");
  const [penaltyScore2, setPenaltyScore2] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/lineup/${match.id}`)
      .then(r => r.json())
      .then(d => { if (d.lineup?.team1?.players?.length > 0) setLineup(d.lineup); })
      .catch(() => {});
  }, [match.id]);

  const staticTeam1 = players.filter(p => p.team === match.team1);
  const staticTeam2 = players.filter(p => p.team === match.team2);

  // Use confirmed lineup players when available, otherwise fall back to static list
  const allPlayers: (Player & { flag?: string })[] = lineup
    ? [
        ...lineup.team1.players.map(p => espnToPlayer(p, match.team1Flag)),
        ...lineup.team2.players.map(p => espnToPlayer(p, match.team2Flag)),
      ]
    : [...staticTeam1, ...staticTeam2];

  const lineupAvailable = !!lineup;

  const filteredMotm = allPlayers.filter(p =>
    p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.team.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const filteredFirst = allPlayers.filter(p =>
    p.name.toLowerCase().includes(firstSearch.toLowerCase()) ||
    p.team.toLowerCase().includes(firstSearch.toLowerCase())
  );

  const playerFlag = (p: Player & { flag?: string }) =>
    (p as { flag?: string }).flag ?? (p.team === match.team1 ? match.team1Flag : match.team2Flag);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (score1 === "" || score2 === "") { setError("Please enter score predictions"); return; }
    if (showKnockoutExtras && predictedPenalties === undefined) { setError("Please predict whether the match goes to penalties"); return; }
    if (showKnockoutExtras && predictedPenalties && (penaltyScore1 === "" || penaltyScore2 === "")) { setError("Please enter your predicted penalty score"); return; }
    setLoading(true);
    const body: Record<string, unknown> = { matchId: match.id, team1Score: Number(score1), team2Score: Number(score2), motm, firstScorer };
    if (showKnockoutExtras) {
      body.predictedPenalties = predictedPenalties;
      if (predictedPenalties) {
        body.penaltyTeam1 = Number(penaltyScore1);
        body.penaltyTeam2 = Number(penaltyScore2);
      }
    }
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    return { text: knockout ? "Draw → AET/Pens" : "Draw", color: "text-yellow-400" };
  };

  const stageLabel = getStageLabel(match.group);
  const knockout = isKnockout(match.group);
  const isDraw = score1 !== "" && score2 !== "" && Number(score1) === Number(score2);
  const showKnockoutExtras = knockout && isDraw;
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
          <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-3 ${knockout ? "bg-red-500/20 text-red-400" : "bg-yellow-400/20 text-yellow-400"}`}>
            {stageLabel} · Match {match.matchNumber}
            {knockout && <span>⚔️</span>}
          </div>
          {knockout && (
            <div className="mb-4 text-xs text-center bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded-xl px-4 py-2">
              ⚡ Knockout — predict 90-min score. A draw leads to extra time &amp; penalties.
            </div>
          )}

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

          {/* ── KNOCKOUT EXTRAS ── shown only when predicting a draw in a knockout match */}
          {showKnockoutExtras && (
            <div className="rounded-3xl p-6 space-y-6" style={{background:"linear-gradient(135deg,rgba(239,68,68,0.08),rgba(234,179,8,0.06))",border:"1px solid rgba(239,68,68,0.25)"}}>
              <div>
                <h3 className="font-black text-lg text-white mb-1">⚡ Extra Time &amp; Penalties</h3>
                <p className="text-sm text-gray-400">You predicted a draw — match goes to AET. Now predict what happens next.</p>
              </div>

              {/* AET info banner */}
              <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <div className="text-orange-300 font-bold text-sm">Extra Time prediction: locked in ✓</div>
                  <div className="text-orange-400/70 text-xs">Drawing at 90 min = predicting AET · <span className="font-bold text-orange-300">+5 pts</span> if the match actually goes to AET</div>
                </div>
              </div>

              {/* Penalties toggle */}
              <div>
                <div className="font-bold text-white mb-3">🎯 Will it go to Penalties?</div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button"
                    onClick={() => setPredictedPenalties(true)}
                    className={`py-4 rounded-2xl font-black text-sm transition-all ${predictedPenalties === true ? "bg-red-500/30 text-red-200 border-2 border-red-400/60 shadow-lg shadow-red-900/20" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/8"}`}>
                    🔴 Yes — Penalties!
                    <div className="text-xs font-normal mt-0.5 opacity-70">+8 pts if correct</div>
                  </button>
                  <button type="button"
                    onClick={() => { setPredictedPenalties(false); setPenaltyScore1(""); setPenaltyScore2(""); }}
                    className={`py-4 rounded-2xl font-black text-sm transition-all ${predictedPenalties === false ? "bg-emerald-500/30 text-emerald-200 border-2 border-emerald-400/60 shadow-lg shadow-emerald-900/20" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/8"}`}>
                    🟢 No — AET decides
                    <div className="text-xs font-normal mt-0.5 opacity-70">+8 pts if correct</div>
                  </button>
                </div>
              </div>

              {/* Penalty score — only when penalties predicted */}
              {predictedPenalties === true && (
                <div>
                  <div className="font-bold text-white mb-1">🥅 Penalty Shootout Score</div>
                  <p className="text-xs text-gray-400 mb-5">Predict the final penalty kick tally (e.g. 4–2) · <span className="text-yellow-400 font-bold">+15 pts</span> if exact!</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{match.team1Flag}</div>
                      <input type="number" min={0} max={9} value={penaltyScore1}
                        onChange={e => setPenaltyScore1(e.target.value)}
                        placeholder="0" className="score-input" />
                    </div>
                    <div className="text-3xl font-black text-red-400 pb-2">–</div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{match.team2Flag}</div>
                      <input type="number" min={0} max={9} value={penaltyScore2}
                        onChange={e => setPenaltyScore2(e.target.value)}
                        placeholder="0" className="score-input" />
                    </div>
                  </div>
                  {penaltyScore1 !== "" && penaltyScore2 !== "" && (
                    <div className="mt-4 text-center">
                      <span className="inline-block bg-red-500/20 border border-red-500/30 text-red-300 font-black px-4 py-1.5 rounded-full text-sm">
                        Pens: {match.team1Flag} {penaltyScore1}–{penaltyScore2} {match.team2Flag}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MOTM */}
          <div className="card-glow rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-lg text-white">⭐ Man of the Match</h3>
              {lineupAvailable && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Official lineup</span>}
            </div>
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
                  <span className="text-lg">{playerFlag(p)}</span>
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      {p.name}
                      {p.isStar && <span className="text-yellow-400 text-xs">⭐</span>}
                    </div>
                    <div className="text-xs text-gray-500">{p.position}{p.club ? ` · ${p.club}` : ""}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* First Scorer */}
          <div className="card-glow rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-lg text-white">🥅 First Goal Scorer</h3>
              {lineupAvailable && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Official lineup</span>}
            </div>
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
                  <span className="text-lg">{playerFlag(p)}</span>
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      {p.name}
                      {p.isStar && <span className="text-yellow-400 text-xs">⭐</span>}
                    </div>
                    <div className="text-xs text-gray-500">{p.position}{p.club ? ` · ${p.club}` : ""}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scoring summary */}
          <div className="bg-white/3 rounded-2xl p-4 text-sm text-gray-400">
            <div className="font-bold text-white mb-2">📊 Potential Points</div>
            <div className="space-y-1">
              {knockout ? (
                <>
                  <div className="flex justify-between"><span>Correct result (W/D/L)</span><span className="text-emerald-400 font-bold">+3</span></div>
                  <div className="flex justify-between"><span>Exact score (bonus)</span><span className="text-emerald-400 font-bold">+8</span></div>
                  <div className="flex justify-between"><span>Man of the Match</span><span className="text-purple-400 font-bold">+5</span></div>
                  <div className="flex justify-between"><span>First Scorer</span><span className="text-orange-400 font-bold">+10</span></div>
                  <div className="flex justify-between"><span>Both Teams Score (BTTS)</span><span className="text-cyan-400 font-bold">+2</span></div>
                  <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
                    <span className="font-bold text-white">Max per match</span>
                    <span className="font-black text-yellow-400">+28 pts</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span>Correct result (W/D/L)</span><span className="text-emerald-400 font-bold">+1</span></div>
                  <div className="flex justify-between"><span>Exact score (bonus)</span><span className="text-emerald-400 font-bold">+4</span></div>
                  <div className="flex justify-between"><span>Man of the Match</span><span className="text-purple-400 font-bold">+3</span></div>
                  <div className="flex justify-between"><span>First Scorer</span><span className="text-orange-400 font-bold">+5</span></div>
                  <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
                    <span className="font-bold text-white">Max per match</span>
                    <span className="font-black text-yellow-400">+13 pts</span>
                  </div>
                </>
              )}
              {knockout && (
                <>
                  <div className="border-t border-white/10 mt-2 pt-2 text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Knockout Bonuses</div>
                  <div className="flex justify-between text-xs"><span>Correct AET prediction (draw = AET)</span><span className="text-orange-400 font-bold">+5</span></div>
                  <div className="flex justify-between text-xs"><span>Correct penalties prediction</span><span className="text-red-400 font-bold">+8</span></div>
                  <div className="flex justify-between text-xs"><span>Exact penalty score</span><span className="text-yellow-400 font-bold">+15</span></div>
                </>
              )}
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
