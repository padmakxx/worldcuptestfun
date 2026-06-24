import { getSession, getAllUsers } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MATCHES } from "@/lib/data/matches";
import { kgetall, kmget } from "@/lib/store";
import { Prediction, MatchResult, calculatePoints, namesMatch } from "@/lib/scoring";
import Link from "next/link";

export default async function AdminPredictionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");

  const users = await getAllUsers();
  const approvedUsers = users.filter(u => u.approved && !u.isAdmin);

  // Bulk-fetch all match statuses and results in 2 calls
  const [allStatuses, allResults] = await Promise.all([
    kgetall<{ status: string; result?: { team1Score: number; team2Score: number; motm: string; firstScorer: string } }>(`match_status:`),
    kgetall<MatchResult>(`result:`),
  ]);

  const completedMatches = MATCHES
    .map(m => {
      const override =
        allStatuses[`match_status:${m.id}`] ??
        allStatuses[`match_status_${m.id}`] ??
        null;
      if (override?.status !== "completed") return null;
      const stored =
        allResults[`result:${m.id}`] ??
        allResults[`result_${m.id}`] ??
        null;
      if (!stored && !override.result) return null;
      const result: MatchResult = stored ?? {
        matchId: m.id,
        team1Score: override.result!.team1Score,
        team2Score: override.result!.team2Score,
        motm: override.result!.motm ?? "",
        firstScorer: override.result!.firstScorer ?? "",
        settledAt: "",
      };
      return { match: m, result };
    })
    .filter(Boolean) as { match: typeof MATCHES[0]; result: MatchResult }[];

  // One MGET for all predictions across all completed matches × users
  const predKeys = completedMatches.flatMap(({ match }) =>
    approvedUsers.map(u => `pred:${u.id}:${match.id}`)
  );
  const predValues = await kmget<Prediction>(predKeys);
  const predMap: Record<string, Prediction | null> = {};
  predKeys.forEach((k, i) => { predMap[k] = predValues[i]; });

  const matchData = completedMatches.map(({ match, result }) => ({
    match,
    result,
    preds: approvedUsers.map(u => ({
      user: u,
      pred: predMap[`pred:${u.id}:${match.id}`] ?? null,
    })),
  }));

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(10,14,26,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
        <div className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span> <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full ml-2">Admin</span></div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm text-gray-300 hover:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-white/5">← Dashboard</Link>
          <Link href="/admin/results" className="text-sm text-gray-300 hover:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-white/5">⚽ Results</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-2">🔮 Predictions</h1>
        <p className="text-gray-400 mb-8">All user predictions for completed matches</p>

        {matchData.length === 0 && (
          <div className="card-glow rounded-2xl p-10 text-center text-gray-400">
            No completed matches yet.
          </div>
        )}

        <div className="space-y-10">
          {matchData.map(({ match, result, preds }) => {
            const outcome = result.team1Score > result.team2Score ? "home" : result.team2Score > result.team1Score ? "away" : "draw";
            return (
              <div key={match.id} className="card-glow rounded-3xl overflow-hidden">
                {/* Match header */}
                <div className="p-5 border-b border-white/8" style={{ background: "rgba(255,215,0,0.04)" }}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        <span className="bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold mr-2">Group {match.group}</span>
                        {new Date(match.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="font-black text-white text-lg">
                        {match.team1Flag} {match.team1} vs {match.team2} {match.team2Flag}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">{result.team1Score} – {result.team2Score}</div>
                      <div className="text-xs text-gray-400 mt-0.5 space-y-0.5">
                        {result.motm
                          ? <div>⭐ MOTM: <span className="text-purple-300 font-semibold">{result.motm}</span></div>
                          : <div className="text-gray-600">⭐ MOTM: not set</div>}
                        {result.firstScorer
                          ? <div>🥅 1st Scorer: <span className="text-orange-300 font-semibold">{result.firstScorer}</span></div>
                          : <div className="text-gray-600">🥅 1st Scorer: not set</div>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Predictions table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-widest">
                        <th className="text-left px-5 py-3 font-semibold">Player</th>
                        <th className="text-center px-3 py-3 font-semibold">Score</th>
                        <th className="text-center px-3 py-3 font-semibold">Result</th>
                        <th className="text-center px-3 py-3 font-semibold">Exact</th>
                        <th className="text-left px-3 py-3 font-semibold">MOTM</th>
                        <th className="text-left px-3 py-3 font-semibold">1st Scorer</th>
                        <th className="text-center px-5 py-3 font-semibold">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4">
                      {preds.map(({ user, pred }) => {
                        if (!pred) {
                          return (
                            <tr key={user.id} className="opacity-40">
                              <td className="px-5 py-3 font-semibold text-gray-400">{user.nickname}</td>
                              <td className="px-3 py-3 text-center text-gray-600 italic text-xs" colSpan={6}>no prediction</td>
                            </tr>
                          );
                        }
                        const pts = calculatePoints(pred, result);
                        const predOutcome = pred.team1Score > pred.team2Score ? "home" : pred.team2Score > pred.team1Score ? "away" : "draw";
                        const correctResult = predOutcome === outcome;
                        const exactScore = pred.team1Score === result.team1Score && pred.team2Score === result.team2Score;
                        const correctMotm = namesMatch(pred.motm, result.motm);
                        const correctFirst = namesMatch(pred.firstScorer, result.firstScorer);

                        return (
                          <tr key={user.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-bold text-white">{user.nickname}</div>
                              <div className="text-xs text-gray-500">@{user.username}</div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`font-black text-base ${exactScore ? "text-yellow-400" : correctResult ? "text-emerald-400" : "text-gray-400"}`}>
                                {pred.team1Score}–{pred.team2Score}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              {correctResult ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-red-400 opacity-50">✗</span>}
                            </td>
                            <td className="px-3 py-3 text-center">
                              {exactScore ? <span className="text-yellow-400 font-bold">✓</span> : <span className="text-gray-600">–</span>}
                            </td>
                            <td className="px-3 py-3">
                              {pred.motm ? (
                                <span className={correctMotm ? "text-purple-300 font-semibold" : "text-gray-400"}>
                                  {correctMotm && "⭐ "}{pred.motm}
                                </span>
                              ) : <span className="text-gray-600 text-xs">–</span>}
                            </td>
                            <td className="px-3 py-3">
                              {pred.firstScorer ? (
                                <span className={correctFirst ? "text-orange-300 font-semibold" : "text-gray-400"}>
                                  {correctFirst && "🥅 "}{pred.firstScorer}
                                </span>
                              ) : <span className="text-gray-600 text-xs">–</span>}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className={`font-black text-lg ${pts > 0 ? "text-yellow-400" : "text-gray-600"}`}>
                                {pts > 0 ? `+${pts}` : "0"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
