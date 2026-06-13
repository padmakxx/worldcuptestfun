"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { ESPNLineup } from "@/lib/espn";

const PitchFormation = dynamic(() => import("./PitchFormation"), { ssr: false });

interface Props {
  matchId: string;
  team1Flag: string;
  team2Flag: string;
  team1Name: string;
  team2Name: string;
}

export default function LineupPanel({ matchId, team1Flag, team2Flag, team1Name, team2Name }: Props) {
  const [lineup, setLineup] = useState<ESPNLineup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const fetchLineup = async (force = false) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/lineup/${matchId}${force ? "?refresh=1" : ""}`);
      const data = await res.json();
      if (data.lineup && data.lineup.team1.players.length > 0) {
        setLineup(data.lineup);
      } else {
        setError("Lineup not yet announced. Usually available 1 hour before kickoff.");
      }
    } catch {
      setError("Failed to fetch lineup");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && !lineup) fetchLineup();
  }, [open]);

  const hasLineup = lineup && lineup.team1.players.filter(p => p.starter).length >= 10;
  const fetchedMins = lineup
    ? Math.floor((Date.now() - new Date(lineup.fetchedAt).getTime()) / 60000)
    : null;

  return (
    <div className="card-glow rounded-3xl overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/3 transition-all"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🟢</span>
            <span className="font-black text-lg text-white">Official Lineups</span>
            {hasLineup && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Available
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400 mt-0.5">
            {team1Flag} {team1Name} vs {team2Flag} {team2Name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasLineup && fetchedMins !== null && (
            <span className="text-xs text-gray-500">{fetchedMins}m ago</span>
          )}
          <span className="text-gray-400 text-lg">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Collapsible content */}
      {open && (
        <div className="px-6 pb-6">
          {loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3 animate-spin inline-block">⚽</div>
              <p className="text-gray-400">Fetching lineups from ESPN...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => fetchLineup(true)}
                className="btn-gold px-4 py-2 rounded-xl text-sm font-bold"
              >
                🔄 Check Again
              </button>
            </div>
          )}

          {!loading && hasLineup && lineup && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                  Lineup confirmed · Fetched {fetchedMins === 0 ? "just now" : `${fetchedMins}m ago`}
                </span>
                <button
                  onClick={() => fetchLineup(true)}
                  className="text-xs text-gray-500 hover:text-yellow-400 transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
              <PitchFormation lineup={lineup} team1Flag={team1Flag} team2Flag={team2Flag} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
