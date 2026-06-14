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
}

export interface MatchResult {
  matchId: string;
  team1Score: number;
  team2Score: number;
  motm: string;
  firstScorer: string;
  settledAt: string;
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
}

function getOutcome(t1: number, t2: number): "home" | "draw" | "away" {
  if (t1 > t2) return "home";
  if (t1 < t2) return "away";
  return "draw";
}

export function calculatePoints(pred: Prediction, result: MatchResult): number {
  let pts = 0;
  const predOutcome = getOutcome(pred.team1Score, pred.team2Score);
  const actualOutcome = getOutcome(result.team1Score, result.team2Score);

  if (predOutcome === actualOutcome) pts += 1;
  if (pred.team1Score === result.team1Score && pred.team2Score === result.team2Score) pts += 4;
  if (pred.motm && result.motm && pred.motm === result.motm) pts += 3;
  if (pred.firstScorer && result.firstScorer && pred.firstScorer === result.firstScorer) pts += 5;

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

    const predictions = await kgetall<Prediction>(`pred:${user.id}:`);

    for (const pred of Object.values(predictions)) {
      const result = await getResult(pred.matchId);
      if (!result) continue;

      const predOutcome = getOutcome(pred.team1Score, pred.team2Score);
      const actualOutcome = getOutcome(result.team1Score, result.team2Score);
      if (predOutcome === actualOutcome) correctResults++;
      if (pred.team1Score === result.team1Score && pred.team2Score === result.team2Score) exactScores++;
      if (pred.motm && result.motm && pred.motm === result.motm) motmCorrect++;
      if (pred.firstScorer && result.firstScorer && pred.firstScorer === result.firstScorer) firstScorerCorrect++;

      totalPoints += calculatePoints(pred, result);
    }

    entries.push({ userId: user.id, username: user.username, nickname: user.nickname, totalPoints, correctResults, exactScores, motmCorrect, firstScorerCorrect });
  }

  return entries.sort((a, b) => b.totalPoints - a.totalPoints);
}
