import { getSession, getAllUsers } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MATCHES } from "@/lib/data/matches";
import { kget } from "@/lib/store";
import { getPrediction } from "@/lib/scoring";
import { isMatchInPredictionWindow } from "@/lib/prediction-window";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");

  const users = await getAllUsers();
  const pendingUsers = users.filter(u => !u.approved && !u.isAdmin);
  const approvedUsers = users.filter(u => u.approved && !u.isAdmin);

  const enriched = await Promise.all(
    MATCHES.slice(0, 20).map(async m => {
      const override = await kget<{ status: string; result?: { team1Score: number; team2Score: number; motm: string; firstScorer: string } }>(`match_status:${m.id}`);
      return override ? { ...m, status: override.status, result: override.result } : { ...m };
    })
  );

  const today = new Date().toISOString().split("T")[0];
  const todayMatches = enriched.filter(m => m.date === today);
  const recentCompleted = enriched.filter(m => m.status === "completed").slice(-5).reverse();
  const upcomingToday = enriched.filter(m => m.status !== "completed" && m.date <= today);

  // Prediction tracker: open-window matches + who has/hasn't predicted
  const windowMatches = MATCHES.filter(m => isMatchInPredictionWindow(m.date) && m.status !== "completed");
  const predTracker = await Promise.all(
    windowMatches.slice(0, 10).map(async m => {
      const override = await kget<{ status: string }>(`match_status:${m.id}`);
      if (override?.status === "completed") return null;
      const statuses = await Promise.all(
        approvedUsers.map(async u => ({
          userId: u.id,
          nickname: u.nickname,
          predicted: !!(await getPrediction(u.id, m.id)),
        }))
      );
      return { match: m, statuses };
    })
  ).then(r => r.filter(Boolean)) as { match: typeof MATCHES[0]; statuses: { userId: string; nickname: string; predicted: boolean }[] }[];

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <div className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span> <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full ml-2">Admin</span></div>
        <div className="flex items-center gap-3">
          <Link href="/admin/users" className="text-sm text-gray-300 hover:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-white/5">👥 Users</Link>
          <Link href="/admin/results" className="text-sm text-gray-300 hover:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-white/5">⚽ Results</Link>
          <Link href="/leaderboard" className="text-sm text-gray-300 hover:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-white/5">🏆 Leaderboard</Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1.5 rounded-lg hover:bg-white/5">Logout</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Manage users and match results</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending Approval", value: pendingUsers.length, icon: "⏳", color: "text-yellow-400" },
            { label: "Active Players", value: approvedUsers.length, icon: "👥", color: "text-emerald-400" },
            { label: "Matches Settled", value: recentCompleted.length, icon: "✅", color: "text-blue-400" },
          ].map(s => (
            <div key={s.label} className="card-glow rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending Users */}
        {pendingUsers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="live-badge w-2.5 h-2.5 bg-yellow-400 rounded-full inline-block" />
              Pending Approvals ({pendingUsers.length})
            </h2>
            <div className="space-y-3">
              {pendingUsers.map(u => (
                <div key={u.id} className="card-glow rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white">{u.nickname}</div>
                    <div className="text-sm text-gray-400">@{u.username} · Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/users?approve=${u.id}`}
                      className="btn-gold px-4 py-2 rounded-xl text-sm font-bold"
                    >
                      ✅ Approve
                    </Link>
                    <Link
                      href={`/admin/users?deny=${u.id}`}
                      className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-all"
                    >
                      ✕ Deny
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Matches to Settle */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">⚽ Enter Match Results</h2>
            <Link href="/admin/results" className="text-sm text-yellow-400 hover:text-yellow-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {[...upcomingToday, ...recentCompleted.slice(0, 3)].slice(0, 8).map(m => {
              const dateStr = new Date(m.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <div key={m.id} className="card-glow rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <span className="bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">Group {m.group}</span>
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{m.team1Flag} {m.team1}</span>
                      {m.status === "completed" && m.result ? (
                        <span className="font-black text-white mx-1">{m.result.team1Score}–{m.result.team2Score}</span>
                      ) : (
                        <span className="text-gray-500 mx-1">vs</span>
                      )}
                      <span>{m.team2} {m.team2Flag}</span>
                    </div>
                  </div>
                  <div>
                    {m.status === "completed" ? (
                      <span className="text-xs text-gray-500 bg-gray-800 px-3 py-2 rounded-xl">✅ Settled</span>
                    ) : (
                      <Link href={`/admin/results?match=${m.id}`} className="btn-gold px-4 py-2 rounded-xl text-sm font-bold">
                        Enter Result
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Prediction Tracker */}
        {predTracker.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🔮 Prediction Tracker</h2>
            <div className="space-y-4">
              {predTracker.map(({ match: m, statuses }) => {
                const predicted = statuses.filter(s => s.predicted);
                const missing = statuses.filter(s => !s.predicted);
                return (
                  <div key={m.id} className="card-glow rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                          <span className="bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">Group {m.group}</span>
                          <span>{new Date(m.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                          <span>{m.time}</span>
                        </div>
                        <div className="font-bold text-white">{m.team1Flag} {m.team1} vs {m.team2} {m.team2Flag}</div>
                      </div>
                      <div className="text-sm font-bold">
                        <span className="text-emerald-400">{predicted.length}</span>
                        <span className="text-gray-600"> / </span>
                        <span className="text-gray-300">{statuses.length} predicted</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-800 rounded-full mb-3 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: statuses.length ? `${(predicted.length / statuses.length) * 100}%` : "0%" }} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map(s => (
                        <span key={s.userId} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.predicted ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {s.predicted ? "✅" : "⏳"} {s.nickname}
                        </span>
                      ))}
                    </div>
                    {missing.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Not yet: {missing.map(s => s.nickname).join(", ")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Active Players */}
        {approvedUsers.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">👥 Active Players ({approvedUsers.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {approvedUsers.map(u => (
                <div key={u.id} className="card-glow rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-black text-sm flex-shrink-0">
                    {u.nickname[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{u.nickname}</div>
                    <div className="text-xs text-gray-500 truncate">@{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
