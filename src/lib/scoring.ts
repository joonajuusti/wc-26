import { db } from "@/lib/db";
import { predictions, scoringRules, matches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function recalculateMatchPoints(matchId: number) {
  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);

  if (!match || !match.result) return;

  const [rule] = await db
    .select()
    .from(scoringRules)
    .where(eq(scoringRules.stage, match.stage))
    .limit(1);

  const points = rule?.points ?? 1;

  const matchPredictions = await db
    .select()
    .from(predictions)
    .where(eq(predictions.matchId, matchId));

  for (const pred of matchPredictions) {
    const earned = pred.pick === match.result ? points : 0;
    await db
      .update(predictions)
      .set({ pointsEarned: earned })
      .where(eq(predictions.id, pred.id));
  }
}

export async function getUserTotalPoints(userId: number): Promise<number> {
  const userPredictions = await db
    .select()
    .from(predictions)
    .where(eq(predictions.userId, userId));

  return userPredictions.reduce((sum, p) => sum + (p.pointsEarned ?? 0), 0);
}

export async function getUserCorrectCount(userId: number): Promise<number> {
  const userPredictions = await db
    .select()
    .from(predictions)
    .innerJoin(matches, eq(predictions.matchId, matches.id))
    .where(
      and(
        eq(predictions.userId, userId),
        eq(matches.result, predictions.pick)
      )
    );

  return userPredictions.length;
}
