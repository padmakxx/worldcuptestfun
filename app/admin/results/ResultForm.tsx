"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Match } from "@/lib/data/matches";
import { getPlayersForMatch } from "@/lib/data/players";
import type { ESPNLineup } from "@/lib/espn";

interface MatchWithResult extends Match {
  result?: { team1Score: number; team2Score: number; motm?: string; firstScorer?: string };
}

export default function ResultForm({ match }: { match: MatchWithResult }) {
  const [score1, setScore1] = useState(match.result?.team1Score?.toString() ?? "");
  const [score2, setScore2] = useState(match.result?.team2Score?.toString() ?? "");
  const [motm, setMotm] = useState(match.result?.motm ?? "");
  const [firstScorer, setFirstScorer] = useState(match.result?.firstScorer ?? "");
  const [search, setSearch] = useState("");
  const [firstSearch, setFirstSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [success, setSuccess] = useState(false);
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
        if (data.firstScorer) setFirstScorer(data.firstScorer);
        if (data.motm) setMotm(data.motm);
        setFetchMsg({ ok: true, text: `Fetched! Score: ${data.team1Score}–${data.team2Score}${data.firstScorer ? ` · 1st scorer: ${data.firstScorer}` : ""}${data.motm ? ` · MOTM: ${data.motm}` : " · Pick MOTM manually"}` });
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

  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase()));
  const filteredFirst = players.filter(p => p.name.toLowerCase().includes(firstSearch.toLowerCase()) || p.team.toLowerCase().includes(firstSearch.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: match.id, team1Score: Number(score1), team2Score: Number(score2), motm, firstScorer }),
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
          <label className="block text-sm font-semibold text-gray-300 mb-2">⭐ Man of the Match {lineup && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 ml-1">Official lineup</span>}</label>
          {motm && (
            <div className="mb-2 flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg text-sm">
              <span>{motm}</span>
              <button type="button" onClick={() => setMotm("")} className="ml-auto">×</button>
            </div>
          )}
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player..."
            className="w-full px-3 py-2 rounded-lg text-white placeholder-gray-500 text-sm mb-2"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}} />
          <div className="max-h-36 overflow-y-auto space-y-1">
            {(search ? filtered : players).map(p => (
              <button key={`m-${p.name}`} type="button" onClick={() => { setMotm(p.name); setSearch(""); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${motm === p.name ? "bg-purple-500/30 text-purple-200" : "hover:bg-white/5 text-gray-300"}`}>
                {p.team === match.team1 ? match.team1Flag : match.team2Flag} {p.name} <span className="text-xs text-gray-500">({p.position})</span>
              </button>
            ))}
          </div>
        </div>

        {/* First scorer */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">🥅 First Goal Scorer {lineup && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 ml-1">Official lineup</span>}</label>
          {firstScorer && (
            <div className="mb-2 flex items-center gap-2 bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg text-sm">
              <span>{firstScorer}</span>
              <button type="button" onClick={() => setFirstScorer("")} className="ml-auto">×</button>
            </div>
          )}
          <input type="text" value={firstSearch} onChange={e => setFirstSearch(e.target.value)} placeholder="Search player..."
            className="w-full px-3 py-2 rounded-lg text-white placeholder-gray-500 text-sm mb-2"
            style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}} />
          <div className="max-h-36 overflow-y-auto space-y-1">
            {(firstSearch ? filteredFirst : players).map(p => (
              <button key={`f-${p.name}`} type="button" onClick={() => { setFirstScorer(p.name); setFirstSearch(""); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${firstScorer === p.name ? "bg-orange-500/30 text-orange-200" : "hover:bg-white/5 text-gray-300"}`}>
                {p.team === match.team1 ? match.team1Flag : match.team2Flag} {p.name} <span className="text-xs text-gray-500">({p.position})</span>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded-xl font-bold">
          {loading ? "Saving..." : "✅ Save Result & Score Predictions"}
        </button>
      </form>
    </div>
  );
}
