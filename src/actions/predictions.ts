"use server";

import { db } from "@/lib/db";
import { predictions, matches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { refresh } from "next/cache";

export async function savePrediction(matchId: number, pick: "1" | "X" | "2") {
  const user = await getSessionUser();
  if (!user) return { error: "Ei kirjautunut" };

  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .limit(1);

  if (match?.locked) return { error: "Veikkaus lukittu" };

  const [existing] = await db
    .select()
    .from(predictions)
    .where(
      and(
        eq(predictions.userId, user.id),
        eq(predictions.matchId, matchId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(predictions)
      .set({ pick })
      .where(eq(predictions.id, existing.id));
  } else {
    await db.insert(predictions).values({
      userId: user.id,
      matchId,
      pick,
    });
  }

  refresh();
  return { success: true };
}
