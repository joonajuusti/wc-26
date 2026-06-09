import type { Stage } from "@/lib/db/schema";

export const STAGE_POINTS: Record<Stage, number> = {
  group: 1,
  r32: 2,
  r16: 3,
  qf: 4,
  sf: 5,
  third: 4,
  final: 6,
};

export function calculatePoints(
  stage: Stage,
  pick: string | null,
  result: string | null,
): number {
  if (!pick || !result) return 0;
  return pick === result ? (STAGE_POINTS[stage] ?? 1) : 0;
}

export type ScoredPrediction = {
  stage: Stage;
  pick: string;
  result: string | null;
};

export function sumPoints(preds: ScoredPrediction[]): number {
  return preds.reduce(
    (sum, p) => sum + calculatePoints(p.stage, p.pick, p.result),
    0,
  );
}
