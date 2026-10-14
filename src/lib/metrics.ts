export type WindowId = "7d" | "30d" | "season";
export type SortId = "standing" | "return" | "accuracy" | "recent";

export type PositionInput = {
  createdAt: number;
  settled: boolean;
  correct: boolean | null;
  stake: number;
  payout: number;
  category: string;
};

export type EntryInput = {
  createdAt: number;
  points: number;
  category: string;
};

export type Performance = {
  settled: number;
  correct: number;
  accuracy: number | null;
  settledStake: number;
  pnl: number;
  returnPct: number | null;
  recentSettled: number;
  recentCorrect: number;
  recentAccuracy: number | null;
  competitionPoints: number;
  openCalls: number;
  thin: boolean;
  ranked: boolean;
  score: number | null;
  parts: { accuracy: number; recent: number; rooms: number; return: number };
};

const DAY = 86400000;

export function windowMs(window: WindowId) {
  if (window === "7d") return 7 * DAY;
  if (window === "30d") return 30 * DAY;
  return null;
}

export function computePerformance(
  positions: PositionInput[],
  entries: EntryInput[],
  window: WindowId,
  category: string,
  now: number,
  minSettled = 4,
): Performance {
  const span = windowMs(window);
  const windowStart = span === null ? null : now - span;
  const inWindow = (t: number) => windowStart === null || t >= windowStart;
  const matches = (cat: string) => category === "all" || cat === category;

  const scoped = positions.filter((p) => inWindow(p.createdAt) && matches(p.category));
  const settledRows = scoped.filter((p) => p.settled);
  const settled = settledRows.length;
  const correct = settledRows.filter((p) => p.correct).length;
  const accuracy = settled === 0 ? null : correct / settled;
  const settledStake = settledRows.reduce((sum, p) => sum + p.stake, 0);
  const pnl = settledRows.reduce((sum, p) => sum + (p.payout - p.stake), 0);
  const returnPct = settledStake === 0 ? null : pnl / settledStake;
  const openCalls = scoped.filter((p) => !p.settled).length;

  const recentStart = window === "7d" && windowStart !== null ? windowStart : now - 14 * DAY;
  const recentRows = settledRows.filter((p) => p.createdAt >= recentStart);
  const recentSettled = recentRows.length;
  const recentCorrect = recentRows.filter((p) => p.correct).length;
  const recentAccuracy = recentSettled === 0 ? null : recentCorrect / recentSettled;

  const competitionPoints = entries
    .filter((e) => inWindow(e.createdAt) && matches(e.category))
    .reduce((sum, e) => sum + e.points, 0);

  const ranked = settled >= minSettled && accuracy !== null;
  const thin = settled > 0 && settled < 8;

  const acc = accuracy ?? 0;
  const recent = recentAccuracy ?? acc;
  const rooms = Math.min(competitionPoints, 100) / 100;
  const clamped = Math.max(-0.25, Math.min(0.4, returnPct ?? 0));
  const retScore = settledStake === 0 ? 0 : (clamped + 0.25) / 0.65;
  const parts = {
    accuracy: round1(acc * 50),
    recent: round1(recent * 20),
    rooms: round1(rooms * 20),
    return: round1(retScore * 10),
  };
  const score = ranked
    ? round1(parts.accuracy + parts.recent + parts.rooms + parts.return)
    : null;

  return {
    settled,
    correct,
    accuracy,
    settledStake,
    pnl,
    returnPct,
    recentSettled,
    recentCorrect,
    recentAccuracy,
    competitionPoints,
    openCalls,
    thin,
    ranked,
    score,
    parts,
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export const METHODOLOGY = [
  "Standing is a demonstration score out of 100. It is not a verified real-world record, and demo purse is never an input.",
  "50 points — accuracy on settled calls in the window.",
  "20 points — recent form. Last 14 days, or the whole window if you picked 7 days. If there is no recent call, this falls back to window accuracy.",
  "20 points — competition points earned in the window, capped at 100 before they enter the score.",
  "10 points — realized return, mapped from −25% to +40%. A longshot can still lead the return sort. It cannot buy the whole board.",
  "Four settled calls are required to rank. Fewer than eight is marked a thin record. The recent sort also wants three settled calls inside its recent slice.",
];
