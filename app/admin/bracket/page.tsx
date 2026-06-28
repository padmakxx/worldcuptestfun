import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MATCHES, getStageLabel } from "@/lib/data/matches";
import { kgetall } from "@/lib/store";
import Link from "next/link";
import BracketEditor from "./BracketEditor";

const ROUNDS = ["R32", "R16", "QF", "SF", "3PL", "F"];

export default async function AdminBracketPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/dashboard");

  const koTeams = await kgetall<{ team1: string; team1Flag: string; team2: string; team2Flag: string }>(`ko_teams:`);
  const knockoutMatches = MATCHES.filter(m => ROUNDS.includes(m.group));

  const enriched = knockoutMatches.map(m => {
    const override = koTeams[`ko_teams:${m.id}`] ?? null;
    return {
      ...m,
      team1: override?.team1 ?? m.team1,
      team1Flag: override?.team1Flag ?? m.team1Flag,
      team2: override?.team2 ?? m.team2,
      team2Flag: override?.team2Flag ?? m.team2Flag,
    };
  });

  const byRound: Record<string, typeof enriched> = {};
  for (const r of ROUNDS) {
    const ms = enriched.filter(m => m.group === r);
    if (ms.length > 0) byRound[r] = ms;
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ background: "rgba(10,14,26,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
        <Link href="/admin" className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <div className="flex items-center gap-3">
          <Link href="/admin/results" className="text-sm text-gray-300 hover:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-white/5">⚽ Results</Link>
          <Link href="/admin/users" className="text-sm text-gray-300 hover:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-white/5">👥 Users</Link>
          <Link href="/admin/predictions" className="text-sm text-gray-300 hover:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-white/5">🔮 Predictions</Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1.5 rounded-lg hover:bg-white/5">Logout</button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">🏆 Bracket Manager</h1>
          <p className="text-gray-400 mt-1">Set team names for each knockout match as results come in. Changes reflect instantly for all users.</p>
        </div>

        {Object.entries(byRound).map(([round, matches]) => (
          <section key={round} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-black text-white">{getStageLabel(round)}</h2>
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">{matches.length} match{matches.length !== 1 ? "es" : ""}</span>
            </div>
            <div className="space-y-3">
              {matches.map(m => (
                <BracketEditor key={m.id} match={m} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
