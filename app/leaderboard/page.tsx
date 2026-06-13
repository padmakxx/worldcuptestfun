import { getSession } from "@/lib/auth";
import { getAllUsers } from "@/lib/auth";
import { computeLeaderboard, LeaderboardEntry } from "@/lib/scoring";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const users = await getAllUsers();
  const eligible = users.filter(u => u.approved);
  const board = await computeLeaderboard(eligible.map(u => ({ id: u.id, username: u.username, nickname: u.nickname })));

  const topThree = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div className="min-h-screen pb-16">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <Link href={session.isAdmin ? "/admin" : "/dashboard"} className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <div className="flex items-center gap-3">
          <Link href={session.isAdmin ? "/admin" : "/dashboard"} className="text-sm text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
        </div>
      </nav>

      {/* Hero banner */}
      <div className="relative overflow-hidden py-12 px-4 text-center" style={{background:"linear-gradient(180deg,rgba(255,215,0,0.08) 0%,transparent 100%)"}}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-yellow-500/5 rounded-full blur-3xl" />
        </div>
        <div className="trophy-bounce text-7xl mb-4 relative">🏆</div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 relative">
          Champion <span className="gold-gradient">Leaderboard</span>
        </h1>
        <p className="text-gray-400 relative">FIFA World Cup 2026 · {eligible.length} Predictors</p>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {board.length === 0 ? (
          <div className="card-glow rounded-2xl p-12 text-center mt-8">
            <div className="text-5xl mb-4">⏳</div>
            <h3 className="text-xl font-bold text-white mb-2">No Points Yet</h3>
            <p className="text-gray-400">Scores will appear here after matches complete and results are entered!</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {topThree.length > 0 && (
              <div className="mb-8">
                <PodiumDisplay entries={topThree} currentUserId={session.userId} />
              </div>
            )}

            {/* Rest of leaderboard */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((entry, i) => (
                  <LeaderboardRow key={entry.userId} entry={entry} rank={i + 4} isMe={entry.userId === session.userId} />
                ))}
              </div>
            )}

            {/* Scoring reference */}
            <div className="mt-10 card-glow rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 text-center">📊 How Points Are Earned</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Correct result", sub: "Win / Draw / Loss", pts: "+3", color: "emerald", icon: "✅" },
                  { label: "Exact scoreline", sub: "Bonus on top of result", pts: "+5", color: "yellow", icon: "🎯" },
                  { label: "Man of the Match", sub: "Your player pick", pts: "+3", color: "purple", icon: "⭐" },
                  { label: "First Goal Scorer", sub: "Who breaks deadlock", pts: "+5", color: "orange", icon: "🥅" },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-4 text-center"
                    style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className={`text-2xl font-black mb-1 text-${item.color}-400`}>{item.pts}</div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm">
                <span className="text-gray-400">Perfect match prediction = </span>
                <span className="font-black text-yellow-400 text-lg">16 points</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PodiumDisplay({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId: string }) {
  // Reorder for podium: 2nd, 1st, 3rd
  const podiumOrder = entries.length >= 3
    ? [entries[1], entries[0], entries[2]]
    : entries.length === 2
    ? [entries[1], entries[0]]
    : entries;

  const heights = entries.length >= 3 ? ["h-20", "h-32", "h-12"] : ["h-20", "h-32"];
  const medals = ["🥈", "🥇", "🥉"];
  const ranks = [2, 1, 3];
  const glows = [
    "shadow-[0_0_30px_rgba(192,192,192,0.2)]",
    "shadow-[0_0_40px_rgba(255,215,0,0.3)]",
    "shadow-[0_0_25px_rgba(205,127,50,0.2)]",
  ];
  const borders = [
    "border-gray-400/40",
    "border-yellow-400/60",
    "border-orange-700/40",
  ];

  return (
    <div className="flex items-end justify-center gap-4 pt-8 pb-4">
      {podiumOrder.map((entry, i) => {
        const isFirst = ranks[i] === 1;
        const isMe = entry.userId === currentUserId;
        return (
          <div key={entry.userId} className={`flex flex-col items-center ${isFirst ? "scale-105" : ""}`} style={{width:"30%"}}>
            {/* Avatar */}
            <div className={`relative mb-3`}>
              {isMe && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold z-10">You</div>
              )}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl border-4 ${borders[i]} ${glows[i]}`}
                style={{
                  background: isFirst
                    ? "linear-gradient(135deg,#FFD700,#FFA500)"
                    : i === 0
                    ? "linear-gradient(135deg,#9CA3AF,#6B7280)"
                    : "linear-gradient(135deg,#CD7F32,#A0522D)",
                  color: "#0a0e1a"
                }}
              >
                {entry.nickname[0].toUpperCase()}
              </div>
            </div>
            <div className="text-2xl">{medals[i]}</div>
            <div className="font-black text-white text-center text-sm mt-1 leading-tight">{entry.nickname}</div>
            <div className={`text-2xl font-black mt-1 ${isFirst ? "gold-gradient" : "text-gray-300"}`}>
              {entry.totalPoints}
            </div>
            <div className="text-xs text-gray-500 mb-2">pts</div>
            {/* Podium block */}
            <div
              className={`w-full rounded-t-lg ${heights[i]} border-t border-x ${borders[i]}`}
              style={{
                background: isFirst
                  ? "linear-gradient(180deg,rgba(255,215,0,0.15),rgba(255,215,0,0.05))"
                  : i === 0
                  ? "linear-gradient(180deg,rgba(156,163,175,0.1),rgba(156,163,175,0.03))"
                  : "linear-gradient(180deg,rgba(205,127,50,0.1),rgba(205,127,50,0.03))",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardRow({ entry, rank, isMe }: { entry: LeaderboardEntry; rank: number; isMe: boolean }) {
  const maxPts = 16; // max per prediction
  const barPct = Math.min(100, entry.totalPoints > 0 ? (entry.totalPoints / (rank <= 5 ? 80 : 60)) * 100 : 0);

  return (
    <div className={`relative rounded-2xl p-4 transition-all ${
      isMe ? "border border-blue-400/30 bg-blue-500/5" : "card-glow"
    }`}>
      <div className="flex items-center gap-4">
        <div className="w-8 text-center font-black text-gray-500 text-lg flex-shrink-0">#{rank}</div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{background:"linear-gradient(135deg,rgba(255,215,0,0.3),rgba(255,215,0,0.1))",border:"1px solid rgba(255,215,0,0.2)"}}>
          <span className="gold-gradient">{entry.nickname[0].toUpperCase()}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white truncate">{entry.nickname}</span>
            {isMe && <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full flex-shrink-0">You</span>}
          </div>
          <div className="text-xs text-gray-500 mb-1">@{entry.username}</div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.06)"}}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width:`${barPct}%`,
                background:"linear-gradient(90deg,#10b981,#FFD700)"
              }}
            />
          </div>
        </div>

        {/* Points */}
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-black gold-gradient">{entry.totalPoints}</div>
          <div className="text-xs text-gray-500">pts</div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="mt-3 ml-12 flex gap-2 flex-wrap text-xs">
        <StatChip icon="✅" val={entry.correctResults} label="results" color="emerald" />
        <StatChip icon="🎯" val={entry.exactScores} label="exact" color="yellow" />
        <StatChip icon="⭐" val={entry.motmCorrect} label="MOTM" color="purple" />
        <StatChip icon="🥅" val={entry.firstScorerCorrect} label="1st scorer" color="orange" />
      </div>
    </div>
  );
}

function StatChip({ icon, val, label, color }: { icon: string; val: number; label: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-400",
    yellow: "bg-yellow-500/15 text-yellow-400",
    purple: "bg-purple-500/15 text-purple-400",
    orange: "bg-orange-500/15 text-orange-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg font-semibold ${colors[color]}`}>
      {icon} {val} {label}
    </span>
  );
}
