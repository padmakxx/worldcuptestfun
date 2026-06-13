// ESPN public API integration for live scores and lineups

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";

export interface ESPNLiveScore {
  eventId: string;
  status: "pre" | "in" | "post";
  clock?: string;
  period?: number;
  team1Score: number;
  team2Score: number;
  team1Name: string;
  team2Name: string;
  detail?: string; // e.g. "45+2'" or "Half Time"
}

export interface ESPNPlayer {
  id: string;
  name: string;
  shortName: string;
  jersey: string;
  position: string;
  formationPlace: number;
  starter: boolean;
  team: string;
}

export interface ESPNLineup {
  eventId: string;
  team1: { name: string; formation: string; players: ESPNPlayer[] };
  team2: { name: string; formation: string; players: ESPNPlayer[] };
  fetchedAt: string;
}

// Team name normalizer — maps ESPN names to our names
const ESPN_TO_OURS: Record<string, string> = {
  "Korea Republic": "South Korea",
  "Czech Republic": "Czechia",
  "United States": "United States",
  "Bosnia-Herzegovina": "Bosnia and Herzegovina",
  "Bosnia Herzegovina": "Bosnia and Herzegovina",
  "Ivory Coast": "Ivory Coast",
  "Côte d'Ivoire": "Ivory Coast",
  "Congo DR": "DR Congo",
  "DR Congo": "DR Congo",
  "Curacao": "Curaçao",
  "Türkiye": "Turkey",
  "Turkiye": "Turkey",
};

export function normalizeTeamName(name: string): string {
  return ESPN_TO_OURS[name] ?? name;
}

export async function fetchESPNScoreboard(dateStr: string): Promise<ESPNLiveScore[]> {
  // dateStr format: YYYYMMDD
  const url = `${ESPN_BASE}/scoreboard?dates=${dateStr}`;
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = await res.json();
    const events = data.events ?? [];

    return events.map((ev: ESPNEvent) => {
      const competitors = ev.competitions?.[0]?.competitors ?? [];
      const home = competitors.find((c: ESPNCompetitor) => c.homeAway === "home");
      const away = competitors.find((c: ESPNCompetitor) => c.homeAway === "away");
      const status = ev.status?.type?.state ?? "pre";

      return {
        eventId: ev.id,
        status: status as "pre" | "in" | "post",
        clock: ev.status?.displayClock,
        period: ev.status?.period,
        detail: ev.status?.type?.detail,
        team1Score: parseInt(home?.score ?? "0"),
        team2Score: parseInt(away?.score ?? "0"),
        team1Name: normalizeTeamName(home?.team?.displayName ?? ""),
        team2Name: normalizeTeamName(away?.team?.displayName ?? ""),
      };
    });
  } catch {
    return [];
  }
}

export async function fetchESPNLineup(eventId: string): Promise<ESPNLineup | null> {
  const url = `${ESPN_BASE}/summary?event=${eventId}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();

    const rosters: ESPNRoster[] = data.rosters ?? [];
    if (rosters.length < 2) return null;

    const parseRoster = (roster: ESPNRoster): { name: string; formation: string; players: ESPNPlayer[] } => {
      const athletes = roster.roster ?? [];
      const starters = athletes.filter((a: ESPNAthlete) => a.starter);
      const bench = athletes.filter((a: ESPNAthlete) => !a.starter);

      const players: ESPNPlayer[] = [...starters, ...bench.slice(0, 4)].map((a: ESPNAthlete) => ({
        id: a.athlete?.id ?? "",
        name: a.athlete?.displayName ?? a.athlete?.fullName ?? "",
        shortName: a.athlete?.shortName ?? "",
        jersey: a.jersey ?? "",
        position: a.position?.abbreviation ?? a.position?.name ?? "",
        formationPlace: a.formationPlace ?? 0,
        starter: !!a.starter,
        team: normalizeTeamName(roster.team?.displayName ?? ""),
      }));

      // Detect formation from formation place count
      const starterPlaces = starters.map((a: ESPNAthlete) => a.formationPlace ?? 0).filter((n: number) => n > 0);
      const formation = detectFormation(starterPlaces, starters.map((a: ESPNAthlete) => a.position?.abbreviation ?? ""));

      return {
        name: normalizeTeamName(roster.team?.displayName ?? ""),
        formation,
        players,
      };
    };

    const home = rosters.find((r: ESPNRoster) => r.homeAway === "home") ?? rosters[0];
    const away = rosters.find((r: ESPNRoster) => r.homeAway === "away") ?? rosters[1];

    return {
      eventId,
      team1: parseRoster(home),
      team2: parseRoster(away),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function detectFormation(places: number[], positions: string[]): string {
  const fwdCount = positions.filter(p => ["FW", "CF", "ST", "LW", "RW", "SS"].includes(p)).length;
  const midCount = positions.filter(p => ["MF", "CM", "CAM", "CDM", "LM", "RM", "AM", "DM", "WM"].includes(p)).length;
  const defCount = positions.filter(p => ["DF", "CB", "LB", "RB", "LWB", "RWB", "SW"].includes(p)).length;
  if (defCount + midCount + fwdCount >= 10) return `${defCount}-${midCount}-${fwdCount}`;
  // fallback by formationPlace row detection
  if (places.length < 10) return "4-4-2";
  const rows = new Map<number, number>();
  places.forEach(p => { const row = Math.floor(p / 10); rows.set(row, (rows.get(row) ?? 0) + 1); });
  const sorted = [...rows.entries()].sort((a, b) => a[0] - b[0]);
  return sorted.slice(1).map(r => r[1]).join("-");
}

// Discover ESPN event IDs by date — matches our matches by team name
export async function discoverESPNEventId(team1: string, team2: string, date: string): Promise<string | null> {
  const dateStr = date.replace(/-/g, "");
  const scores = await fetchESPNScoreboard(dateStr);
  const match = scores.find(s =>
    (s.team1Name === team1 && s.team2Name === team2) ||
    (s.team1Name === team2 && s.team2Name === team1)
  );
  return match?.eventId ?? null;
}

// ESPN response types
interface ESPNEvent {
  id: string;
  status: { displayClock: string; period: number; type: { state: string; detail: string } };
  competitions: Array<{ competitors: ESPNCompetitor[] }>;
}
interface ESPNCompetitor {
  homeAway: string;
  score: string;
  team: { displayName: string };
}
interface ESPNRoster {
  homeAway: string;
  team: { displayName: string };
  roster: ESPNAthlete[];
}
interface ESPNAthlete {
  athlete: { id: string; displayName: string; fullName: string; shortName: string };
  jersey: string;
  position: { name: string; abbreviation: string };
  formationPlace: number;
  starter: boolean;
}
