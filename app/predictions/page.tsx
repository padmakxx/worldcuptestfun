import { getSession, getUser, getAllUsers } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MATCHES } from "@/lib/data/matches";
import { calculatePoints, namesMatch } from "@/lib/scoring";
import { kgetall, kmget } from "@/lib/store";
import type { Prediction } from "@/lib/scoring";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import type { MatchResult } from "@/lib/scoring";


const PAGE_SIZE = 5;

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isAdmin) redirect("/admin");

  const user = await getUser(session.userId);
  if (!user?.approved) redirect("/dashboard");

  const params = await searchParams;
  const page = Math.max(1, parseInt((params.page as string) ?? "1", 10));

  const allUsers = (await getAllUsers()).filter(u => u.approved && !u.isAdmin);

  // 2 bulk calls instead of 73×2 individual ones to build the enriched match list
  const [allStatuses, allResults] = await Promise.all([
    kgetall<{ status: string }>(`match_status:`),
    kgetall<MatchResult>(`result:`),
  ]);

  const enriched = MATCHES.map(m => {
    // kgetall keys look like "match_status:N" in Redis and "match_status_N" in file dev
    const override =
      allStatuses[`match_status:${m.id}`] ??
      allStatuses[`match_status_${m.id}`] ??
      null;
    const status = override?.status ?? m.status;
    const result =
      allResults[`result:${m.id}`] ??
      allResults[`result_${m.id}`] ??
      null;
    return { ...m, status, result };
  });

  // Newest completed matches first
  const completedMatches = enriched.filter(m => m.status === "completed").reverse();
  const totalPages = Math.max(1, Math.ceil(completedMatches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageMatches = completedMatches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // One MGET for ALL predictions on this page: 5 × N_users keys in a single round-trip
  const predKeys = pageMatches.flatMap(m => allUsers.map(u => `pred:${u.id}:${m.id}`));
  const predValues = await kmget<Prediction>(predKeys);
  // Index by key for fast lookup
  const predMap: Record<string, Prediction> = {};
  predKeys.forEach((k, i) => { if (predValues[i]) predMap[k] = predValues[i]!; });

  const matchData = pageMatches.map(match => {
    const result = match.result as MatchResult | null;
    const predictions = allUsers
      .map(u => {
        const pred = predMap[`pred:${u.id}:${match.id}`];
        if (!pred) return null;
        let points = 0;
        let breakdown = { result: false, exact: false, motm: false, firstScorer: false };
        if (result) {
          points = calculatePoints(pred, result);
          const predOut = pred.team1Score > pred.team2Score ? "home" : pred.team1Score < pred.team2Score ? "away" : "draw";
          const actOut = result.team1Score > result.team2Score ? "home" : result.team1Score < result.team2Score ? "away" : "draw";
          breakdown = {
            result: predOut === actOut,
            exact: pred.team1Score === result.team1Score && pred.team2Score === result.team2Score,
            motm: namesMatch(pred.motm, result.motm),
            firstScorer: namesMatch(pred.firstScorer, result.firstScorer),
          };
        }
        return { user: u, pred, points, breakdown, isMe: u.id === session.userId };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    return { match, predictions };
  });

  const dateStr = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ background: "rgba(10,14,26,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
        <Link href="/dashboard" className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
          <Link href="/leaderboard" className="text-sm text-gray-300 hover:text-yellow-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">🏆 Board</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-white">📋 <span className="gold-gradient">Predictions</span></h1>
            <p className="text-gray-400 mt-1">See how everyone predicted completed matches</p>
          </div>
          {completedMatches.length > 0 && (
            <div className="text-sm text-gray-500 self-end pb-1">
              {completedMatches.length} completed match{completedMatches.length !== 1 ? "es" : ""}
            </div>
          )}
        </div>

        {completedMatches.length === 0 ? (
          <div className="card-glow rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-gray-400 text-lg">No completed matches yet. Check back after the first game!</p>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {matchData.map(({ match, predictions }) => (
                <div key={match.id} className="card-glow rounded-3xl overflow-hidden">
                  {/* Match header */}
                  <div className="px-6 py-5 border-b border-white/5" style={{ background: "rgba(255,215,0,0.03)" }}>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span className="bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">Group {match.group}</span>
                      <span>{dateStr(match.date)}</span>
                      <span className="text-gray-600">· {match.city}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{match.team1Flag}</span>
                        <span className="font-black text-white text-lg">{match.team1}</span>
                      </div>
                      {match.result && (
                        <div className="text-center px-4">
                          <div className="font-black text-2xl text-white">{match.result.team1Score} – {match.result.team2Score}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Final</div>
                          {match.result.motm && (
                            <div className="text-xs text-purple-400 mt-1">⭐ {match.result.motm}</div>
                          )}
                          {match.result.firstScorer && (
                            <div className="text-xs text-orange-400">🥅 {match.result.firstScorer}</div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <span className="font-black text-white text-lg">{match.team2}</span>
                        <span className="text-3xl">{match.team2Flag}</span>
                      </div>
                    </div>
                  </div>

                  {/* Predictions table */}
                  {predictions.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500 text-sm">No predictions were submitted for this match.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {predictions
                        .sort((a, b) => b.points - a.points)
                        .map(({ user: u, pred, points, breakdown, isMe }, idx) => (
                          <div key={u.id} className={`px-6 py-4 flex items-center gap-4 ${isMe ? "bg-yellow-400/5" : ""}`}>
                            <div className="w-6 text-center text-sm font-bold text-gray-500 flex-shrink-0">
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                            </div>
                            <div className="flex items-center gap-2 w-32 flex-shrink-0">
                              <Avatar nickname={u.nickname} avatar={u.avatar} supportedTeam={u.supportedTeam} avatarColor={u.avatarColor} size="sm" />
                              <span className={`text-sm font-bold truncate ${isMe ? "text-yellow-400" : "text-white"}`}>
                                {u.nickname}{isMe ? " (you)" : ""}
                              </span>
                            </div>
                            <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
                              <span className={`px-2.5 py-1 rounded-lg text-sm font-black ${breakdown.exact ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40" : breakdown.result ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-white/5 text-gray-400 border border-white/10"}`}>
                                {pred.team1Score}–{pred.team2Score}
                              </span>
                              {pred.motm && (
                                <span className={`px-2 py-0.5 rounded-lg text-xs ${breakdown.motm ? "bg-purple-500/30 text-purple-300 border border-purple-500/40" : "bg-white/5 text-gray-500 border border-white/10"}`}>
                                  ⭐ {pred.motm}
                                </span>
                              )}
                              {pred.firstScorer && (
                                <span className={`px-2 py-0.5 rounded-lg text-xs ${breakdown.firstScorer ? "bg-orange-500/30 text-orange-300 border border-orange-500/40" : "bg-white/5 text-gray-500 border border-white/10"}`}>
                                  🥅 {pred.firstScorer}
                                </span>
                              )}
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className={`text-lg font-black ${points >= 8 ? "text-yellow-400" : points >= 4 ? "text-emerald-400" : points > 0 ? "text-blue-400" : "text-gray-600"}`}>
                                +{points}
                              </div>
                              <div className="text-xs text-gray-600">pts</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                {safePage > 1 ? (
                  <Link
                    href={`/predictions?page=${safePage - 1}`}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    ← Newer
                  </Link>
                ) : (
                  <span className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 cursor-not-allowed" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                    ← Newer
                  </span>
                )}
                <span className="text-sm text-gray-400 px-2">Page {safePage} of {totalPages}</span>
                {safePage < totalPages ? (
                  <Link
                    href={`/predictions?page=${safePage + 1}`}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    Older →
                  </Link>
                ) : (
                  <span className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 cursor-not-allowed" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                    Older →
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
