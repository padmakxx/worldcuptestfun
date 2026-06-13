import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const features = [
    { icon: "⚽", title: "Predict Scores", desc: "Guess the exact scoreline for every group match" },
    { icon: "🌟", title: "Player to Shine", desc: "Pick the player you think will dominate the game" },
    { icon: "🏅", title: "Man of the Match", desc: "Who gets the golden glove tonight?" },
    { icon: "🚀", title: "First Scorer", desc: "Who breaks the deadlock? Extra points await!" },
    { icon: "🏆", title: "Live Leaderboard", desc: "Real-time rankings updated after every match" },
    { icon: "📊", title: "Smart Scoring", desc: "Points for result, exact score, MOTM, first scorer" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        {/* Pitch lines decoration */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-px h-full bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white" />
          <div className="absolute top-0 left-0 right-0 h-[30%] border-b border-white" />
          <div className="absolute bottom-0 left-0 right-0 h-[30%] border-t border-white" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="trophy-bounce text-7xl mb-6">🏆</div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full border border-emerald-500/30 mb-6">
            <span className="live-badge w-2 h-2 bg-emerald-400 rounded-full inline-block" />
            LIVE NOW · FIFA World Cup 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="gold-gradient">Predict.</span>{" "}
            <span className="text-white">Compete.</span>{" "}
            <span style={{background:"linear-gradient(135deg,#10b981,#059669)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Win.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
            The ultimate FIFA World Cup 2026 prediction game. 48 teams, 104 matches,
            one champion predictor.
          </p>
          <p className="text-gray-500 mb-10">
            🇺🇸 USA · 🇨🇦 Canada · 🇲🇽 Mexico &nbsp;|&nbsp; June 11 – July 19, 2026
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold shadow-lg"
            >
              🚀 Join the Game
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold border border-white/20 text-white hover:bg-white/10 transition-all"
            >
              🔐 Sign In
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 animate-bounce text-2xl">↓</div>
      </section>

      {/* Scoring System */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-2 gold-gradient">How Points Work</h2>
        <p className="text-center text-gray-400 mb-10">Every correct prediction earns you points</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { pts: "+3", label: "Correct Result", sub: "(Win/Draw/Loss)" },
            { pts: "+5", label: "Exact Score", sub: "(Bonus on top!)" },
            { pts: "+3", label: "Man of Match", sub: "(Your star pick)" },
            { pts: "+5", label: "First Scorer", sub: "(Who scores first)" },
          ].map(({ pts, label, sub }) => (
            <div key={label} className="card-glow rounded-2xl p-6 text-center">
              <div className="text-4xl font-black gold-gradient mb-2">{pts}</div>
              <div className="font-bold text-white mb-1">{label}</div>
              <div className="text-xs text-gray-400">{sub}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-4 text-sm">
          ✨ Exact score includes the +3 for correct result = up to <strong className="text-yellow-400">8 points</strong> per match prediction!
        </p>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-2 text-white">Everything You Need</h2>
        <p className="text-center text-gray-400 mb-10">Built for the beautiful game</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="card-glow rounded-2xl p-6">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Groups preview */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-10 text-white">
          12 Groups · 48 Teams · 104 Matches
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
          {[
            ["A","🇲🇽 Mexico","🇿🇦 S.Africa","🇰🇷 S.Korea","🇨🇿 Czechia"],
            ["B","🇨🇦 Canada","🇧🇦 Bosnia","🇶🇦 Qatar","🇨🇭 Switzerland"],
            ["C","🇧🇷 Brazil","🇲🇦 Morocco","🇭🇹 Haiti","🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland"],
            ["D","🇺🇸 USA","🇵🇾 Paraguay","🇦🇺 Australia","🇹🇷 Turkey"],
            ["E","🇩🇪 Germany","🇨🇼 Curaçao","🇨🇮 Ivory Coast","🇪🇨 Ecuador"],
            ["F","🇳🇱 Netherlands","🇯🇵 Japan","🇸🇪 Sweden","🇹🇳 Tunisia"],
            ["G","🇧🇪 Belgium","🇪🇬 Egypt","🇮🇷 Iran","🇳🇿 N.Zealand"],
            ["H","🇪🇸 Spain","🇨🇻 Cape Verde","🇸🇦 Saudi Arabia","🇺🇾 Uruguay"],
            ["I","🇫🇷 France","🇸🇳 Senegal","🇮🇶 Iraq","🇳🇴 Norway"],
            ["J","🇦🇷 Argentina","🇩🇿 Algeria","🇦🇹 Austria","🇯🇴 Jordan"],
            ["K","🇵🇹 Portugal","🇨🇩 DR Congo","🇺🇿 Uzbekistan","🇨🇴 Colombia"],
            ["L","🏴󠁧󠁢󠁥󠁮󠁧󠁿 England","🇭🇷 Croatia","🇬🇭 Ghana","🇵🇦 Panama"],
          ].map(([group, ...teams]) => (
            <div key={group} className="card-glow rounded-xl p-4">
              <div className="font-black text-yellow-400 text-lg mb-2">Group {group}</div>
              {teams.map(t => <div key={t} className="text-gray-300 text-xs py-0.5">{t}</div>)}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto card-glow rounded-3xl p-10">
          <div className="text-5xl mb-4">⚽</div>
          <h2 className="text-3xl font-black text-white mb-3">Ready to Play?</h2>
          <p className="text-gray-400 mb-6">Register with your username and 6-digit PIN. Admin will approve you and the game begins!</p>
          <Link href="/register" className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold">
            🎮 Get Started Free
          </Link>
        </div>
      </section>

      <footer className="py-6 text-center text-gray-600 text-sm">
        ⚽ WC2026 Predictor · Built with ❤️ for football fans · Group Stage: Jun 11 – Jun 27 · Final: Jul 19
      </footer>
    </div>
  );
}
