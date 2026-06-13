import { getSession, getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MATCHES } from "@/lib/data/matches";
import { kget } from "@/lib/store";
import { getPrediction } from "@/lib/scoring";
import Link from "next/link";

interface MatchWithOverride {
  id: string;
  matchNumber: number;
  date: string;
  time: string;
  group: string;
  team1: string;
  team2: string;
  team1Flag: string;
  team2Flag: string;
  venue: string;
  city: string;
  status: string;
  result?: { team1Score: number; team2Score: number; motm?: string; firstScorer?: string };
}

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isAdmin) redirect("/admin");

  const user = await getUser(session.userId);
  if (!user?.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-glow rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-2xl font-black text-white mb-3">Pending Approval</h2>
          <p className="text-gray-400">Your account is awaiting admin approval. Check back soon!</p>
        </div>
      </div>
    );
  }

  const enriched: MatchWithOverride[] = await Promise.all(
    MATCHES.map(async m => {
      const override = await kget<{ status: string; result?: { team1Score: number; team2Score: number; motm: string; firstScorer: string } }>(`match_status:${m.id}`);
      if (override) return { ...m, status: override.status, result: override.result };
      return { ...m };
    })
  );

  // Get user predictions for completed/upcoming matches
  const predictions = await Promise.all(
    enriched.map(m => getPrediction(session.userId, m.id))
  );
  const predMap: Record<string, { team1Score: number; team2Score: number; motm: string; firstScorer: string } | null> = {};
  enriched.forEach((m, i) => { predMap[m.id] = predictions[i] ? { ...predictions[i]! } : null; });

  const today = new Date().toISOString().split("T")[0];
  const todayMatches = enriched.filter(m => m.date === today);
  const upcomingMatches = enriched.filter(m => m.status === "upcoming" && m.date > today).slice(0, 10);
  const completedMatches = enriched.filter(m => m.status === "completed").slice(-5).reverse();

  const totalPredicted = Object.values(predMap).filter(Boolean).length;
  const totalUpcoming = enriched.filter(m => m.status === "upcoming").length;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <Link href="/dashboard" className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <div className="flex items-center gap-3">
          <Link href="/leaderboard" className="text-sm text-gray-300 hover:text-yellow-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">🏆 Board</Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">Logout</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">
            Hey, <span className="gold-gradient">{user.nickname}</span>! 👋
          </h1>
          <p className="text-gray-400 mt-1">Ready to predict some matches?</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Predicted", value: totalPredicted, icon: "✅", color: "text-emerald-400" },
            { label: "Remaining", value: totalUpcoming, icon: "⏰", color: "text-yellow-400" },
            { label: "Completed", value: completedMatches.length, icon: "🏁", color: "text-blue-400" },
          ].map(s => (
            <div key={s.label} className="card-glow rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Today's Matches */}
        {todayMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="live-badge w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block" />
              Today&apos;s Matches
            </h2>
            <div className="space-y-3">
              {todayMatches.map(m => (
                <MatchCard key={m.id} match={m} pred={predMap[m.id]} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">⏰ Upcoming Matches</h2>
            <div className="space-y-3">
              {upcomingMatches.map(m => (
                <MatchCard key={m.id} match={m} pred={predMap[m.id]} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Results */}
        {completedMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🏁 Recent Results</h2>
            <div className="space-y-3">
              {completedMatches.map(m => (
                <MatchCard key={m.id} match={m} pred={predMap[m.id]} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, pred }: {
  match: MatchWithOverride;
  pred: { team1Score: number; team2Score: number; motm: string; firstScorer: string } | null;
}) {
  const isCompleted = match.status === "completed";
  const hasPred = !!pred;
  const dateStr = new Date(match.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className={`card-glow rounded-2xl p-4 ${isCompleted ? "opacity-80" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Teams */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span className="bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold text-xs">Group {match.group}</span>
            <span>{dateStr}</span>
            <span>{match.time}</span>
            <span className="text-gray-600">· {match.city}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-2xl">{match.team1Flag}</span>
              <span className="font-bold text-white truncate">{match.team1}</span>
            </div>
            {isCompleted && match.result ? (
              <div className="text-center px-3">
                <div className="font-black text-xl text-white">{match.result.team1Score} – {match.result.team2Score}</div>
                <div className="text-xs text-gray-500">Final</div>
              </div>
            ) : (
              <div className="text-gray-500 font-bold text-sm px-3">vs</div>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="font-bold text-white truncate text-right">{match.team2}</span>
              <span className="text-2xl">{match.team2Flag}</span>
            </div>
          </div>
          {/* User prediction */}
          {hasPred && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                📊 {pred.team1Score}-{pred.team2Score}
              </span>
              {pred.motm && <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">⭐ {pred.motm}</span>}
              {pred.firstScorer && <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">🥅 {pred.firstScorer}</span>}
            </div>
          )}
        </div>

        {/* Action */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-2 rounded-xl">🏁 Done</span>
          ) : (
            <Link
              href={`/predict/${match.id}`}
              className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                hasPred
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                  : "btn-gold"
              }`}
            >
              {hasPred ? "✏️ Edit" : "⚡ Predict"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
