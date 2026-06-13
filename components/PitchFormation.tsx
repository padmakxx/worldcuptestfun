"use client";
import { ESPNLineup, ESPNPlayer } from "@/lib/espn";

interface Props {
  lineup: ESPNLineup;
  team1Flag: string;
  team2Flag: string;
}

// Map formationPlace 1-11 to (x%, y%) on the pitch
// formationPlace 1 = GK, then positions go outward
// We show team1 on bottom half, team2 on top half (flipped)
function getPosition(place: number, teamSide: "home" | "away", formation: string): { x: number; y: number } {
  // Parse formation e.g. "4-3-3" → [4, 3, 3]
  const rows = formation.split("-").map(Number).filter(n => n > 0);

  if (place === 1) {
    // GK
    return teamSide === "home"
      ? { x: 50, y: 88 }
      : { x: 50, y: 12 };
  }

  // Build row positions
  const positions: { x: number; y: number }[] = [];
  const rowCount = rows.length;

  rows.forEach((count, rowIdx) => {
    const yFrac = teamSide === "home"
      ? 1 - (rowIdx + 1) / (rowCount + 1)
      : (rowIdx + 1) / (rowCount + 1);
    const yPct = teamSide === "home"
      ? 75 - (rowIdx * (65 / rowCount))
      : 25 + (rowIdx * (65 / rowCount));

    for (let i = 0; i < count; i++) {
      const xPct = count === 1 ? 50 : 10 + (i * 80) / (count - 1);
      positions.push({ x: xPct, y: yPct });
    }
  });

  const idx = place - 2; // place 2 = first outfield player
  return positions[idx] ?? { x: 50, y: teamSide === "home" ? 60 : 40 };
}

function PlayerDot({ player, side, flag, formation }: {
  player: ESPNPlayer;
  side: "home" | "away";
  flag: string;
  formation: string;
}) {
  const pos = getPosition(player.formationPlace, side, formation);
  const isGK = player.position === "GK" || player.formationPlace === 1;
  const shortName = player.shortName || player.name.split(" ").pop() || player.name;

  const color = side === "home"
    ? isGK ? "#f59e0b" : "#3b82f6"
    : isGK ? "#f59e0b" : "#ef4444";

  return (
    <g transform={`translate(${pos.x}%, ${pos.y}%)`}>
      {/* Shadow */}
      <circle cx="0" cy="2" r="14" fill="rgba(0,0,0,0.3)" />
      {/* Player circle */}
      <circle cx="0" cy="0" r="14" fill={color} stroke="white" strokeWidth="2" />
      {/* Jersey number */}
      <text x="0" y="5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">
        {player.jersey || player.formationPlace}
      </text>
      {/* Name label */}
      <rect x="-22" y="17" width="44" height="13" rx="3" fill="rgba(0,0,0,0.75)" />
      <text x="0" y="27" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">
        {shortName.length > 10 ? shortName.slice(0, 9) + "." : shortName}
      </text>
    </g>
  );
}

