"use client";
import { useState } from "react";

const COMMON_FLAGS: Record<string, string> = {
  "Argentina": "🇦🇷", "Brazil": "🇧🇷", "France": "🇫🇷", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Spain": "🇪🇸", "Germany": "🇩🇪", "Portugal": "🇵🇹", "Netherlands": "🇳🇱",
  "USA": "🇺🇸", "United States": "🇺🇸", "Mexico": "🇲🇽", "Morocco": "🇲🇦",
  "Japan": "🇯🇵", "South Korea": "🇰🇷", "Australia": "🇦🇺", "Canada": "🇨🇦",
  "Belgium": "🇧🇪", "Uruguay": "🇺🇾", "Colombia": "🇨🇴", "Ecuador": "🇪🇨",
  "Switzerland": "🇨🇭", "Algeria": "🇩🇿", "Senegal": "🇸🇳", "Norway": "🇳🇴",
  "Sweden": "🇸🇪", "Croatia": "🇭🇷", "Austria": "🇦🇹", "South Africa": "🇿🇦",
  "Ivory Coast": "🇨🇮", "Ghana": "🇬🇭", "Egypt": "🇪🇬", "Paraguay": "🇵🇾",
  "Bosnia and Herzegovina": "🇧🇦", "DR Congo": "🇨🇩", "Cape Verde": "🇨🇻",
  "Turkey": "🇹🇷",
};

interface MatchData {
  id: string;
  matchNumber: number;
  date: string;
  time: string;
  group: string;
  team1: string;
  team1Flag: string;
  team2: string;
  team2Flag: string;
  venue: string;
  city: string;
  team1Qualifier?: string;
  team2Qualifier?: string;
}

export default function BracketEditor({ match }: { match: MatchData }) {
  const [editing, setEditing] = useState(false);
  const [t1, setT1] = useState(match.team1 === "TBD" ? "" : match.team1);
  const [t1f, setT1f] = useState(match.team1Flag === "🏆" || match.team1Flag === "🥉" ? "" : match.team1Flag);
  const [t2, setT2] = useState(match.team2 === "TBD" ? "" : match.team2);
  const [t2f, setT2f] = useState(match.team2Flag === "🏆" || match.team2Flag === "🥉" ? "" : match.team2Flag);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isTbd = match.team1 === "TBD" || match.team2 === "TBD";
  const dateStr = new Date(match.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const handleT1Change = (val: string) => {
    setT1(val);
    if (COMMON_FLAGS[val]) setT1f(COMMON_FLAGS[val]);
  };
  const handleT2Change = (val: string) => {
    setT2(val);
    if (COMMON_FLAGS[val]) setT2f(COMMON_FLAGS[val]);
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/bracket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: match.id,
        team1: t1 || "TBD",
        team1Flag: t1f || "🏆",
        team2: t2 || "TBD",
        team2Flag: t2f || "🏆",
      }),
    });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-1">
            Match {match.matchNumber} · {dateStr} · {match.time} · {match.city}
          </div>
          {!editing ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{match.team1Flag}</span>
                <div>
                  <div className="font-bold text-white text-sm">{match.team1}</div>
                  {isTbd && match.team1Qualifier && (
                    <div className="text-xs text-gray-500">{match.team1Qualifier}</div>
                  )}
                </div>
              </div>
              <span className="text-gray-600 font-bold">vs</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{match.team2Flag}</span>
                <div>
                  <div className="font-bold text-white text-sm">{match.team2}</div>
                  {isTbd && match.team2Qualifier && (
                    <div className="text-xs text-gray-500">{match.team2Qualifier}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              <div className="flex gap-2 items-center">
                <input
                  value={t1f}
                  onChange={e => setT1f(e.target.value)}
                  placeholder="🏆"
                  className="w-14 px-2 py-1.5 rounded-lg text-white text-center text-xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                />
                <input
                  value={t1}
                  onChange={e => handleT1Change(e.target.value)}
                  placeholder="Team 1 name"
                  className="flex-1 px-3 py-1.5 rounded-lg text-white text-sm"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                />
              </div>
              <div className="flex gap-2 items-center">
                <input
                  value={t2f}
                  onChange={e => setT2f(e.target.value)}
                  placeholder="🏆"
                  className="w-14 px-2 py-1.5 rounded-lg text-white text-center text-xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                />
                <input
                  value={t2}
                  onChange={e => handleT2Change(e.target.value)}
                  placeholder="Team 2 name"
                  className="flex-1 px-3 py-1.5 rounded-lg text-white text-sm"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {saved && <span className="text-xs text-emerald-400 font-bold">✓ Saved</span>}
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="text-xs font-bold bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 px-3 py-1.5 rounded-lg border border-yellow-400/30 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 border border-white/10 transition-all"
            >
              ✏️ Edit Teams
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
