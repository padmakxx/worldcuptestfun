// Prediction window rules:
// - You can predict matches on TODAY and TOMORROW only
// - Predictions close 30 minutes before kickoff
// - Once a prediction is submitted, it is permanently locked (no edits)
// - Completed matches are always closed

// UTC offsets for WC 2026 host cities (June-July, DST in effect)
const TZ_OFFSETS: Record<string, number> = {
  CST: -6,  // Mexico City (no DST since 2023)
  CDT: -5,  // US Central Daylight
  ET:  -4,  // US Eastern Daylight
  EDT: -4,
  PT:  -7,  // US Pacific Daylight
  PDT: -7,
  MT:  -6,  // US Mountain Daylight
  MDT: -6,
};

// Parses "1:00 PM CST" + "2026-06-11" into a UTC Date
export function parseKickoffUtc(date: string, time: string): Date | null {
  const m = time.match(/^(\d+):(\d{2})\s*(AM|PM)\s*(\w+)$/i);
  if (!m) return null;
  let hour = parseInt(m[1]);
  const minute = parseInt(m[2]);
  const ampm = m[3].toUpperCase();
  const tz = m[4].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  const offsetHours = TZ_OFFSETS[tz];
  if (offsetHours === undefined) return null;
  // Construct UTC time: local time minus offset
  const utcMs = Date.UTC(
    parseInt(date.slice(0, 4)),
    parseInt(date.slice(5, 7)) - 1,
    parseInt(date.slice(8, 10)),
    hour - offsetHours,
    minute
  );
  return new Date(utcMs);
}

export function getPredictionWindow(): { today: string; tomorrow: string } {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];
  return { today, tomorrow };
}

// Returns true if predictions are still open for this match
// Closes 30 minutes before kickoff (or immediately if kickoff can't be parsed)
export function isMatchInPredictionWindow(matchDate: string, matchTime?: string): boolean {
  const { today, tomorrow } = getPredictionWindow();
  if (matchDate !== today && matchDate !== tomorrow) return false;

  if (matchTime) {
    const kickoff = parseKickoffUtc(matchDate, matchTime);
    if (kickoff) {
      const cutoff = new Date(kickoff.getTime() - 30 * 60 * 1000);
      if (new Date() >= cutoff) return false;
    }
  }

  return true;
}

// Returns minutes until predictions close (negative = already closed)
export function minutesUntilClose(matchDate: string, matchTime?: string): number | null {
  if (!matchTime) return null;
  const kickoff = parseKickoffUtc(matchDate, matchTime);
  if (!kickoff) return null;
  const cutoff = new Date(kickoff.getTime() - 30 * 60 * 1000);
  return Math.floor((cutoff.getTime() - Date.now()) / 60000);
}

export type Predictability =
  | "open"        // in window, no prediction yet
  | "locked"      // prediction already submitted
  | "too_early"   // match is beyond tomorrow
  | "closing_soon" // open but within 2 hours of cutoff
  | "closed";     // match completed or cutoff passed
