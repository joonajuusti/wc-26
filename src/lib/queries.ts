import { db } from "@/lib/db";
import { matches, teams, predictions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const groupByMatchId = <T extends { matchId: number }>(rows: T[]) =>
  Map.groupBy(rows, (r) => r.matchId);

export type LockedPrediction = {
  userId: number;
  pick: string;
  result: string | null;
  kickoffUtc: Date;
};

export async function getUsers() {
  return db.select().from(users).orderBy(users.name);
}

export async function getTeamsAndMatches() {
  const [allMatches, allTeams] = await Promise.all([
    db.select().from(matches).orderBy(matches.kickoffUtc),
    db.select().from(teams),
  ]);
  return { allMatches, allTeams };
}

export async function getUserPredictions(userId: number) {
  return db.select().from(predictions).where(eq(predictions.userId, userId));
}

export async function getLockedPredictions(): Promise<
  Map<number, LockedPrediction[]>
> {
  const rows = await db
    .select({
      matchId: predictions.matchId,
      userId: predictions.userId,
      pick: predictions.pick,
      result: matches.result,
      kickoffUtc: matches.kickoffUtc,
    })
    .from(predictions)
    .innerJoin(matches, eq(predictions.matchId, matches.id))
    .where(eq(matches.locked, true));
  return groupByMatchId(rows);
}

export async function isTournamentOver(): Promise<boolean> {
  const rows = await db.select({ result: matches.result }).from(matches);
  return rows.length > 0 && rows.every((r) => r.result !== null);
}
