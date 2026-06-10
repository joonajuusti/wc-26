import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { matches, teams, predictions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const getCachedTeamsAndMatches = unstable_cache(
  async () => {
    const [allMatches, allTeams] = await Promise.all([
      db.select().from(matches).orderBy(matches.kickoffUtc),
      db.select().from(teams),
    ]);
    return { allMatches, allTeams };
  },
  ["teams-and-matches"],
  { revalidate: 60 },
);

export async function getUserPredictions(userId: number) {
  return db.select().from(predictions).where(eq(predictions.userId, userId));
}
