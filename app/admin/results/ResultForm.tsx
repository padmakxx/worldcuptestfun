"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Match, isKnockout } from "@/lib/data/matches";
import { getPlayersForMatch } from "@/lib/data/players";
import type { ESPNLineup } from "@/lib/espn";

// Strip accents + lowercase for fuzzy name matching
function norm(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Snap an ESPN name to the closest player in our list, or return the original
function snapToPlayer(espnName: string, players: { name: string }[]): string {
  if (!espnName) return espnName;
  const n = norm(espnName);
  // Exact match after normalizing
  const exact = players.find(p => norm(p.name) === n);
  if (exact) return exact.name;
  // Partial: our name is contained in ESPN name or vice versa
  const partial = players.find(p => {
    const pn = norm(p.name);
    return n.includes(pn) || pn.includes(n);
  });
  if (partial) return partial.name;
  // Token overlap: share at least one significant word (length > 3)
  const tokens = n.split(/\s+/).filter(t => t.length > 3);
  const tokenMatch = players.find(p => {
    const pt = norm(p.name).split(/\s+/);
    return tokens.some(t => pt.includes(t));
  });
  return tokenMatch ? tokenMatch.name : espnName;
}

interface MatchWithResult extends Match {
  result?: { team1Score: number; team2Score: number; motm?: string; firstScorer?: string };
}

export default function ResultForm({ match }: { match: MatchWithResult }) {
  const [score1, setScore1] = useState(match.result?.team1Score?.toString() ?? "");
  const [score2, setScore2] = useState(match.result?.team2Score?.toString() ?? "");
  const [motm, setMotm] = useState(match.result?.motm ?? "");
  const [firstScorer, setFirstScorer] = useState(match.result?.firstScorer ?? "");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [success, setSuccess] = useState(false);
  // Knockout tiebreaker state
  const [wentToPenalties, setWentToPenalties] = useState<boolean | undefined>(undefined);
  const [penaltyScore1, setPenaltyScore1] = useState("");
  const [penaltyScore2, setPenaltyScore2] = useState("");
  const knockout = isKnockout(match.group);
  const isDrawScore = score1 !== "" && score2 !== "" && Number(score1) === Number(score2);
  const [lineup, setLineup] = useState<ESPNLineup | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/lineup/${match.id}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.lineup?.team1?.players?.length > 0) setLineup(d.lineup); })
      .catch(() => {});
  }, [match.id]);

  const fetchFromESPN = async () => {
    setFetching(true);
    setFetchMsg(null);
    try {
      const res = await fetch(`/api/admin/fetch-result?matchId=${match.id}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setFetchMsg({ ok: false, text: data.error ?? "Failed to fetch" });
      } else {
        setScore1(String(data.team1Score));
        setScore2(String(data.team2Score));
        const snappedFirst = data.firstScorer ? snapToPlayer(data.firstScorer, players) : "";
        const snappedMotm = data.motm ? snapToPlayer(data.motm, players) : "";
        if (snappedFirst) setFirstScorer(snappedFirst);
        if (snappedMotm) setMotm(snappedMotm);
        setFetchMsg({ ok: true, text: `Fetched! Score: ${data.team1Score}–${data.team2Score}${snappedFirst ? ` · 1st scorer: ${snappedFirst}` : ""}${snappedMotm ? ` · MOTM: ${snappedMotm}` : " · Pick MOTM manually"}` });
      }
    } catch {
      setFetchMsg({ ok: false, text: "Network error" });
    }
    setFetching(false);
  };

  const staticPlayers = getPlayersForMatch(match.team1, match.team2);
  const players = lineup
    ? [
        ...lineup.team1.players.map(p => ({ name: p.name, team: p.team, position: p.position, club: "" as string, isStar: false })),
        ...lineup.team2.players.map(p => ({ name: p.name, team: p.team, position: p.position, club: "" as string, isStar: false })),
      ]
    : staticPlayers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: match.id, team1Score: Number(score1), team2Score: Number(score2), motm, firstScorer,
        ...(knockout && isDrawScore ? {
          wentToPenalties: wentToPenalties ?? false,
          penaltyTeam1: wentToPenalties ? Number(penaltyScore1) : undefined,
          penaltyTeam2: wentToPenalties ? Number(penaltyScore2) : undefined,
        } : {}),
      }),
    });
    setLoading(false);
    if (res.ok) { setSuccess(true); router.refresh(); }
  };

  return (
    <div className="card-glow rounded-2xl p-6">
      <h3 className="font-black text-lg text-white mb-4">
        {match.team1Flag} {match.team1} vs {match.team2} {match.team2Flag}
      </h3>

      {/* ESPN auto-fetch */}
      <button type="button" onClick={fetchFromESPN} disabled={fetching}
        className="w-full mb-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
        style={{background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.3)",color:"#60a5fa"}}>
        {fetching ? "⏳ Fetching from ESPN..." : "🔄 Auto-fill from ESPN"}
      </button>

      {fetchMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${fetchMsg.ok ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400" : "bg-red-500/15 border border-red-500/30 text-red-400"}`}>
          {fetchMsg.text}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm mb-4 text-center">
          ✅ Result saved! Points calculated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Score */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Final Score</label>
          <div className="flex items-center gap-3 justify-center">
            <div className="text-center">
              <div className="text-xl mb-1">{match.team1Flag}</div>
              <input type="number" min={0} max={20} value={score1} onChange={e => setScore1(e.target.value)}
                className="score-input" placeholder="0" required />
            </div>
            <div className="text-gray-400 font-bold pb-2">–</div>
            <div className="text-center">
              <div className="text-xl mb-1">{match.team2Flag}</div>
              <input type="number" min={0} max={20} value={score2} onChange={e => setScore2(e.target.value)}
                className="score-input" placeholder="0" required />
            </div>
          </div>
        </div>

        {/* MOTM */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">⭐ Man of the Match</label>
          <input type="text" value={motm} onChange={e => setMotm(e.target.value)}
            placeholder="Type player name..."
            className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}} />
        </div>

        {/* First scorer */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">🥅 First Goal Scorer</label>
          <input type="text" value={firstScorer} onChange={e => setFirstScorer(e.target.value)}
            placeholder="Type player name..."
            className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}} />
        </div>

        {/* Knockout AET/Penalties — only for knockout matches with a draw score */}
        {knockout && isDrawScore && (
          <div className="rounded-xl p-4 space-y-4" style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)"}}>
            <div className="font-bold text-white text-sm">⚡ Knockout — AET &amp; Penalties</div>
            <p className="text-xs text-gray-400">Score is a draw → match went to AET. Did it go to penalties?</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setWentToPenalties(true)}
                className={`py-2.5 rounded-lg font-bold text-xs transition-all ${wentToPenalties === true ? "bg-red-500/30 text-red-300 border border-red-500/40" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/8"}`}>
                🔴 Yes — Went to Penalties
              </button>
              <button type="button" onClick={() => { setWentToPenalties(false); setPenaltyScore1(""); setPenaltyScore2(""); }}
                className={`py-2.5 rounded-lg font-bold text-xs transition-all ${wentToPenalties === false ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/8"}`}>
                🟢 No — AET decided it
              </button>
            </div>
            {wentToPenalties === true && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">🥅 Penalty Score</label>
                <div className="flex items-center gap-3 justify-center">
                  <div className="text-center">
                    <div className="text-lg mb-1">{match.team1Flag}</div>
                    <input type="number" min={0} max={9} value={penaltyScore1} onChange={e => setPenaltyScore1(e.target.value)}
                      className="score-input" placeholder="0" />
                  </div>
                  <span className="text-gray-400 font-bold pb-2">–</span>
                  <div className="text-center">
                    <div className="text-lg mb-1">{match.team2Flag}</div>
                    <input type="number" min={0} max={9} value={penaltyScore2} onChange={e => setPenaltyScore2(e.target.value)}
                      className="score-input" placeholder="0" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded-xl font-bold">
          {loading ? "Saving..." : "✅ Save Result & Score Predictions"}
        </button>
      </form>
    </div>
  );
}
