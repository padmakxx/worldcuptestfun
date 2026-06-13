"use client";
import { useState, useEffect, useCallback } from "react";

interface LiveScore {
  eventId: string;
  matchId: string | null;
  status: "pre" | "in" | "post";
  clock?: string;
  detail?: string;
  team1Score: number;
  team2Score: number;
  team1Name: string;
  team2Name: string;
}

const POLL_INTERVAL = 60_000; // 60 seconds

export default function LiveScoreTicker({ date }: { date: string }) {
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch(`/api/live?date=${date}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const live = (data.scores as LiveScore[]).filter(s => s.status === "in" || s.status === "post");
      setScores(live);
      setLastUpdated(new Date());
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => {
    fetchScores();
    const timer = setInterval(fetchScores, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchScores]);

  const liveScores = scores.filter(s => s.status === "in");
  const recentFinished = scores.filter(s => s.status === "post").slice(0, 3);

  if (loading || scores.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Live matches */}
      {liveScores.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="live-badge w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
            <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Live Now</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {liveScores.map(s => (
              <div key={s.eventId} className="flex-shrink-0 rounded-2xl px-4 py-3 min-w-[200px]"
                style={{background:"linear-gradient(135deg,rgba(239,68,68,0.15),rgba(239,68,68,0.05))",border:"1px solid rgba(239,68,68,0.3)"}}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-white truncate">{s.team1Name}</div>
                  <div className="text-xl font-black text-red-400 whitespace-nowrap">{s.team1Score} – {s.team2Score}</div>
                  <div className="text-sm font-bold text-white truncate text-right">{s.team2Name}</div>
                </div>
                <div className="text-center text-xs text-red-400 mt-1 font-bold">
                  {s.clock ?? s.detail ?? "Live"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently finished */}
      {recentFinished.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-semibold">🏁 Final Scores</span>
            {lastUpdated && (
              <span className="text-xs text-gray-600">Updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentFinished.map(s => (
              <div key={s.eventId} className="flex-shrink-0 card-glow rounded-2xl px-4 py-3 min-w-[200px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-white truncate">{s.team1Name}</div>
                  <div className="text-xl font-black text-white whitespace-nowrap">{s.team1Score} – {s.team2Score}</div>
                  <div className="text-sm font-bold text-white truncate text-right">{s.team2Name}</div>
                </div>
                <div className="text-center text-xs text-gray-500 mt-1">Full Time</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
