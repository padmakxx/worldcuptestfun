import { getSession } from "@/lib/auth";
import { getAllUsers } from "@/lib/auth";
import { computeLeaderboard } from "@/lib/scoring";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const users = await getAllUsers();
  const eligible = users.filter(u => u.approved);
  const board = await computeLeaderboard(eligible.map(u => ({ id: u.id, username: u.username, nickname: u.nickname })));

  const medals = ["🥇", "🥈", "🥉"];
  const rankColors = ["from-yellow-500/20 to-yellow-500/5 border-yellow-500/30", "from-gray-400/20 to-gray-400/5 border-gray-400/30", "from-orange-700/20 to-orange-700/5 border-orange-700/30"];

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <Link href={session.isAdmin ? "/admin" : "/dashboard"} className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <Link href={session.isAdmin ? "/admin" : "/dashboard"} className="text-sm text-gray-400 hover:text-white">← Back</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="trophy-bounce text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-black gold-gradient">Leaderboard</h1>
          <p className="text-gray-400 mt-2">FIFA World Cup 2026 · {eligible.length} Predictors</p>
        </div>

        {board.length === 0 ? (
          <div className="card-glow rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-gray-400">No points yet. Predictions are scored after matches complete!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {board.map((entry, i) => {
              const isMe = entry.userId === session.userId;
              const rank = i + 1;
              return (
                <div
                  key={entry.userId}
                  className={`relative rounded-2xl p-5 border transition-all bg-gradient-to-r ${
                    rank <= 3
                      ? rankColors[rank - 1]
                      : isMe
                      ? "from-blue-500/15 to-blue-500/5 border-blue-500/30"
                      : "card-glow"
                  } ${isMe ? "ring-2 ring-blue-400/30" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 text-center">
                      {rank <= 3 ? (
                        <span className="text-3xl">{medals[rank - 1]}</span>
                      ) : (
                        <span className="text-xl font-black text-gray-400">#{rank}</span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-white truncate">{entry.nickname}</span>
                        {isMe && <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">You</span>}
                      </div>
                      <div className="text-xs text-gray-500">@{entry.username}</div>
                    </div>

                    {/* Points */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-black gold-gradient">{entry.totalPoints}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-3 flex gap-3 text-xs">
                    <span className="bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded-lg">✅ {entry.correctResults} results</span>
                    <span className="bg-yellow-500/15 text-yellow-400 px-2 py-1 rounded-lg">🎯 {entry.exactScores} exact</span>
                    <span className="bg-purple-500/15 text-purple-400 px-2 py-1 rounded-lg">⭐ {entry.motmCorrect} MOTM</span>
                    <span className="bg-orange-500/15 text-orange-400 px-2 py-1 rounded-lg">🥅 {entry.firstScorerCorrect} first</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 card-glow rounded-2xl p-5 text-sm">
          <div className="font-bold text-white mb-3">📊 Scoring System</div>
          <div className="space-y-2 text-gray-400">
            <div className="flex justify-between"><span>Correct result (win/draw/loss)</span><span className="text-emerald-400 font-bold">+3 pts</span></div>
            <div className="flex justify-between"><span>Exact scoreline bonus</span><span className="text-yellow-400 font-bold">+5 pts</span></div>
            <div className="flex justify-between"><span>Man of the Match</span><span className="text-purple-400 font-bold">+3 pts</span></div>
            <div className="flex justify-between"><span>First Goal Scorer</span><span className="text-orange-400 font-bold">+5 pts</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
