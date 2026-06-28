import type { LockedPrediction } from "@/lib/queries";

export function calculatePoints(
  pick: string | null,
  result: string | null,
): number {
  if (!pick || !result) return 0;
  return pick === result ? 1 : 0;
}

export type ScoredPrediction = {
  pick: string;
  result: string | null;
};

export function sumPoints(preds: ScoredPrediction[]): number {
  return preds.reduce(
    (sum, p) => sum + calculatePoints(p.pick, p.result),
    0,
  );
}

export type Standing = {
  id: number;
  name: string;
  points: number;
  rank: number;
};

export function computeStandings(
  users: { id: number; name: string }[],
  lockedByMatch: Map<number, LockedPrediction[]>,
): Standing[] {
  const pointsByUser = new Map<number, number>();
  for (const preds of lockedByMatch.values()) {
    const result = preds[0]?.result;
    if (!result) continue;
    for (const p of preds) {
      if (p.pick === result) {
        pointsByUser.set(p.userId, (pointsByUser.get(p.userId) ?? 0) + 1);
      }
    }
  }

  const ranked = users
    .map((u) => ({
      id: u.id,
      name: u.name,
      points: pointsByUser.get(u.id) ?? 0,
      rank: 0,
    }))
    .sort((a, b) => b.points - a.points);

  let currentRank = 0;
  let prevPoints: number | null = null;
  let position = 0;
  for (const u of ranked) {
    position++;
    if (prevPoints === null || u.points !== prevPoints) {
      currentRank = position;
    }
    u.rank = currentRank;
    prevPoints = u.points;
  }

  return ranked;
}
