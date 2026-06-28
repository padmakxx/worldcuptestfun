import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden">

        {/* Deep background gradient */}
        <div className="absolute inset-0" style={{background:"linear-gradient(180deg,#020817 0%,#0a1628 40%,#071a0e 100%)"}} />

        {/* Animated pitch lines */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="absolute top-0 left-1/2 w-px h-full bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white" />
          <div className="absolute top-0 left-0 right-0 h-[28%] border-b border-white" />
          <div className="absolute bottom-0 left-0 right-0 h-[28%] border-t border-white" />
          <div className="absolute top-[28%] left-[15%] w-[12%] h-[16%] border border-white" />
          <div className="absolute top-[28%] right-[15%] w-[12%] h-[16%] border border-white" />
          <div className="absolute bottom-[28%] left-[15%] w-[12%] h-[16%] border border-white" />
          <div className="absolute bottom-[28%] right-[15%] w-[12%] h-[16%] border border-white" />
        </div>

        {/* Gold glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{background:"radial-gradient(ellipse,rgba(255,215,0,0.06) 0%,transparent 70%)"}} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{background:"radial-gradient(ellipse,rgba(16,185,129,0.07) 0%,transparent 70%)"}} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{background:"radial-gradient(ellipse,rgba(59,130,246,0.07) 0%,transparent 70%)"}} />

        {/* Legend silhouettes — Messi left, Ronaldo right, Neymar behind */}
        {/* These are pure CSS silhouettes — football player shapes */}
        <div className="absolute bottom-0 left-0 pointer-events-none select-none hidden lg:block" style={{width:"280px",height:"480px",opacity:0.08}}>
          <PlayerSilhouette side="left" />
        </div>
        <div className="absolute bottom-0 right-0 pointer-events-none select-none hidden lg:block" style={{width:"280px",height:"480px",opacity:0.08}}>
          <PlayerSilhouette side="right" />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none hidden xl:block" style={{width:"200px",height:"380px",opacity:0.04}}>
          <PlayerSilhouette side="center" />
        </div>

        {/* "One Last Dance" ribbon */}
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase"
            style={{background:"linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,215,0,0.04))",border:"1px solid rgba(255,215,0,0.25)",color:"#FFD700",letterSpacing:"0.15em"}}>
            <span className="live-badge w-2 h-2 bg-yellow-400 rounded-full inline-block" />
            ✨ One Last Dance · FIFA World Cup 2026
          </div>
        </div>

        {/* Prize Banner */}
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl text-sm font-bold"
            style={{background:"linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,165,0,0.08))",border:"1px solid rgba(255,215,0,0.35)"}}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥇</span>
              <div className="text-left">
                <div className="text-yellow-400 font-black text-base leading-tight">₹200</div>
                <div className="text-yellow-600 text-xs font-semibold">1st Place</div>
              </div>
            </div>
            <div className="w-px h-10 bg-yellow-600/30" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥈</span>
              <div className="text-left">
                <div className="text-gray-300 font-black text-base leading-tight">₹100</div>
                <div className="text-gray-500 text-xs font-semibold">2nd Place</div>
              </div>
            </div>
            <div className="w-px h-10 bg-yellow-600/30" />
            <div className="text-yellow-500/80 text-xs font-semibold">Overall Winner</div>
          </div>
        </div>

        {/* Main headline */}
        <div className="relative z-10 max-w-4xl">
          {/* Legend chips */}
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            {[
              { flag:"🇦🇷", name:"Messi", num:"10", color:"#74ade0" },
              { flag:"🇵🇹", name:"Ronaldo", num:"7",  color:"#d4a843" },
              { flag:"🇧🇷", name:"Neymar", num:"10", color:"#34d399" },
              { flag:"🇫🇷", name:"Mbappé",  num:"10", color:"#818cf8" },
              { flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", name:"Bellingham", num:"22", color:"#fb923c" },
            ].map(p => (
              <div key={p.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{background:`${p.color}15`,border:`1px solid ${p.color}30`,color:p.color}}>
                <span>{p.flag}</span>
                <span>{p.name}</span>
                <span className="opacity-60">#{p.num}</span>
              </div>
            ))}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-none tracking-tight">
            <span className="gold-gradient">Predict.</span>
            <br />
            <span className="text-white">Compete.</span>
            <br />
            <span style={{background:"linear-gradient(135deg,#10b981,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
              Win.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-3 max-w-2xl mx-auto leading-relaxed">
            The ultimate World Cup 2026 prediction game. Pick scores, MOTM, first scorers —
            every match, every group, one champion predictor.
          </p>
          <p className="text-gray-600 mb-10 text-sm">
            🇺🇸 USA · 🇨🇦 Canada · 🇲🇽 Mexico &nbsp;·&nbsp; Jun 11 – Jul 19, 2026
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold shadow-2xl">
              🚀 Join the Game
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold border border-white/15 text-white hover:bg-white/8 transition-all"
              style={{backdropFilter:"blur(10px)"}}>
              🔐 Sign In
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 animate-bounce text-xl">↓</div>
      </section>

      {/* ── POINTS SYSTEM ── */}
      <section className="py-20 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="text-xs font-bold tracking-widest text-yellow-500 uppercase mb-3">How It Works</div>
          <h2 className="text-3xl md:text-4xl font-black text-white">Every Correct Call = Points</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { pts:"+3",  label:"Correct Result",    sub:"Win / Draw / Loss",    icon:"✅", color:"#10b981" },
            { pts:"+11", label:"Exact Score",        sub:"+3 result +8 bonus",   icon:"🎯", color:"#FFD700" },
            { pts:"+5",  label:"Man of Match",       sub:"Your star pick",        icon:"⭐", color:"#a78bfa" },
            { pts:"+10", label:"First Scorer",       sub:"Who scores first",      icon:"🥅", color:"#fb923c" },
            { pts:"+2",  label:"Both Teams Score",   sub:"BTTS bonus",            icon:"⚽", color:"#22d3ee" },
          ].map(({ pts, label, sub, icon, color }) => (
            <div key={label} className="card-glow rounded-2xl p-6 text-center group hover:scale-105 transition-transform">
              <div className="text-3xl mb-3">{icon}</div>
              <div className="text-4xl font-black mb-2" style={{color}}>{pts}</div>
              <div className="font-bold text-white text-sm mb-1">{label}</div>
              <div className="text-xs text-gray-500">{sub}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <span className="text-gray-500 text-sm">Perfect match prediction = </span>
          <span className="font-black text-yellow-400 text-lg">28 points max</span>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-3">Features</div>
          <h2 className="text-3xl font-black text-white">Built for the Beautiful Game</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon:"📺", title:"Live Scores",       desc:"Real-time score updates while matches are in play" },
            { icon:"🗺️", title:"Lineup Formations", desc:"See starting XIs on a pitch with formation display" },
            { icon:"🏆", title:"Live Leaderboard",  desc:"Podium-style rankings updated after every match" },
            { icon:"🔐", title:"One-Shot Predict",  desc:"Lock it in — predictions can never be edited" },
            { icon:"🎨", title:"Custom Avatars",    desc:"Pick emoji, color & team flag to show your identity" },
            { icon:"📅", title:"Rolling Window",    desc:"Predict today's and tomorrow's matches only" },
          ].map(f => (
            <div key={f.title} className="card-glow rounded-2xl p-6 hover:border-yellow-400/20 transition-colors border border-transparent">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GROUPS ── */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-3">Tournament</div>
          <h2 className="text-3xl font-black text-white">12 Groups · 48 Teams · 104 Matches</h2>
        </div>
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
            <div key={group} className="card-glow rounded-xl p-4 hover:border-yellow-400/15 border border-transparent transition-colors">
              <div className="font-black text-yellow-400 mb-2">Group {group}</div>
              {teams.map(t => <div key={t} className="text-gray-400 text-xs py-0.5">{t}</div>)}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto card-glow rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse at 50% 0%,rgba(255,215,0,0.06) 0%,transparent 70%)"}} />
          <div className="text-6xl mb-4 trophy-bounce">🏆</div>
          <h2 className="text-3xl font-black text-white mb-3">Ready to Play?</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Register with a username and 6-digit PIN.<br/>
            Admin approves you and the predictions begin!
          </p>
          <Link href="/register" className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-bold">
            🎮 Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-gray-700 text-xs">
        ⚽ WC2026 Predictor · Group Stage: Jun 11 – Jun 27 · Knockouts: Jun 28 – Jul 19 · Final: Jul 19, 2026
      </footer>
    </div>
  );
}

function PlayerSilhouette({ side }: { side: "left" | "right" | "center" }) {
  const flip = side === "right" ? "scale-x-[-1]" : "";
  return (
    <svg viewBox="0 0 200 400" className={`w-full h-full ${flip}`} fill="white">
      {/* Head */}
      <circle cx="100" cy="40" r="28" />
      {/* Neck */}
      <rect x="90" y="65" width="20" height="20" rx="4" />
      {/* Body */}
      <path d="M55 85 Q100 75 145 85 L155 200 Q100 220 45 200 Z" />
      {/* Left arm raised */}
      <path d={side === "left"
        ? "M58 95 Q30 70 15 45 Q20 38 30 42 Q48 65 70 115"
        : "M58 95 Q40 120 30 160 Q22 165 18 158 Q30 112 55 88"
      } strokeWidth="22" stroke="white" fill="none" strokeLinecap="round" />
      {/* Right arm */}
      <path d={side === "right"
        ? "M142 95 Q170 70 185 45 Q180 38 170 42 Q152 65 130 115"
        : "M142 95 Q160 120 170 160 Q178 165 182 158 Q170 112 145 88"
      } strokeWidth="22" stroke="white" fill="none" strokeLinecap="round" />
      {/* Left leg */}
      <path d="M75 195 Q65 270 55 340 Q70 348 82 342 Q88 275 100 210" strokeWidth="26" stroke="white" fill="none" strokeLinecap="round" />
      {/* Right leg */}
      <path d="M125 195 Q135 270 145 340 Q130 348 118 342 Q112 275 100 210" strokeWidth="26" stroke="white" fill="none" strokeLinecap="round" />
      {/* Jersey number */}
      <text x="100" y="155" textAnchor="middle" fontSize="36" fontWeight="bold" fill="rgba(0,0,0,0.3)">
        {side === "left" ? "10" : side === "right" ? "7" : "10"}
      </text>
    </svg>
  );
}