export default function PitchFormation({ lineup, team1Flag, team2Flag }: Props) {
  const { team1, team2 } = lineup;
  const starters1 = team1.players.filter(p => p.starter).sort((a, b) => a.formationPlace - b.formationPlace);
  const starters2 = team2.players.filter(p => p.starter).sort((a, b) => a.formationPlace - b.formationPlace);
  const bench1 = team1.players.filter(p => !p.starter).slice(0, 7);
  const bench2 = team2.players.filter(p => !p.starter).slice(0, 7);

  return (
    <div className="w-full">
      {/* Formation badges */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{team1Flag}</span>
          <div>
            <div className="font-bold text-white text-sm">{team1.name}</div>
            <div className="text-xs text-yellow-400 font-bold">{team1.formation}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 font-bold">FORMATION</div>
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="font-bold text-white text-sm">{team2.name}</div>
            <div className="text-xs text-yellow-400 font-bold">{team2.formation}</div>
          </div>
          <span className="text-xl">{team2Flag}</span>
        </div>
      </div>

      {/* SVG Pitch */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: "transparent" }}>
        <svg
          viewBox="0 0 400 560"
          width="100%"
          style={{ display: "block" }}
        >
          {/* Pitch background */}
          <defs>
            <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a5c2a" />
              <stop offset="50%" stopColor="#1e6830" />
              <stop offset="100%" stopColor="#1a5c2a" />
            </linearGradient>
            {/* Stripe pattern */}
            <pattern id="stripes" x="0" y="0" width="100%" height="56" patternUnits="userSpaceOnUse">
              <rect width="400" height="28" fill="#1e6830" />
              <rect y="28" width="400" height="28" fill="#1a5c2a" />
            </pattern>
          </defs>

          {/* Pitch stripes */}
          <rect width="400" height="560" fill="url(#stripes)" rx="8" />

          {/* Pitch border */}
          <rect x="20" y="20" width="360" height="520" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" rx="4" />

          {/* Center line */}
          <line x1="20" y1="280" x2="380" y2="280" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />

          {/* Center circle */}
          <circle cx="200" cy="280" r="50" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <circle cx="200" cy="280" r="4" fill="rgba(255,255,255,0.6)" />

          {/* Top penalty box */}
          <rect x="100" y="20" width="200" height="80" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <rect x="150" y="20" width="100" height="35" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <circle cx="200" cy="86" r="30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
            strokeDasharray="none" clipPath="url(#topBox)" />
          <circle cx="200" cy="76" r="5" fill="rgba(255,255,255,0.5)" />

          {/* Bottom penalty box */}
          <rect x="100" y="460" width="200" height="80" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <rect x="150" y="505" width="100" height="35" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <circle cx="200" cy="484" r="5" fill="rgba(255,255,255,0.5)" />

          {/* Team labels */}
          <text x="200" y="255" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontWeight="bold">
            {team2.name.toUpperCase()}
          </text>
          <text x="200" y="315" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontWeight="bold">
            {team1.name.toUpperCase()}
          </text>

          {/* Team 2 players (top half - away) */}
          {starters2.map((p) => {
            const pos = getPositionAbsolute(p.formationPlace, "away", team2.formation, 400, 560);
            const shortName = p.shortName || p.name.split(" ").pop() || p.name;
            const isGK = p.position === "GK" || p.formationPlace === 1;
            return (
              <g key={`t2-${p.id}-${p.formationPlace}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle cx="0" cy="2" r="15" fill="rgba(0,0,0,0.3)" />
                <circle cx="0" cy="0" r="15" fill={isGK ? "#f59e0b" : "#ef4444"} stroke="white" strokeWidth="2.5" />
                <text x="0" y="5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">{p.jersey || p.formationPlace}</text>
                <rect x="-25" y="18" width="50" height="14" rx="4" fill="rgba(0,0,0,0.8)" />
                <text x="0" y="29" textAnchor="middle" fontSize="8.5" fill="white" fontWeight="600">
                  {shortName.length > 10 ? shortName.slice(0, 9) + "." : shortName}
                </text>
              </g>
            );
          })}

          {/* Team 1 players (bottom half - home) */}
          {starters1.map((p) => {
            const pos = getPositionAbsolute(p.formationPlace, "home", team1.formation, 400, 560);
            const shortName = p.shortName || p.name.split(" ").pop() || p.name;
            const isGK = p.position === "GK" || p.formationPlace === 1;
            return (
              <g key={`t1-${p.id}-${p.formationPlace}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle cx="0" cy="2" r="15" fill="rgba(0,0,0,0.3)" />
                <circle cx="0" cy="0" r="15" fill={isGK ? "#f59e0b" : "#3b82f6"} stroke="white" strokeWidth="2.5" />
                <text x="0" y="5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">{p.jersey || p.formationPlace}</text>
                <rect x="-25" y="18" width="50" height="14" rx="4" fill="rgba(0,0,0,0.8)" />
                <text x="0" y="29" textAnchor="middle" fontSize="8.5" fill="white" fontWeight="600">
                  {shortName.length > 10 ? shortName.slice(0, 9) + "." : shortName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>{team1Flag} {team1.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Goalkeeper</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>{team2Flag} {team2.name}</span>
        </div>
      </div>

      {/* Bench */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <BenchList title={`${team1Flag} ${team1.name} Bench`} players={bench1} color="blue" />
        <BenchList title={`${team2Flag} ${team2.name} Bench`} players={bench2} color="red" />
      </div>
    </div>
  );
}

function BenchList({ title, players, color }: { title: string; players: ESPNPlayer[]; color: "blue" | "red" }) {
  const bg = color === "blue" ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300";
  return (
    <div>
      <div className={`text-xs font-bold mb-2 px-2 py-1 rounded-lg ${bg} inline-block`}>{title}</div>
      <div className="space-y-1">
        {players.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-5 text-gray-600 text-right">{p.jersey}</span>
            <span className="text-gray-300">{p.name}</span>
            <span className="text-gray-600 ml-auto">{p.position}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getPositionAbsolute(place: number, side: "home" | "away", formation: string, W: number, H: number) {
  const rows = formation.split("-").map(Number).filter(n => n > 0);
  const half = H / 2;
  const margin = 30;
  const pitchH = half - margin;

  if (place === 1) {
    return side === "home"
      ? { x: W / 2, y: H - 40 }
      : { x: W / 2, y: 40 };
  }

  const positions: { x: number; y: number }[] = [];
  const rowCount = rows.length;

  rows.forEach((count, rowIdx) => {
    const yRatio = (rowIdx + 1) / (rowCount + 1);
    const yInHalf = margin + yRatio * pitchH;
    const y = side === "home" ? H - margin - yInHalf + margin : yInHalf;

    for (let i = 0; i < count; i++) {
      const xPct = count === 1 ? 0.5 : 0.1 + (i * 0.8) / (count - 1);
      positions.push({ x: W * xPct, y });
    }
  });

  const idx = place - 2;
  return positions[idx] ?? { x: W / 2, y: side === "home" ? H * 0.7 : H * 0.3 };
}
