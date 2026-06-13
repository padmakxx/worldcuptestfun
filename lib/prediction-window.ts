// Prediction window rules:
// - You can predict matches on TODAY and TOMORROW only
// - Once a prediction is submitted, it is permanently locked (no edits)
// - Completed matches are always closed

export function getPredictionWindow(): { today: string; tomorrow: string } {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];
  return { today, tomorrow };
}

export function isMatchInPredictionWindow(matchDate: string): boolean {
  const { today, tomorrow } = getPredictionWindow();
  return matchDate === today || matchDate === tomorrow;
}

export type Predictability =
  | "open"        // in window, no prediction yet
  | "locked"      // prediction already submitted
  | "too_early"   // match is beyond tomorrow
  | "closed";     // match completed or today passed with no prediction
