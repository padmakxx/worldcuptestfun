import { getSession, getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MATCHES, getStageLabel, isKnockout } from "@/lib/data/matches";
import { kgetall, kmget } from "@/lib/store";
import type { Prediction } from "@/lib/scoring";
import { getPredictionWindow, isMatchInPredictionWindow, minutesUntilClose } from "@/lib/prediction-window";
import Link from "next/link";
import LiveScoreTicker from "@/components/LiveScoreTicker";
import Avatar from "@/components/Avatar";

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
  team1Qualifier?: string;
  team2Qualifier?: string;
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

  const [allStatuses, predValues, koTeams] = await Promise.all([
    kgetall<{ status: string; result?: { team1Score: number; team2Score: number; motm: string; firstScorer: string } }>(`match_status:`),
    kmget<Prediction>(MATCHES.map(m => `pred:${session.userId}:${m.id}`)),
    kgetall<{ team1: string; team1Flag: string; team2: string; team2Flag: string }>(`ko_teams:`),
  ]);

  const enriched: MatchWithOverride[] = MATCHES.map(m => {
    const override = allStatuses[`match_status:${m.id}`] ?? allStatuses[`match_status_${m.id}`] ?? null;
    const koOverride = koTeams[`ko_teams:${m.id}`] ?? null;
    let base: MatchWithOverride = override ? { ...m, status: override.status, result: override.result } : { ...m };
    if (koOverride) {
      base = { ...base, team1: koOverride.team1, team1Flag: koOverride.team1Flag, team2: koOverride.team2, team2Flag: koOverride.team2Flag };
    }
    return base;
  });

  const predMap: Record<string, { team1Score: number; team2Score: number; motm: string; firstScorer: string } | null> = {};
  MATCHES.forEach((m, i) => { predMap[m.id] = predValues[i] ? { ...predValues[i]! } : null; });

  const { today, tomorrow } = getPredictionWindow();
  // Prediction window = today + tomorrow
  const windowMatches = enriched.filter(m => m.status !== "completed" && isMatchInPredictionWindow(m.date, m.time));
  const completedMatches = enriched.filter(m => m.status === "completed").slice(-6).reverse();
  // Upcoming beyond the window (read-only preview) — group stage only
  const futureMatches = enriched
    .filter(m => m.status === "upcoming" && m.date > tomorrow && !isKnockout(m.group))
    .slice(0, 6);

  // Separate window matches by stage
  const groupWindowMatches = windowMatches.filter(m => !isKnockout(m.group));
  const knockoutWindowMatches = windowMatches.filter(m => isKnockout(m.group));

  // Upcoming knockout matches outside prediction window
  const upcomingKnockouts = enriched
    .filter(m => m.status !== "completed" && isKnockout(m.group) && !isMatchInPredictionWindow(m.date, m.time))
    .slice(0, 12);

  const totalPredicted = Object.values(predMap).filter(Boolean).length;
  const openForPrediction = windowMatches.filter(m => !predMap[m.id]).length;
  const hasKnockoutOpen = knockoutWindowMatches.length > 0;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <Link href="/dashboard" className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <div className="flex items-center gap-3">
          <Link href="/predictions" className="text-sm text-gray-300 hover:text-yellow-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">📋 Predictions</Link>
          <Link href="/leaderboard" className="text-sm text-gray-300 hover:text-yellow-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">🏆 Board</Link>
          <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar nickname={user.nickname} avatar={user.avatar} supportedTeam={user.supportedTeam} avatarColor={user.avatarColor} size="sm" />
          </Link>
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

        {/* Live Score Ticker */}
        <LiveScoreTicker date={today} />

        {/* Prediction window banner */}
        <div className="mb-6 rounded-2xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{background: hasKnockoutOpen ? "linear-gradient(135deg,rgba(239,68,68,0.08),rgba(239,68,68,0.03))" : "linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,215,0,0.03))", border: hasKnockoutOpen ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,215,0,0.15)"}}>
          <span className="text-xl">{hasKnockoutOpen ? "⚔️" : "📅"}</span>
          <div>
            <span className={`font-bold ${hasKnockoutOpen ? "text-red-400" : "text-yellow-400"}`}>{hasKnockoutOpen ? "Knockout Stage: " : "Prediction Window: "}</span>
            <span className="text-gray-300">{today} &amp; {tomorrow}</span>
          </div>
          <div className="ml-auto text-gray-500 text-xs">{openForPrediction} match{openForPrediction !== 1 ? "es" : ""} open</div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Locked In", value: totalPredicted, icon: "🔐", color: "text-emerald-400" },
            { label: "Open Now", value: openForPrediction, icon: "⚡", color: "text-yellow-400" },
            { label: "Settled", value: completedMatches.length, icon: "🏁", color: "text-blue-400" },
          ].map(s => (
            <div key={s.label} className="card-glow rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Group Stage matches open for prediction */}
        {groupWindowMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="live-badge w-2.5 h-2.5 bg-yellow-400 rounded-full inline-block" />
              Group Stage — Predict Now
              <span className="text-sm font-normal text-gray-400 ml-1">({today} &amp; {tomorrow})</span>
            </h2>
            <div className="space-y-3">
              {groupWindowMatches.map(m => (
                <MatchCard key={m.id} match={m} pred={predMap[m.id]} inWindow={true} minsLeft={minutesUntilClose(m.date, m.time)} />
              ))}
            </div>
          </section>
        )}

        {/* Knockout Stage matches open for prediction */}
        {knockoutWindowMatches.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="live-badge w-2.5 h-2.5 bg-red-400 rounded-full inline-block" />
                <h2 className="text-xl font-bold text-white">🔥 Knockout Stage — Predict Now</h2>
              </div>
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">No draws after 90 min</span>
            </div>
            <div className="space-y-3">
              {knockoutWindowMatches.map(m => (
                <MatchCard key={m.id} match={m} pred={predMap[m.id]} inWindow={true} minsLeft={minutesUntilClose(m.date, m.time)} />
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
                <MatchCard key={m.id} match={m} pred={predMap[m.id]} inWindow={false} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Up — group stage beyond window */}
        {futureMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">📅 Coming Up</h2>
            <p className="text-sm text-gray-500 mb-4">These open for prediction on their respective dates</p>
            <div className="space-y-2">
              {futureMatches.map(m => (
                <MatchCard key={m.id} match={m} pred={null} inWindow={false} />
              ))}
            </div>
          </section>
        )}

        {/* Knockout Bracket — upcoming knockout matches */}
        {upcomingKnockouts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">🏆 Knockout Bracket</h2>
            <p className="text-sm text-gray-500 mb-4">Opens for prediction on match day</p>
            <div className="space-y-2">
              {upcomingKnockouts.map(m => (
                <MatchCard key={m.id} match={m} pred={null} inWindow={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, pred, inWindow, minsLeft }: {
  match: MatchWithOverride;
  pred: { team1Score: number; team2Score: number; motm: string; firstScorer: string } | null;
  inWindow: boolean;
  minsLeft?: number | null;
}) {
  const isCompleted = match.status === "completed";
  const hasPred = !!pred;
  const knockout = isKnockout(match.group);
  const stageLabel = getStageLabel(match.group);
  const isTbd = match.team1 === "TBD" || match.team2 === "TBD";
  const dateStr = new Date(match.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // Action button state
  let actionBtn;
  if (isCompleted) {
    actionBtn = <span className="text-xs text-gray-500 bg-gray-800/80 px-3 py-2 rounded-xl">🏁 Final</span>;
  } else if (hasPred) {
    // Locked — click to view, no edit
    actionBtn = (
      <Link href={`/predict/${match.id}`}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all">
        🔐 Locked
      </Link>
    );
  } else if (!inWindow) {
    // Future match outside window
    actionBtn = (
      <span className="text-xs text-gray-600 border border-gray-700 px-3 py-2 rounded-xl">
        🕐 Opens {dateStr}
      </span>
    );
  } else {
    // Open — predict now
    actionBtn = (
      <Link href={`/predict/${match.id}`}
        className="btn-gold inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold">
        ⚡ Predict
      </Link>
    );
    if (minsLeft != null && minsLeft <= 60) {
      actionBtn = (
        <div className="flex flex-col items-end gap-1">
          <Link href={`/predict/${match.id}`}
            className="btn-gold inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold">
            ⚡ Predict
          </Link>
          <span className="text-xs text-red-400 font-semibold">⏰ Closes in {minsLeft}m</span>
        </div>
      );
    }
  }

  return (
    <div className={`card-glow rounded-2xl p-4 ${isCompleted ? "opacity-75" : ""} ${!inWindow && !isCompleted && !hasPred ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Teams */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full font-bold ${knockout ? "bg-red-500/20 text-red-400" : "bg-yellow-400/20 text-yellow-400"}`}>{stageLabel}</span>
            <span>{dateStr}</span>
            <span className="hidden sm:inline">{match.time}</span>
            <span className="text-gray-600 hidden sm:inline">· {match.city}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-2xl">{match.team1Flag}</span>
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{match.team1}</div>
                {isTbd && match.team1Qualifier && <div className="text-xs text-gray-500 truncate">{match.team1Qualifier}</div>}
              </div>
            </div>
            {isCompleted && match.result ? (
              <div className="text-center px-2 flex-shrink-0">
                <div className="font-black text-xl text-white">{match.result.team1Score} – {match.result.team2Score}</div>
                <div className="text-xs text-gray-500">Final</div>
              </div>
            ) : (
              <div className="text-gray-500 font-bold text-sm px-2 flex-shrink-0">vs</div>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <div className="font-bold text-white truncate">{match.team2}</div>
                {isTbd && match.team2Qualifier && <div className="text-xs text-gray-500 truncate">{match.team2Qualifier}</div>}
              </div>
              <span className="text-2xl">{match.team2Flag}</span>
            </div>
          </div>

          {/* User's locked-in prediction chips */}
          {hasPred && (
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                🔐 {pred.team1Score}–{pred.team2Score}
              </span>
              {pred.motm && <span className="bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full">⭐ {pred.motm}</span>}
              {pred.firstScorer && <span className="bg-orange-500/15 text-orange-300 px-2 py-0.5 rounded-full">🥅 {pred.firstScorer}</span>}
            </div>
          )}
        </div>

        {/* Action */}
        <div className="flex-shrink-0">{actionBtn}</div>
      </div>
    </div>
  );
}
