import { kget, kset, kgetall } from "./store";

export interface Prediction {
  userId: string;
  matchId: string;
  team1Score: number;
  team2Score: number;
  motm: string;
  firstScorer: string;
  submittedAt: string;
  points?: number;
  // Knockout tiebreaker predictions (only set for knockout matches when user predicted a draw)
  predictedPenalties?: boolean;
  penaltyTeam1?: number;
  penaltyTeam2?: number;
}

export interface MatchResult {
  matchId: string;
  team1Score: number;
  team2Score: number;
  motm: string;
  firstScorer: string;
  settledAt: string;
  // Knockout tiebreaker results
  wentToPenalties?: boolean;
  penaltyTeam1?: number;
  penaltyTeam2?: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  nickname: string;
  totalPoints: number;
  correctResults: number;
  exactScores: number;
  motmCorrect: number;
  firstScorerCorrect: number;
  bttsCorrect: number;
}

function getOutcome(t1: number, t2: number): "home" | "draw" | "away" {
  if (t1 > t2) return "home";
  if (t1 < t2) return "away";
  return "draw";
}

// Strips accents + lowercases — handles ESPN vs static list name differences
function normName(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function namesMatch(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const na = normName(a);
  const nb = normName(b);
  if (na === nb) return true;
  // One name contains the other: "vinicius junior" contains "vinicius jr" tokens
  if (na.includes(nb) || nb.includes(na)) return true;
  // Shared significant tokens (length > 3): "vinicius" appears in both
  const ta = na.split(/\s+/).filter(t => t.length > 3);
  const tb = new Set(nb.split(/\s+/).filter(t => t.length > 3));
  if (ta.some(t => tb.has(t))) return true;
  // Prefix/abbreviation matching: "jr" is a prefix of "junior"; "v." initial matches "vinicius"
  // Handles "V. Júnior" (ESPN) vs "Vinícius Jr" (user prediction)
  const ta2 = na.replace(/\./g, "").split(/\s+/).filter(t => t.length > 0);
  const tb2 = nb.replace(/\./g, "").split(/\s+/).filter(t => t.length > 0);
  return ta2.some(t => tb2.some(u =>
    (t.length >= 2 && u.startsWith(t)) || (u.length >= 2 && t.startsWith(u))
  ));
}

// matchId "m1"–"m72" = group stage (old rules); "m73"+ = knockout (new rules)
function isKnockoutMatch(matchId: string): boolean {
  const num = parseInt(matchId.replace("m", ""), 10);
  return num >= 73;
}

export function calculatePoints(pred: Prediction, result: MatchResult): number {
  let pts = 0;
  const predOutcome = getOutcome(pred.team1Score, pred.team2Score);
  const actualOutcome = getOutcome(result.team1Score, result.team2Score);

  if (isKnockoutMatch(pred.matchId)) {
    // New scoring — knockout stage (R32 onwards)
    if (predOutcome === actualOutcome) pts += 3;
    if (pred.team1Score === result.team1Score && pred.team2Score === result.team2Score) pts += 8;
    if (namesMatch(pred.motm, result.motm)) pts += 5;
    if (namesMatch(pred.firstScorer, result.firstScorer)) pts += 10;
    if (pred.team1Score > 0 && pred.team2Score > 0 && result.team1Score > 0 && result.team2Score > 0) pts += 2;

    // AET prediction: draw prediction == draw at 90 min → +5
    const predDraw = pred.team1Score === pred.team2Score;
    const actualDraw = result.team1Score === result.team2Score;
    if (predDraw === actualDraw) pts += 5;

    // Penalties prediction (only meaningful when user predicted a draw → AET)
    if (predDraw && pred.predictedPenalties !== undefined) {
      if (pred.predictedPenalties === (result.wentToPenalties ?? false)) pts += 8;
      // Exact penalty score
      if (
        pred.predictedPenalties && result.wentToPenalties &&
        pred.penaltyTeam1 !== undefined && pred.penaltyTeam2 !== undefined &&
        pred.penaltyTeam1 === result.penaltyTeam1 && pred.penaltyTeam2 === result.penaltyTeam2
      ) pts += 15;
    }
  } else {
    // Original scoring — group stage
    if (predOutcome === actualOutcome) pts += 1;
    if (pred.team1Score === result.team1Score && pred.team2Score === result.team2Score) pts += 4;
    if (namesMatch(pred.motm, result.motm)) pts += 3;
    if (namesMatch(pred.firstScorer, result.firstScorer)) pts += 5;
  }

  return pts;
}

export async function savePrediction(pred: Prediction): Promise<void> {
  await kset(`pred:${pred.userId}:${pred.matchId}`, pred);
}

export async function getPrediction(userId: string, matchId: string): Promise<Prediction | null> {
  return kget<Prediction>(`pred:${userId}:${matchId}`);
}

export async function getUserPredictions(userId: string): Promise<Prediction[]> {
  const all = await kgetall<Prediction>(`pred:${userId}:`);
  return Object.values(all);
}

export async function saveResult(result: MatchResult): Promise<void> {
  await kset(`result:${result.matchId}`, result);
}

export async function getResult(matchId: string): Promise<MatchResult | null> {
  return kget<MatchResult>(`result:${matchId}`);
}

export async function computeLeaderboard(users: { id: string; username: string; nickname: string }[]): Promise<LeaderboardEntry[]> {
  const entries: LeaderboardEntry[] = [];

  for (const user of users) {
    let totalPoints = 0;
    let correctResults = 0;
    let exactScores = 0;
    let motmCorrect = 0;
    let firstScorerCorrect = 0;
    let bttsCorrect = 0;

    const predictions = await kgetall<Prediction>(`pred:${user.id}:`);

    for (const pred of Object.values(predictions)) {
      const result = await getResult(pred.matchId);
      if (!result) continue;

      const predOutcome = getOutcome(pred.team1Score, pred.team2Score);
      const actualOutcome = getOutcome(result.team1Score, result.team2Score);
      if (predOutcome === actualOutcome) correctResults++;
      if (pred.team1Score === result.team1Score && pred.team2Score === result.team2Score) exactScores++;
      if (namesMatch(pred.motm, result.motm)) motmCorrect++;
      if (namesMatch(pred.firstScorer, result.firstScorer)) firstScorerCorrect++;
      if (pred.team1Score > 0 && pred.team2Score > 0 && result.team1Score > 0 && result.team2Score > 0) bttsCorrect++;

      totalPoints += calculatePoints(pred, result);
    }

    entries.push({ userId: user.id, username: user.username, nickname: user.nickname, totalPoints, correctResults, exactScores, motmCorrect, firstScorerCorrect, bttsCorrect });
  }

  return entries.sort((a, b) => b.totalPoints - a.totalPoints);
}
