"use client";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import type { LeaderboardEntry } from "@/lib/scoring";

type BoardEntry = LeaderboardEntry & { avatar?: string; supportedTeam?: string; avatarColor?: string };

const RANK_STYLES = [
  { car: "🏎️", glow: "#FFD700", border: "rgba(255,215,0,0.7)", track: "rgba(255,215,0,0.06)", medal: "🥇", label: "POLE", labelColor: "#FFD700" },
  { car: "🚗", glow: "#C0C0C0", border: "rgba(192,192,192,0.5)", track: "rgba(192,192,192,0.04)", medal: "🥈", label: "P2", labelColor: "#C0C0C0" },
  { car: "🚀", glow: "#CD7F32", border: "rgba(205,127,50,0.5)", track: "rgba(205,127,50,0.04)", medal: "🥉", label: "P3", labelColor: "#CD7F32" },
];

const ALT_CARS = ["⚡", "💨", "🔥", "🌀", "🎯", "💥", "🛸", "🚁", "🦅", "🐆"];

function getCarStyle(rank: number) {
  if (rank <= 3) return RANK_STYLES[rank - 1];
  return {
    car: ALT_CARS[(rank - 4) % ALT_CARS.length],
    glow: "rgba(99,102,241,0.6)",
    border: "rgba(99,102,241,0.25)",
    track: "rgba(99,102,241,0.025)",
    medal: `#${rank}`,
    label: `P${rank}`,
    labelColor: "#6366f1",
  };
}

function SpeedLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute h-px opacity-20"
          style={{
            top: `${10 + i * 15}%`,
            left: 0,
            right: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.6) 40%, transparent 100%)",
            animation: `speedline ${1.2 + i * 0.3}s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function CheckeredFlag({ pct }: { pct: number }) {
  if (pct < 85) return null;
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xl pr-1 select-none" style={{ animation: "flagwave 0.8s ease-in-out infinite alternate" }}>
      🏁
    </div>
  );
}

interface RacingRowProps {
  entry: BoardEntry;
  rank: number;
  maxPts: number;
  isMe: boolean;
  delay: number;
}

function RacingRow({ entry, rank, maxPts, isMe, delay }: RacingRowProps) {
  const [animated, setAnimated] = useState(false);
  const style = getCarStyle(rank);
  const pct = maxPts > 0 ? Math.max(4, (entry.totalPoints / maxPts) * 88) : 4;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-3"
      style={{
        background: isMe
          ? "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05))"
          : style.track,
        border: isMe ? "1px solid rgba(59,130,246,0.4)" : `1px solid ${style.border}`,
        boxShadow: isMe ? `0 0 20px rgba(59,130,246,0.15)` : rank <= 3 ? `0 0 24px ${style.glow}22` : "none",
      }}
    >
      {/* Speed lines bg for top 3 */}
      {rank <= 3 && <SpeedLines />}

      <div className="relative px-3 py-3 flex items-center gap-3">
        {/* Rank badge */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
          style={{
            background: rank <= 3 ? `radial-gradient(circle, ${style.glow}33, transparent)` : "rgba(255,255,255,0.04)",
            border: `2px solid ${style.border}`,
            color: style.labelColor,
            boxShadow: rank <= 3 ? `0 0 12px ${style.glow}55` : "none",
          }}
        >
          {rank <= 3 ? style.medal : `#${rank}`}
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          {isMe && (
            <div className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold z-10 leading-tight">YOU</div>
          )}
          <div className="rounded-full" style={{ border: `2px solid ${isMe ? "rgba(59,130,246,0.6)" : style.border}` }}>
            <Avatar
              nickname={entry.nickname}
              avatar={entry.avatar}
              supportedTeam={entry.supportedTeam}
              avatarColor={entry.avatarColor}
              size="sm"
            />
          </div>
        </div>

        {/* Name + track */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-white text-sm truncate">{entry.nickname}</span>
            {rank === 1 && <span className="text-xs px-1.5 py-0.5 rounded-full font-black" style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>LEADER</span>}
          </div>

          {/* Race track */}
          <div className="relative h-7 rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Track lane markings */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex-1 h-px mx-0.5 opacity-10" style={{ background: "white" }} />
              ))}
            </div>

            {/* Progress fill */}
            <div
              className="absolute inset-y-1 left-1 rounded-md transition-all"
              style={{
                width: animated ? `calc(${pct}% - 4px)` : "0%",
                transitionDuration: "1.2s",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                background: rank <= 3
                  ? `linear-gradient(90deg, ${style.glow}44, ${style.glow}99)`
                  : isMe
                  ? "linear-gradient(90deg, rgba(59,130,246,0.3), rgba(99,102,241,0.6))"
                  : "linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.4))",
              }}
            />

            {/* Car emoji — positioned at front of progress */}
            <div
              className="absolute top-0 bottom-0 flex items-center transition-all"
              style={{
                left: animated ? `calc(${pct}% - 20px)` : "0%",
                transitionDuration: "1.2s",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <span
                className="text-base select-none leading-none"
                style={{
                  filter: rank <= 3 ? `drop-shadow(0 0 6px ${style.glow})` : "none",
                  animation: animated ? "carBounce 0.6s ease-in-out infinite alternate" : "none",
                }}
              >
                {style.car}
              </span>
            </div>

            <CheckeredFlag pct={pct} />
          </div>

          {/* Mini stats */}
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <span className="text-[10px] text-emerald-400 opacity-80">✅ {entry.correctResults}</span>
            <span className="text-[10px] text-yellow-400 opacity-80">🎯 {entry.exactScores}</span>
            <span className="text-[10px] text-purple-400 opacity-80">⭐ {entry.motmCorrect}</span>
            <span className="text-[10px] text-orange-400 opacity-80">🥅 {entry.firstScorerCorrect}</span>
          </div>
        </div>

        {/* Points */}
        <div className="flex-shrink-0 text-right pl-2">
          <div
            className="text-2xl font-black leading-none"
            style={{
              color: rank <= 3 ? style.glow : isMe ? "#60a5fa" : "white",
              textShadow: rank <= 3 ? `0 0 20px ${style.glow}88` : "none",
            }}
          >
            {entry.totalPoints}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">pts</div>
        </div>
      </div>
    </div>
  );
}

