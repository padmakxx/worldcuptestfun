import { getSession, getAllUsers } from "@/lib/auth";
import { computeLeaderboard } from "@/lib/scoring";
import { redirect } from "next/navigation";
import Link from "next/link";
import RacingLeaderboard from "@/components/RacingLeaderboard";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const users = await getAllUsers();
  const eligible = users.filter(u => u.approved);
  const userMap = Object.fromEntries(eligible.map(u => [u.id, u]));
  const board = await computeLeaderboard(eligible.map(u => ({ id: u.id, username: u.username, nickname: u.nickname })));
  const boardWithAvatars = board.map(e => ({
    ...e,
    avatar: userMap[e.userId]?.avatar,
    supportedTeam: userMap[e.userId]?.supportedTeam,
    avatarColor: userMap[e.userId]?.avatarColor,
  }));

  return (
    <div className="min-h-screen pb-16">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <Link href={session.isAdmin ? "/admin" : "/dashboard"} className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <div className="flex items-center gap-3">
          <Link href={session.isAdmin ? "/admin" : "/dashboard"} className="text-sm text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
        </div>
      </nav>

      {/* Hero banner */}
      <div className="relative overflow-hidden py-10 px-4 text-center" style={{background:"linear-gradient(180deg,rgba(255,215,0,0.08) 0%,transparent 100%)"}}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-yellow-500/5 rounded-full blur-3xl" />
        </div>
        <div className="trophy-bounce text-6xl mb-3 relative">🏆</div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-1 relative">
          Prediction <span className="gold-gradient">Race</span>
        </h1>
        <p className="text-gray-400 relative text-sm">FIFA World Cup 2026 · {eligible.length} Competitors</p>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {boardWithAvatars.length === 0 ? (
          <div className="card-glow rounded-2xl p-12 text-center mt-8">
            <div className="text-5xl mb-4">🏁</div>
            <h3 className="text-xl font-bold text-white mb-2">Race Not Started Yet</h3>
            <p className="text-gray-400">Scores will appear here after matches complete and results are entered!</p>
          </div>
        ) : (
          <>
            <RacingLeaderboard board={boardWithAvatars} currentUserId={session.userId} />

            {/* Scoring reference */}
            <div className="mt-8 card-glow rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4 text-center">📊 How Points Are Earned</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Correct result", sub: "Win / Draw / Loss", pts: "+1", color: "emerald", icon: "✅" },
                  { label: "Exact scoreline", sub: "Bonus on top of result", pts: "+4", color: "yellow", icon: "🎯" },
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
                <span className="font-black text-yellow-400 text-lg">13 points</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
