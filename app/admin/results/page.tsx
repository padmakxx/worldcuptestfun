import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MATCHES } from "@/lib/data/matches";
import { kget } from "@/lib/store";
import Link from "next/link";
import ResultForm from "./ResultForm";

interface Props {
  searchParams: Promise<{ match?: string }>;
}

export default async function AdminResultsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/dashboard");

  const { match: selectedId } = await searchParams;

  const enriched = await Promise.all(
    MATCHES.map(async m => {
      const override = await kget<{ status: string; result?: { team1Score: number; team2Score: number; motm: string; firstScorer: string } }>(`match_status:${m.id}`);
      if (override) return { ...m, status: override.status as "upcoming" | "live" | "completed", result: override.result };
      return { ...m };
    })
  );

  const selectedMatch = selectedId ? enriched.find(m => m.id === selectedId) : null;

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{background:"rgba(10,14,26,0.95)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,215,0,0.1)"}}>
        <Link href="/admin" className="font-black text-xl text-white">⚽ <span className="gold-gradient">WC2026</span></Link>
        <Link href="/admin" className="text-sm text-gray-400 hover:text-white">← Admin</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-2">🏁 Match Results</h1>
        <p className="text-gray-400 mb-8">Enter final scores to calculate predictions</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Match list */}
          <div>
            <h2 className="font-bold text-white mb-4">All Matches</h2>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {enriched.map(m => {
                const dateStr = new Date(m.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const isSelected = selectedId === m.id;
                return (
                  <Link
                    key={m.id}
                    href={`?match=${m.id}`}
                    className={`block rounded-xl p-3 transition-all ${isSelected ? "bg-yellow-400/20 border border-yellow-400/40" : "card-glow"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400 mb-1">{dateStr} · Group {m.group}</div>
                      {m.status === "completed" ? (
                        <span className="text-xs text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">✅ Done</span>
                      ) : (
                        <span className="text-xs text-yellow-400 bg-yellow-500/15 px-2 py-0.5 rounded-full">⏰ Pending</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {m.team1Flag} {m.team1}
                      {m.status === "completed" && m.result
                        ? <span className="mx-2 font-black text-yellow-400">{m.result.team1Score}–{m.result.team2Score}</span>
                        : <span className="mx-2 text-gray-500">vs</span>
                      }
                      {m.team2} {m.team2Flag}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Result form */}
          <div>
            {selectedMatch ? (
              <ResultForm match={selectedMatch} />
            ) : (
              <div className="card-glow rounded-2xl p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">👈</div>
                <p>Select a match to enter the result</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