export default function RacingLeaderboard({ board, currentUserId }: { board: BoardEntry[]; currentUserId: string }) {
  const maxPts = board.length > 0 ? board[0].totalPoints : 1;

  return (
    <>
      <style>{`
        @keyframes speedline {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 0.3; }
          80% { opacity: 0.15; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes carBounce {
          0% { transform: translateY(0px) rotate(-3deg); }
          100% { transform: translateY(-2px) rotate(3deg); }
        }
        @keyframes flagwave {
          0% { transform: translateY(-50%) rotate(-5deg) scale(1); }
          100% { transform: translateY(-50%) rotate(5deg) scale(1.1); }
        }
        @keyframes pitEntrance {
          0% { opacity: 0; transform: translateX(-30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Race header */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="text-3xl">🏁</div>
        <div>
          <h2 className="text-lg font-black text-white">Race Standings</h2>
          <p className="text-xs text-gray-500">{board.length} competitors · WC2026 Prediction Race</p>
        </div>
        <div className="ml-auto text-2xl" style={{ animation: "carBounce 0.8s ease-in-out infinite alternate" }}>🏎️</div>
      </div>

      {/* Pit lane — all rows */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(180deg, rgba(10,14,26,0.8) 0%, rgba(5,8,15,0.95) 100%)",
          border: "1px solid rgba(255,215,0,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Pit lane header stripe */}
        <div className="flex mb-4 gap-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="flex-1 h-2 rounded-sm"
              style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.4)" }}
            />
          ))}
        </div>

        {board.map((entry, i) => (
          <div
            key={entry.userId}
            style={{ animation: `pitEntrance 0.4s ease-out ${i * 80}ms both` }}
          >
            <RacingRow
              entry={entry}
              rank={i + 1}
              maxPts={maxPts}
              isMe={entry.userId === currentUserId}
              delay={300 + i * 100}
            />
          </div>
        ))}

        {/* Finish line decoration */}
        <div className="flex gap-1 mt-4">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="flex-1 h-2 rounded-sm"
              style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.4)" }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
