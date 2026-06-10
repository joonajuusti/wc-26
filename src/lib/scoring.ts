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
